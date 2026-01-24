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
    .map(([team, data]) => ({
      team_name: team,
      normalizedScore: average(data.zScores)
    }))
    .sort((a, b) => b.normalizedScore - a.normalizedScore);
}

async function getDoc() {
  const serviceAccountAuth = new JWT({
    email: SERVICE_ACCOUNT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
  await doc.loadInfo();
  
  return doc;
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
    const doc = await getDoc();
    const scoresSheet = doc.sheetsByTitle['Scores'];
    const participantsSheet = doc.sheetsByTitle['Participants'] || doc.sheetsByTitle['participants'] || doc.sheetsByIndex[0];
    
    if (!scoresSheet) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ teams: [] }),
      };
    }

    // Load scores
    await scoresSheet.loadHeaderRow();
    const scoreRows = await scoresSheet.getRows();
    
    const scores = scoreRows.map(row => ({
      judge_name: row.get('judge_name') || '',
      team_name: row.get('team_name') || '',
      total: parseInt(row.get('total'), 10) || 0,
      timestamp: row.get('timestamp') || '',
    }));

    // Get ranked teams by normalized score
    const rankedTeams = normalizeAndRankScores(scores);
    
    // Manual overrides for voting display
    const excludeFromVoting = ['legend of emilia']; // Teams to exclude (lowercase)
    const includeInVoting = ['hackmybios']; // Teams to manually include (lowercase)
    
    // Filter out excluded teams and get top teams
    const filteredTeams = rankedTeams.filter(t => 
      !excludeFromVoting.includes(t.team_name.toLowerCase())
    );
    
    // Get top 6 from filtered list
    let top6Teams = filteredTeams.slice(0, 6);
    
    // Check if manually included teams are already in top 6
    for (const includeName of includeInVoting) {
      const alreadyIncluded = top6Teams.some(t => t.team_name.toLowerCase() === includeName);
      if (!alreadyIncluded) {
        // Find this team in the full ranked list and add it
        const teamToAdd = rankedTeams.find(t => t.team_name.toLowerCase() === includeName);
        if (teamToAdd && top6Teams.length >= 6) {
          // Replace the 6th team with the manually included team
          top6Teams = [...top6Teams.slice(0, 5), teamToAdd];
        } else if (teamToAdd) {
          top6Teams.push(teamToAdd);
        }
      }
    }
    
    const top6TeamNames = top6Teams.map(t => t.team_name.toLowerCase());

    // Load team descriptions from Participants sheet
    const teamDescriptions = {};
    if (participantsSheet) {
      await participantsSheet.loadHeaderRow();
      const participantRows = await participantsSheet.getRows();
      
      for (const row of participantRows) {
        const teamName = (row.get('team_name') || '').toLowerCase();
        const projectIdea = row.get('project_idea') || '';
        
        // Only store if team is in top 6 and has a description
        if (teamName && top6TeamNames.includes(teamName) && projectIdea) {
          // Use the first non-empty description found for this team
          if (!teamDescriptions[teamName]) {
            teamDescriptions[teamName] = projectIdea;
          }
        }
      }
    }

    // Combine rankings with team descriptions
    const top6 = top6Teams.map(team => ({
      team_name: team.team_name,
      idea: teamDescriptions[team.team_name.toLowerCase()] || '',
      normalizedScore: team.normalizedScore
    }));

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
