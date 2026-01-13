const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

async function getSheet() {
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
    const sheet = await getSheet();
    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();
    
    // Get all approved participants
    const participants = rows
      .filter(row => {
        const approvalStatus = (row.get('approval_status') || '').toLowerCase();
        return approvalStatus === 'approved';
      })
      .map(row => ({
        email: row.get('email') || '',
        name: row.get('name') || row.get('full_name') || '',
        teamName: row.get('team_name') || '',
        hasCheckedIn: !!(row.get('checked_in_at') || row.get('skills')),
        hasOwnIdea: row.get('has_own_idea') === 'yes',
        skills: row.get('skills') || ''
      }));
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        participants,
        count: participants.length
      }),
    };
  } catch (error) {
    console.error('Error fetching participants:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch approved participants',
        details: error.message 
      }),
    };
  }
};

