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
  
  // Get or create Scores sheet
  let sheet = doc.sheetsByTitle['Scores'];
  
  if (!sheet) {
    // Create the Scores sheet with headers
    sheet = await doc.addSheet({
      title: 'Scores',
      headerValues: ['timestamp', 'judge_name', 'team_name', 'technical', 'creativity', 'presentation', 'usefulness', 'total', 'sponsors_used', 'notes']
    });
  }
  
  return sheet;
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { judgeName, teamName, technical, creativity, presentation, usefulness, notes, sponsors_used } = JSON.parse(event.body);

    // Validate required fields
    if (!judgeName || !teamName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Judge name and team name are required' }),
      };
    }

    // Validate scores are numbers 1-10
    const scores = { technical, creativity, presentation, usefulness };
    for (const [key, value] of Object.entries(scores)) {
      if (typeof value !== 'number' || value < 1 || value > 10) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `${key} must be a number between 1 and 10` }),
        };
      }
    }

    const total = technical + creativity + presentation + usefulness;
    const timestamp = new Date().toISOString();

    const sheet = await getScoresSheet();
    
    // Load existing rows to check for existing score
    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();
    
    // Find existing row for this judge+team combination
    let existingRow = null;
    for (const row of rows) {
      if (row.get('judge_name') === judgeName && row.get('team_name') === teamName) {
        existingRow = row;
        break;
      }
    }
    
    if (existingRow) {
      // Update existing row
      existingRow.set('timestamp', timestamp);
      existingRow.set('technical', technical);
      existingRow.set('creativity', creativity);
      existingRow.set('presentation', presentation);
      existingRow.set('usefulness', usefulness);
      existingRow.set('total', total);
      existingRow.set('sponsors_used', sponsors_used || '');
      existingRow.set('notes', notes || '');
      await existingRow.save();
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          message: `Score updated for ${teamName}`
        }),
      };
    } else {
      // Add new row
      await sheet.addRow({
        timestamp,
        judge_name: judgeName,
        team_name: teamName,
        technical,
        creativity,
        presentation,
        usefulness,
        total,
        sponsors_used: sponsors_used || '',
        notes: notes || ''
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          message: `Score saved for ${teamName}`
        }),
      };
    }
  } catch (error) {
    console.error('Error saving score:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to save score',
        details: error.message 
      }),
    };
  }
};

