const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

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
    const { judgeName, teamName } = event.queryStringParameters || {};

    if (!judgeName || !teamName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'judgeName and teamName are required' }),
      };
    }

    const sheet = await getScoresSheet();
    
    if (!sheet) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ exists: false }),
      };
    }

    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();
    
    // Find the most recent score for this judge+team combination
    let existingScore = null;
    for (const row of rows) {
      if (row.get('judge_name') === judgeName && row.get('team_name') === teamName) {
        existingScore = {
          technical: parseInt(row.get('technical'), 10),
          creativity: parseInt(row.get('creativity'), 10),
          presentation: parseInt(row.get('presentation'), 10),
          usefulness: parseInt(row.get('usefulness'), 10),
          notes: row.get('notes') || '',
          sponsors_used: row.get('sponsors_used') || '',
          timestamp: row.get('timestamp'),
        };
      }
    }

    if (existingScore) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ exists: true, score: existingScore }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ exists: false }),
    };
  } catch (error) {
    console.error('Error fetching score:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch score',
        details: error.message 
      }),
    };
  }
};

