const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

async function getSheet(sheetName) {
  const serviceAccountAuth = new JWT({
    email: SERVICE_ACCOUNT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
  await doc.loadInfo();
  
  // Find the specified sheet
  return doc.sheetsByTitle[sheetName];
}

function normalizeEmail(email) {
  return email.toLowerCase().trim();
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
    const { email } = JSON.parse(event.body);
    
    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email is required' }),
      };
    }

    const codesSheet = await getSheet('Codes');
    const participantsSheet = await getSheet('Participants') || await getSheet('participants');
    
    if (!codesSheet) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Codes sheet not found' }),
      };
    }

    await codesSheet.loadHeaderRow();
    const codeRows = await codesSheet.getRows();
    
    const normalizedEmail = normalizeEmail(email);
    
    // First, check if this email already has a code assigned in Codes tab
    const existingCodeRow = codeRows.find(row => 
      normalizeEmail(row.get('assigned_to') || '') === normalizedEmail
    );
    
    if (existingCodeRow) {
      const code = existingCodeRow.get('cursor_credit_code');
      
      // Also update Participants tab with the code
      if (participantsSheet) {
        await participantsSheet.loadHeaderRow();
        const participantRows = await participantsSheet.getRows();
        const participantRow = participantRows.find(row => 
          normalizeEmail(row.get('email') || '') === normalizedEmail
        );
        
        if (participantRow) {
          participantRow.set('cursor_credit_code', code);
          await participantRow.save();
        }
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          code: code,
          alreadyAssigned: true
        }),
      };
    }
    
    // Find the first unassigned code
    const unassignedRow = codeRows.find(row => 
      !row.get('assigned_to') || row.get('assigned_to').trim() === ''
    );
    
    if (!unassignedRow) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          code: null,
          message: 'No codes available at this time'
        }),
      };
    }
    
    // Assign the code to this email in Codes tab
    const assignedCode = unassignedRow.get('cursor_credit_code');
    unassignedRow.set('assigned_to', normalizedEmail);
    await unassignedRow.save();
    
    // Also write the code to Participants tab
    if (participantsSheet) {
      await participantsSheet.loadHeaderRow();
      const participantRows = await participantsSheet.getRows();
      const participantRow = participantRows.find(row => 
        normalizeEmail(row.get('email') || '') === normalizedEmail
      );
      
      if (participantRow) {
        participantRow.set('cursor_credit_code', assignedCode);
        await participantRow.save();
      }
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        code: assignedCode,
        alreadyAssigned: false
      }),
    };
  } catch (error) {
    console.error('Error assigning code:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to assign cursor credit code',
        details: error.message 
      }),
    };
  }
};

