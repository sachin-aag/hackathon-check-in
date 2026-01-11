import { useState, useEffect } from 'react';
import { verifyJudgeCode, getTeamsList, submitScore, getExistingScore } from '../services/sheetsService';

const STORAGE_KEY = 'hackathon_judge';

// Scoring criteria
const criteria = [
  { id: 'technical', label: 'Technical Execution', description: 'How well-built is the project? Code quality, functionality, completeness.' },
  { id: 'creativity', label: 'Creativity', description: 'Is the idea original and clever? Novel approach or use of technology.' },
  { id: 'presentation', label: 'Presentation', description: 'How well did they pitch it? Clear explanation, demo quality.' },
  { id: 'usefulness', label: 'Usefulness', description: 'Does it solve a real problem? Practical value and impact.' },
];

function JudgePage() {
  // Auth state
  const [isVerified, setIsVerified] = useState(false);
  const [judgeName, setJudgeName] = useState('');
  const [showNameEntry, setShowNameEntry] = useState(false);
  
  // Code entry
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  
  // Name entry
  const [nameInput, setNameInput] = useState('');
  
  // Teams
  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [teamsError, setTeamsError] = useState('');
  
  // Scoring form
  const [selectedTeam, setSelectedTeam] = useState('');
  const [scores, setScores] = useState({
    technical: 5,
    creativity: 5,
    presentation: 5,
    usefulness: 5,
  });
  const [notes, setNotes] = useState('');
  const [sponsorsUsed, setSponsorsUsed] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // Sponsor options
  const sponsorOptions = [
    { id: 'cursor', label: 'Cursor' },
    { id: 'elevenlabs', label: 'ElevenLabs' },
    { id: 'runpod', label: 'Runpod' },
    { id: 'beyondpresence', label: 'Beyond Presence' },
  ];
  
  // Existing score state
  const [isExistingScore, setIsExistingScore] = useState(false);
  const [loadingScore, setLoadingScore] = useState(false);
  
  // Success state
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastScoredTeam, setLastScoredTeam] = useState('');

  // Check localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const { verified, name } = JSON.parse(stored);
        if (verified && name) {
          setIsVerified(true);
          setJudgeName(name);
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Load teams when verified
  useEffect(() => {
    if (isVerified && judgeName) {
      loadTeams();
    }
  }, [isVerified, judgeName]);

  // Fetch existing score when team is selected
  useEffect(() => {
    if (selectedTeam && judgeName) {
      fetchExistingScore(selectedTeam);
    } else {
      // Reset to defaults when no team selected
      setIsExistingScore(false);
      setScores({
        technical: 5,
        creativity: 5,
        presentation: 5,
        usefulness: 5,
      });
      setNotes('');
      setSponsorsUsed([]);
    }
  }, [selectedTeam, judgeName]);

  const fetchExistingScore = async (teamName) => {
    setLoadingScore(true);
    try {
      const result = await getExistingScore(judgeName, teamName);
      if (result.exists && result.score) {
        setScores({
          technical: result.score.technical,
          creativity: result.score.creativity,
          presentation: result.score.presentation,
          usefulness: result.score.usefulness,
        });
        setNotes(result.score.notes || '');
        // Parse sponsors_used from comma-separated string
        const sponsors = result.score.sponsors_used 
          ? result.score.sponsors_used.split(', ').filter(s => s.trim())
          : [];
        setSponsorsUsed(sponsors);
        setIsExistingScore(true);
      } else {
        // Reset to defaults for new score
        setScores({
          technical: 5,
          creativity: 5,
          presentation: 5,
          usefulness: 5,
        });
        setNotes('');
        setSponsorsUsed([]);
        setIsExistingScore(false);
      }
    } catch (error) {
      console.error('Error fetching existing score:', error);
      setIsExistingScore(false);
    } finally {
      setLoadingScore(false);
    }
  };

  const loadTeams = async () => {
    setTeamsLoading(true);
    setTeamsError('');
    try {
      const { teams: teamList } = await getTeamsList();
      setTeams(teamList);
    } catch (error) {
      setTeamsError(error.message);
    } finally {
      setTeamsLoading(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setCodeError('');
    setCodeLoading(true);

    try {
      const { valid } = await verifyJudgeCode(code);
      if (valid) {
        setShowNameEntry(true);
      } else {
        setCodeError('Invalid code. Please try again.');
      }
    } catch (error) {
      setCodeError(error.message);
    } finally {
      setCodeLoading(false);
    }
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (nameInput.trim()) {
      const name = nameInput.trim();
      setJudgeName(name);
      setIsVerified(true);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ verified: true, name }));
    }
  };

  const handleScoreChange = (criterionId, value) => {
    // Allow empty string for typing, but validate on blur/submit
    if (value === '') {
      setScores(prev => ({ ...prev, [criterionId]: '' }));
      return;
    }
    
    const numValue = parseInt(value, 10);
    
    // Only accept valid numbers 1-10
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 10) {
      setScores(prev => ({ ...prev, [criterionId]: numValue }));
    }
  };

  const validateScores = () => {
    for (const [key, value] of Object.entries(scores)) {
      if (value === '' || typeof value !== 'number' || value < 1 || value > 10) {
        return false;
      }
    }
    return true;
  };

  const handleSponsorChange = (sponsorLabel) => {
    setSponsorsUsed(prev => {
      if (prev.includes(sponsorLabel)) {
        return prev.filter(s => s !== sponsorLabel);
      } else {
        return [...prev, sponsorLabel];
      }
    });
  };

  const handleSubmitScore = async (e) => {
    e.preventDefault();
    if (!selectedTeam) {
      setSubmitError('Please select a team');
      return;
    }
    
    if (!validateScores()) {
      setSubmitError('Please enter valid scores (1-10) for all criteria');
      return;
    }

    setSubmitLoading(true);
    setSubmitError('');

    try {
      await submitScore({
        judgeName,
        teamName: selectedTeam,
        ...scores,
        notes,
        sponsors_used: sponsorsUsed.join(', '),
      });
      
      setLastScoredTeam(selectedTeam);
      setShowSuccess(true);
      
      // Reset form for next team
      setSelectedTeam('');
      setScores({
        technical: 5,
        creativity: 5,
        presentation: 5,
        usefulness: 5,
      });
      setNotes('');
      setSponsorsUsed([]);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleScoreAnother = () => {
    setShowSuccess(false);
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setIsVerified(false);
    setJudgeName('');
    setShowNameEntry(false);
    setCode('');
    setNameInput('');
    setTeams([]);
    setSelectedTeam('');
    setScores({
      technical: 5,
      creativity: 5,
      presentation: 5,
      usefulness: 5,
    });
    setNotes('');
    setShowSuccess(false);
  };

  const totalScore = Object.values(scores).reduce((sum, val) => sum + val, 0);

  // Code Entry Screen
  if (!showNameEntry && !isVerified) {
    return (
      <div className="judge-page">
        <div className="judge-container">
          <div className="judge-card">
            <div className="judge-header">
              <h1>Judge Portal</h1>
              <p>Cursor Hackathon Stuttgart</p>
            </div>
            
            <form onSubmit={handleCodeSubmit} className="judge-form">
              <div className="form-group">
                <label htmlFor="code">Enter Access Code</label>
                <input
                  type="password"
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter secret code"
                  disabled={codeLoading}
                  autoFocus
                />
              </div>
              
              {codeError && <div className="error-message">{codeError}</div>}
              
              <button 
                type="submit" 
                className="button button-primary"
                disabled={codeLoading || !code}
              >
                {codeLoading ? 'Verifying...' : 'Continue'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Name Entry Screen
  if (showNameEntry && !isVerified) {
    return (
      <div className="judge-page">
        <div className="judge-container">
          <div className="judge-card">
            <div className="judge-header">
              <h1>Welcome, Judge!</h1>
              <p>Please enter your name to continue</p>
            </div>
            
            <form onSubmit={handleNameSubmit} className="judge-form">
              <div className="form-group">
                <label htmlFor="judgeName">Your Name</label>
                <input
                  type="text"
                  id="judgeName"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter your full name"
                  autoFocus
                />
              </div>
              
              <button 
                type="submit" 
                className="button button-primary"
                disabled={!nameInput.trim()}
              >
                Start Judging
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Success Screen
  if (showSuccess) {
    return (
      <div className="judge-page">
        <div className="judge-container">
          <div className="judge-card success-card">
            <div className="success-icon">✓</div>
            <h2>Score Submitted!</h2>
            <p>Your score for <strong>{lastScoredTeam}</strong> has been saved.</p>
            
            <div className="button-group">
              <button 
                onClick={handleScoreAnother}
                className="button button-primary"
              >
                Score Another Team
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Scoring Form
  return (
    <div className="judge-page">
      <div className="judge-container">
        <div className="judge-header-bar">
          <div className="judge-welcome">
            <span className="judge-label">Judge:</span>
            <span className="judge-name">{judgeName}</span>
          </div>
          <button onClick={handleReset} className="reset-button">
            Switch Judge
          </button>
        </div>

        <div className="judge-card scoring-card">
          <h2>Score a Team</h2>
          
          {teamsLoading ? (
            <div className="loading-state">Loading teams...</div>
          ) : teamsError ? (
            <div className="error-state">
              <p>{teamsError}</p>
              <button onClick={loadTeams} className="button button-secondary">
                Retry
              </button>
            </div>
          ) : teams.length === 0 ? (
            <div className="empty-state">
              <p>No teams have registered yet.</p>
              <button onClick={loadTeams} className="button button-secondary">
                Refresh
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitScore} className="scoring-form">
              <div className="form-group">
                <label htmlFor="team">Select Team</label>
                <select
                  id="team"
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  required
                  disabled={loadingScore}
                >
                  <option value="">-- Choose a team --</option>
                  {teams.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>

              {loadingScore && (
                <div className="loading-score">Loading existing score...</div>
              )}

              {isExistingScore && !loadingScore && (
                <div className="existing-score-notice">
                  <span className="notice-icon">✏️</span>
                  <span>You've already scored this team. Submitting will update your previous score.</span>
                </div>
              )}

              <div className="criteria-section">
                <div className="criteria-header">
                  <h3>Scoring Criteria</h3>
                  <span className="scale-hint">Enter 1-10 (10 = best)</span>
                </div>
                
                {criteria.map(criterion => (
                  <div key={criterion.id} className="criterion-row">
                    <div className="criterion-info">
                      <label htmlFor={criterion.id}>{criterion.label}</label>
                      <span className="criterion-desc">{criterion.description}</span>
                    </div>
                    <div className="criterion-input">
                      <input
                        type="range"
                        id={`${criterion.id}-slider`}
                        min="1"
                        max="10"
                        value={scores[criterion.id] || 5}
                        onChange={(e) => handleScoreChange(criterion.id, e.target.value)}
                        className="score-slider"
                      />
                      <input
                        type="number"
                        id={criterion.id}
                        min="1"
                        max="10"
                        value={scores[criterion.id]}
                        onChange={(e) => handleScoreChange(criterion.id, e.target.value)}
                        placeholder="1-10"
                        className="score-input"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="total-score">
                <span>Total Score:</span>
                <span className="total-value">{totalScore}/40</span>
              </div>

              <div className="sponsors-section">
                <label className="sponsors-label">Which sponsors has the team used?</label>
                <div className="sponsors-checkboxes">
                  {sponsorOptions.map(sponsor => (
                    <label key={sponsor.id} className="sponsor-checkbox">
                      <input
                        type="checkbox"
                        checked={sponsorsUsed.includes(sponsor.label)}
                        onChange={() => handleSponsorChange(sponsor.label)}
                      />
                      <span className="checkbox-mark"></span>
                      <span className="sponsor-name">{sponsor.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes (optional)</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional comments about this team..."
                  rows={3}
                />
              </div>

              {submitError && <div className="error-message">{submitError}</div>}

              <button 
                type="submit" 
                className="button button-primary"
                disabled={submitLoading || loadingScore || !selectedTeam || !validateScores()}
              >
                {submitLoading ? 'Saving...' : (isExistingScore ? 'Update Score' : 'Submit Score')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default JudgePage;

