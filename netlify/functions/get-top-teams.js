const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

// Helper functions for z-score normalization
function average(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

function standardDeviation(arr) {
  if (arr.length <= 1) return 0;
  const avg = average(arr);
  const squareDiffs = arr.map(val => Math.pow(val - avg, 2));
  return Math.sqrt(average(squareDiffs));
}

function groupBy(arr, key) {
  return arr.reduce((groups, item) => {
    const group = item[key];
    if (!groups[group]) groups[group] = [];
    groups[group].push(item);
    return groups;
  }, {});
}

// Z-score normalization per judge
function normalizeAndRankScores(rawScores) {
  if (rawScores.length === 0) return [];

  const byJudge = groupBy(rawScores, 'judge_name');
  
  const judgeStats = {};
  for (const [judge, scores] of Object.entries(byJudge)) {
    const totals = scores.map(s => s.total);
    judgeStats[judge] = {
      mean: average(totals),
      stdDev: standardDeviation(totals)
    };
  }
  
  const normalizedByTeam = {};
  for (const score of rawScores) {
    const { mean, stdDev } = judgeStats[score.judge_name];
    const zScore = stdDev > 0 ? (score.total - mean) / stdDev : 0;
    
    if (!normalizedByTeam[score.team_name]) {
      normalizedByTeam[score.team_name] = { zScores: [], rawScores: [] };
    }
    normalizedByTeam[score.team_name].zScores.push(zScore);
    normalizedByTeam[score.team_name].rawScores.push(score);
  }
  
  return Object.entries(normalizedByTeam)
    .map(([team, data]) => {
      const latestScore = data.rawScores.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      )[0];
      
      return {
        team_name: team,
        idea: latestScore?.idea || '',
        normalizedScore: average(data.zScores)
      };
    })
    .sort((a, b) => b.normalizedScore - a.normalizedScore);
}

async function getScoresSheet() {
  const serviceAccountAuth = new JWT({
    email: SERVICE_ACCOUNT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
  await doc.loadInfo();
  
  return doc.sheetsByTitle['Scores'];
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const sheet = await getScoresSheet();
    
    if (!sheet) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ teams: [] }),
      };
    }

    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();
    
    const scores = rows.map(row => ({
      judge_name: row.get('judge_name') || '',
      team_name: row.get('team_name') || '',
      idea: row.get('idea') || '',
      total: parseInt(row.get('total'), 10) || 0,
      timestamp: row.get('timestamp') || '',
    }));

    // Get top 6 teams by normalized score
    const rankedTeams = normalizeAndRankScores(scores);
    const top6 = rankedTeams.slice(0, 6);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ teams: top6 }),
    };
  } catch (error) {
    console.error('Error fetching top teams:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch top teams',
        details: error.message 
      }),
    };
  }
};

