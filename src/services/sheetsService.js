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

// ==================== TEAM FORMATION FUNCTIONS ====================

/**
 * Get all approved participants for team formation dropdown
 * @returns {Promise<{participants: Array, count: number}>}
 */
export async function getApprovedParticipants() {
  try {
    const response = await fetch(`${API_BASE}/get-approved-participants`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch participants');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching approved participants:', error);
    throw new Error('Failed to load participants. Please try again.');
  }
}

/**
 * Save team formation data for multiple participants
 * @param {string[]} emails - Array of participant emails
 * @param {object} teamData - Team name and project idea
 * @returns {Promise<boolean>}
 */
export async function saveTeamFormation(emails, teamData) {
  try {
    // Save team data for each participant
    const savePromises = emails.map(email => 
      saveParticipantData(email, {
        teamName: teamData.teamName,
        projectIdea: teamData.projectIdea
      })
    );
    
    await Promise.all(savePromises);
    return true;
  } catch (error) {
    console.error('Error saving team formation:', error);
    throw new Error('Failed to save team. Please try again.');
  }
}

// ==================== JUDGE FUNCTIONS ====================

/**
 * Verify judge secret code
 * @param {string} code - The secret code entered by judge
 * @returns {Promise<{valid: boolean}>}
 */
export async function verifyJudgeCode(code) {
  try {
    const response = await fetch(`${API_BASE}/verify-judge-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to verify code');
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying judge code:', error);
    throw new Error('Failed to verify code. Please try again.');
  }
}

/**
 * Get list of teams for scoring
 * @returns {Promise<{teams: string[]}>}
 */
export async function getTeamsList() {
  try {
    const response = await fetch(`${API_BASE}/get-teams`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch teams');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw new Error('Failed to load teams. Please try again.');
  }
}

/**
 * Submit a score for a team
 * @param {object} scoreData - The scoring data
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function submitScore(scoreData) {
  try {
    const response = await fetch(`${API_BASE}/save-score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scoreData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save score');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting score:', error);
    throw new Error('Failed to save score. Please try again.');
  }
}

/**
 * Get existing score for a judge+team combination
 * @param {string} judgeName - The judge's name
 * @param {string} teamName - The team name
 * @returns {Promise<{exists: boolean, score?: object}>}
 */
export async function getExistingScore(judgeName, teamName) {
  try {
    const params = new URLSearchParams({ judgeName, teamName });
    const response = await fetch(`${API_BASE}/get-score?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch score');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching existing score:', error);
    // Return exists: false on error so we don't block the form
    return { exists: false };
  }
}

/**
 * Get all scores from all judges for rankings
 * @returns {Promise<{scores: Array}>}
 */
export async function getAllScores() {
  try {
    const response = await fetch(`${API_BASE}/get-all-scores`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch all scores');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching all scores:', error);
    throw new Error('Failed to load scores. Please try again.');
  }
}

// ==================== VOTING FUNCTIONS ====================

/**
 * Get top 6 teams for voting
 * @returns {Promise<{teams: Array}>}
 */
export async function getTopTeams() {
  try {
    const response = await fetch(`${API_BASE}/get-top-teams`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch top teams');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching top teams:', error);
    throw new Error('Failed to load teams. Please try again.');
  }
}

/**
 * Submit a vote for a team
 * @param {string} email - Voter's email
 * @param {string} teamVotedFor - Team name being voted for
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function submitVote(email, teamVotedFor) {
  try {
    const response = await fetch(`${API_BASE}/submit-vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: email.toLowerCase().trim(), 
        teamVotedFor 
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to submit vote');
    }

    return result;
  } catch (error) {
    console.error('Error submitting vote:', error);
    throw error;
  }
}

/**
 * Get final rankings combining judge scores and votes
 * @returns {Promise<{rankings: Array, totalVotes: number}>}
 */
export async function getFinalRankings() {
  try {
    const response = await fetch(`${API_BASE}/get-final-rankings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch final rankings');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching final rankings:', error);
    throw new Error('Failed to load final rankings. Please try again.');
  }
}

// ==================== FEEDBACK FUNCTIONS ====================

/**
 * Save post-event feedback
 * @param {object} feedbackData - The feedback form data
 * @returns {Promise<{success: boolean, timestamp: string}>}
 */
export async function saveFeedback(feedbackData) {
  try {
    const response = await fetch(`${API_BASE}/save-feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save feedback');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving feedback:', error);
    throw new Error('Failed to submit feedback. Please try again.');
  }
}
