const JUDGE_SECRET_CODE = process.env.JUDGE_SECRET_CODE;

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
    const { code } = JSON.parse(event.body);

    if (!code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Code is required' }),
      };
    }

    const isValid = code === JUDGE_SECRET_CODE;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ valid: isValid }),
    };
  } catch (error) {
    console.error('Error verifying judge code:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to verify code' }),
    };
  }
};


