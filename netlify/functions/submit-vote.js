const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

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

async function getVotesSheet(doc) {
  let sheet = doc.sheetsByTitle['Votes'];
  
  if (!sheet) {
    // Create the Votes sheet with headers
    sheet = await doc.addSheet({
      title: 'Votes',
      headerValues: ['email', 'team_voted_for', 'timestamp']
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
    const { email, teamVotedFor } = JSON.parse(event.body);

    // Validate required fields
    if (!email || !teamVotedFor) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email and team selection are required' }),
      };
    }

    const normalizedEmail = email.toLowerCase().trim();
    const doc = await getDoc();

    // 1. Check if email is a checked-in participant
    const mainSheet = doc.sheetsByIndex[0]; // First sheet is check-in sheet
    await mainSheet.loadHeaderRow();
    const participants = await mainSheet.getRows();
    
    const isParticipant = participants.some(row => {
      const rowEmail = row.get('email')?.toLowerCase().trim();
      const teamName = row.get('team_name');
      return rowEmail === normalizedEmail && teamName;
    });

    if (!isParticipant) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ 
          error: 'Email not found. You must be a checked-in participant to vote.' 
        }),
      };
    }

    // 2. Check if already voted
    const votesSheet = await getVotesSheet(doc);
    await votesSheet.loadHeaderRow();
    const votes = await votesSheet.getRows();
    
    const hasVoted = votes.some(row => 
      row.get('email')?.toLowerCase().trim() === normalizedEmail
    );

    if (hasVoted) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({ error: 'You have already voted.' }),
      };
    }

    // 3. Save the vote
    const timestamp = new Date().toISOString();
    await votesSheet.addRow({
      email: normalizedEmail,
      team_voted_for: teamVotedFor,
      timestamp
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: `Vote for ${teamVotedFor} recorded successfully!`
      }),
    };
  } catch (error) {
    console.error('Error submitting vote:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to submit vote',
        details: error.message 
      }),
    };
  }
};

