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
  
  // Find the "Participants" tab (capital P), or fall back to first sheet
  return doc.sheetsByTitle['Participants'] || doc.sheetsByTitle['participants'] || doc.sheetsByIndex[0];
}

function normalizeEmail(email) {
  return email.toLowerCase().trim();
}

exports.handler = async (event) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight request
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

    const sheet = await getSheet();
    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();
    
    const normalizedEmail = normalizeEmail(email);
    
    // Log available headers for debugging
    const headerValues = sheet.headerValues;
    console.log('Available columns:', headerValues);
    
    // Find row with matching email (check multiple possible email column names)
    const participantRow = rows.find(row => {
      const rowEmail = row.get('email') || row.get('Email') || row.get('EMAIL') || '';
      return normalizeEmail(rowEmail) === normalizedEmail;
    });
    
    if (!participantRow) {
      console.log('No row found for email:', normalizedEmail);
      console.log('Sample emails in sheet:', rows.slice(0, 5).map(r => r.get('email') || r.get('Email') || 'N/A'));
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          approved: false, 
          existingData: null 
        }),
      };
    }
    
    // Check multiple possible column names for approval status
    const rawApprovalStatus = 
      participantRow.get('approval_status') || 
      participantRow.get('Approval Status') ||
      participantRow.get('approval') ||
      participantRow.get('Approval') ||
      participantRow.get('status') ||
      participantRow.get('Status') ||
      '';
    
    console.log('Raw approval status value:', JSON.stringify(rawApprovalStatus));
    console.log('All row data:', participantRow._rawData);
    
    const approvalStatus = rawApprovalStatus.toLowerCase().trim();
    const isApproved = approvalStatus === 'approved';
    
    console.log('Normalized approval status:', approvalStatus, 'isApproved:', isApproved);
    
    // Check if they have already completed check-in (has skills or food preference)
    const hasExistingData = participantRow.get('checked_in_at') || 
                           participantRow.get('skills') ||
                           participantRow.get('food_preference');
    
    let existingData = null;
    if (isApproved && hasExistingData) {
      existingData = {
        email: participantRow.get('email'),
        teamName: participantRow.get('team_name') || '',
        projectIdea: participantRow.get('project_idea') || '',
        foodPreference: participantRow.get('food_preference') || '',
        foodNotes: participantRow.get('food_notes') || '',
        photoConsent: participantRow.get('photo_consent') === 'yes',
        skills: participantRow.get('skills') || '',
        hasOwnIdea: participantRow.get('has_own_idea') === 'yes',
        initialIdea: participantRow.get('initial_idea') || '',
        lookingForTeammates: participantRow.get('looking_for_teammates') === 'yes',
        desiredSkills: participantRow.get('desired_skills') || '',
        openToOpportunities: participantRow.get('open_to_opportunities') === 'yes',
        timestamp: participantRow.get('checked_in_at') || '',
        cursorCode: participantRow.get('cursor_credit_code') || null
      };
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        approved: isApproved, 
        existingData 
      }),
    };
  } catch (error) {
    console.error('Error checking email:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to check email approval',
        details: error.message 
      }),
    };
  }
};

