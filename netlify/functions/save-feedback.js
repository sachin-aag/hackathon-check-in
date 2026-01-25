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
  
  // Get the Feedback sheet
  return doc.sheetsByTitle['Feedback'] || doc.sheetsByTitle['feedback'];
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
    const feedbackData = JSON.parse(event.body);
    
    // Debug logging
    console.log('Received feedback:', JSON.stringify(feedbackData, null, 2));
    
    // Validate required fields
    if (!feedbackData.email || !feedbackData.name) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email and name are required' }),
      };
    }

    const sheet = await getSheet();
    
    if (!sheet) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Feedback sheet not found. Please create a sheet named "Feedback".' }),
      };
    }

    await sheet.loadHeaderRow();
    
    const timestamp = new Date().toISOString();
    
    // Add new row with feedback data
    await sheet.addRow({
      name: feedbackData.name,
      email: feedbackData.email.toLowerCase().trim(),
      overall_score: feedbackData.overall_score,
      venue_score: feedbackData.venue_score,
      wifi_score: feedbackData.wifi_score,
      food_and_drinks_score: feedbackData.food_and_drinks_score,
      organisation_score: feedbackData.organisation_score,
      quality_of_peers_score: feedbackData.quality_of_peers_score,
      feedback: feedbackData.feedback || '',
      duration_feedback: feedbackData.duration_feedback || '',
      github_repo: feedbackData.github_repo || '',
      project_link: feedbackData.project_link || '',
      sponsor_list: feedbackData.sponsor_list || '',
      feedback_tools: feedbackData.feedback_tools || '',
      future_sponsors: feedbackData.future_sponsors || '',
      comments: feedbackData.comments || '',
      submitted_at: timestamp,
    });
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        timestamp 
      }),
    };
  } catch (error) {
    console.error('Error saving feedback:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to save feedback',
        details: error.message 
      }),
    };
  }
};
