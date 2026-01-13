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
    const { email, formData } = JSON.parse(event.body);
    
    if (!email || !formData) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email and formData are required' }),
      };
    }

    const sheet = await getSheet();
    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();
    
    const normalizedEmail = normalizeEmail(email);
    const timestamp = new Date().toISOString();
    
    // Find existing row
    const participantRow = rows.find(row => 
      normalizeEmail(row.get('email') || '') === normalizedEmail
    );
    
    if (participantRow) {
      // Update existing row
      // Only update team fields if provided (for team formation)
      if (formData.teamName !== undefined) {
        participantRow.set('team_name', formData.teamName.toLowerCase().trim());
      }
      if (formData.projectIdea !== undefined) {
        participantRow.set('project_idea', formData.projectIdea);
      }
      // Check-in fields
      if (formData.foodPreference !== undefined) {
        participantRow.set('food_preference', formData.foodPreference);
      }
      if (formData.foodNotes !== undefined) {
        participantRow.set('food_notes', formData.foodNotes || '');
      }
      if (formData.photoConsent !== undefined) {
        participantRow.set('photo_consent', formData.photoConsent ? 'yes' : 'no');
      }
      // New check-in fields
      if (formData.skills !== undefined) {
        participantRow.set('skills', formData.skills);
      }
      if (formData.hasOwnIdea !== undefined) {
        participantRow.set('has_own_idea', formData.hasOwnIdea ? 'yes' : 'no');
      }
      if (formData.initialIdea !== undefined) {
        participantRow.set('initial_idea', formData.initialIdea);
      }
      participantRow.set('checked_in_at', timestamp);
      
      await participantRow.save();
    } else {
      // Add new row
      await sheet.addRow({
        email: normalizedEmail,
        approval_status: 'approved',
        team_name: formData.teamName ? formData.teamName.toLowerCase().trim() : '',
        project_idea: formData.projectIdea || '',
        food_preference: formData.foodPreference || '',
        food_notes: formData.foodNotes || '',
        photo_consent: formData.photoConsent ? 'yes' : 'no',
        skills: formData.skills || '',
        has_own_idea: formData.hasOwnIdea ? 'yes' : 'no',
        initial_idea: formData.initialIdea || '',
        checked_in_at: timestamp
      });
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        timestamp 
      }),
    };
  } catch (error) {
    console.error('Error saving data:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to save participant data',
        details: error.message 
      }),
    };
  }
};

