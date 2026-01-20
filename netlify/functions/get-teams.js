const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

async function getParticipantsSheet() {
  const serviceAccountAuth = new JWT({
    email: SERVICE_ACCOUNT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
  await doc.loadInfo();
  
  return doc.sheetsByTitle['Participants'] || doc.sheetsByTitle['participants'] || doc.sheetsByIndex[0];
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
    const sheet = await getParticipantsSheet();
    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();
    
    // Get unique team names (non-empty)
    const teamNames = new Set();
    rows.forEach(row => {
      const teamName = row.get('team_name');
      if (teamName && teamName.trim()) {
        teamNames.add(teamName.trim());
      }
    });
    
    // Sort alphabetically
    const teams = Array.from(teamNames).sort((a, b) => 
      a.toLowerCase().localeCompare(b.toLowerCase())
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ teams }),
    };
  } catch (error) {
    console.error('Error fetching teams:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch teams',
        details: error.message 
      }),
    };
  }
};



