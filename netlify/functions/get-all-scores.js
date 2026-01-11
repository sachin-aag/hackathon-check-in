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
    const sheet = await getScoresSheet();
    
    if (!sheet) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ scores: [] }),
      };
    }

    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();
    
    // Map all rows to score objects
    const scores = rows.map(row => ({
      judge_name: row.get('judge_name') || '',
      team_name: row.get('team_name') || '',
      idea: row.get('idea') || '',
      technical: parseInt(row.get('technical'), 10) || 0,
      creativity: parseInt(row.get('creativity'), 10) || 0,
      presentation: parseInt(row.get('presentation'), 10) || 0,
      usefulness: parseInt(row.get('usefulness'), 10) || 0,
      total: parseInt(row.get('total'), 10) || 0,
      timestamp: row.get('timestamp') || '',
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ scores }),
    };
  } catch (error) {
    console.error('Error fetching all scores:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch scores',
        details: error.message 
      }),
    };
  }
};

