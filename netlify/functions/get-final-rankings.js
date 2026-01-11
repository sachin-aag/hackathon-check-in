const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

// Helper functions
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

// Z-score normalization to identify top 6
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
        normalizedScore: average(data.zScores),
        rawScores: data.rawScores
      };
    })
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
    
    // Get scores
    const scoresSheet = doc.sheetsByTitle['Scores'];
    if (!scoresSheet) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ rankings: [], totalVotes: 0 }),
      };
    }

    await scoresSheet.loadHeaderRow();
    const scoreRows = await scoresSheet.getRows();
    
    const scores = scoreRows.map(row => ({
      judge_name: row.get('judge_name') || '',
      team_name: row.get('team_name') || '',
      idea: row.get('idea') || '',
      total: parseInt(row.get('total'), 10) || 0,
      timestamp: row.get('timestamp') || '',
    }));

    // Get top 6 teams
    const rankedTeams = normalizeAndRankScores(scores);
    const top6Teams = rankedTeams.slice(0, 6).map(t => t.team_name);

    // Get votes
    const votesSheet = doc.sheetsByTitle['Votes'];
    let votes = [];
    if (votesSheet) {
      await votesSheet.loadHeaderRow();
      const voteRows = await votesSheet.getRows();
      votes = voteRows.map(row => ({
        email: row.get('email') || '',
        team_voted_for: row.get('team_voted_for') || '',
      }));
    }

    // Step 1: Calculate each judge's mean and stddev across ALL their scores
    // This allows us to remove judge bias even if judges scored different teams
    const byJudge = groupBy(scores, 'judge_name');
    const judgeStats = {};
    for (const [judge, judgeScoresList] of Object.entries(byJudge)) {
      const totals = judgeScoresList.map(s => s.total);
      judgeStats[judge] = {
        mean: average(totals),
        stdDev: standardDeviation(totals)
      };
    }

    // Step 2: For each top 6 team, convert scores to z-scores then average
    const judgeScores = {};
    for (const team of top6Teams) {
      const teamScores = scores.filter(s => s.team_name === team);
      const judgeNames = [...new Set(teamScores.map(s => s.judge_name))];
      
      // Convert each score to z-score based on that judge's stats
      const zScores = teamScores.map(s => {
        const { mean, stdDev } = judgeStats[s.judge_name];
        return stdDev > 0 ? (s.total - mean) / stdDev : 0;
      });
      
      judgeScores[team] = {
        zAvg: average(zScores),
        rawAvg: average(teamScores.map(s => s.total)),
        judgeCount: judgeNames.length,
        judges: judgeNames
      };
    }

    // Step 3: Min-max normalize the z-score averages to get 0-1 range
    // This allows fair combination with vote percentages
    const zAvgs = Object.values(judgeScores).map(s => s.zAvg);
    const minZ = Math.min(...zAvgs);
    const maxZ = Math.max(...zAvgs);
    const zRange = maxZ - minZ;
    
    for (const team of top6Teams) {
      judgeScores[team].normalized = zRange > 0 
        ? (judgeScores[team].zAvg - minZ) / zRange 
        : 0.5; // Default to 0.5 if all z-scores are equal
    }

    // Count votes per team
    const voteCounts = {};
    for (const vote of votes) {
      if (top6Teams.includes(vote.team_voted_for)) {
        voteCounts[vote.team_voted_for] = (voteCounts[vote.team_voted_for] || 0) + 1;
      }
    }
    const totalVotes = votes.filter(v => top6Teams.includes(v.team_voted_for)).length;

    // Get ideas for top 6
    const teamIdeas = {};
    for (const ranked of rankedTeams.slice(0, 6)) {
      teamIdeas[ranked.team_name] = ranked.idea;
    }

    // Calculate final scores
    const finalRankings = top6Teams.map(team => {
      const voteCount = voteCounts[team] || 0;
      const votePercent = totalVotes > 0 ? voteCount / totalVotes : 0;
      const judgeNormalized = judgeScores[team].normalized;
      const finalScore = (judgeNormalized * 0.5) + (votePercent * 0.5);

      return {
        team,
        idea: teamIdeas[team] || '',
        judgeScore: judgeNormalized,
        judgeZAvg: judgeScores[team].zAvg,
        judgeRaw: judgeScores[team].rawAvg,
        judgeCount: judgeScores[team].judgeCount,
        judges: judgeScores[team].judges,
        votes: voteCount,
        votePercent,
        finalScore
      };
    });

    // Sort by final score
    finalRankings.sort((a, b) => b.finalScore - a.finalScore);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        rankings: finalRankings,
        totalVotes,
        top6Teams
      }),
    };
  } catch (error) {
    console.error('Error fetching final rankings:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch final rankings',
        details: error.message 
      }),
    };
  }
};

