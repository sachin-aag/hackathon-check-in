// API endpoint for Netlify functions
const API_BASE = import.meta.env.DEV 
  ? 'http://localhost:8888/.netlify/functions'  // Local Netlify dev server
  : '/.netlify/functions';                        // Production

/**
 * Normalize email to lowercase for consistent matching
 */
function normalizeEmail(email) {
  return email.toLowerCase().trim();
}

/**
 * Check if an email is approved and return participant data if exists
 * @param {string} email - The participant's email
 * @returns {Promise<{approved: boolean, existingData: object|null}>}
 */
export async function checkEmailApproval(email) {
  try {
    const response = await fetch(`${API_BASE}/check-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: normalizeEmail(email) }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to check email');
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking email approval:', error);
    throw new Error('Failed to connect to the server. Please try again.');
  }
}

/**
 * Get participant data for a given email
 * @param {string} email - The participant's email
 * @returns {Promise<object|null>}
 */
export async function getParticipantData(email) {
  // This is now handled by checkEmailApproval
  const result = await checkEmailApproval(email);
  return result.existingData;
}

/**
 * Save or update participant data
 * @param {string} email - The participant's email
 * @param {object} formData - The form data to save
 * @returns {Promise<boolean>}
 */
export async function saveParticipantData(email, formData) {
  try {
    const response = await fetch(`${API_BASE}/save-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: normalizeEmail(email),
        formData 
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save data');
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error saving participant data:', error);
    throw new Error('Failed to save your information. Please try again.');
  }
}

/**
 * Assign a cursor credit code to the user
 * @param {string} email - The participant's email
 * @returns {Promise<{code: string|null, alreadyAssigned: boolean}>}
 */
export async function assignCursorCode(email) {
  try {
    const response = await fetch(`${API_BASE}/assign-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: normalizeEmail(email) }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to assign code');
    }

    return await response.json();
  } catch (error) {
    console.error('Error assigning cursor code:', error);
    throw new Error('Failed to get cursor credit code. Please contact support.');
  }
}
