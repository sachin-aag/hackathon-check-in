import { useState, useEffect } from 'react';
import { getTopTeams, submitVote } from '../services/sheetsService';

function VotePage() {
  // Form state
  const [email, setEmail] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  
  // Teams data
  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [teamsError, setTeamsError] = useState('');
  
  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // Success state
  const [submitted, setSubmitted] = useState(false);
  const [votedTeam, setVotedTeam] = useState('');

  // Load top 6 teams on mount
  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    setTeamsLoading(true);
    setTeamsError('');
    try {
      const { teams: topTeams } = await getTopTeams();
      setTeams(topTeams);
    } catch (error) {
      setTeamsError(error.message);
    } finally {
      setTeamsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setSubmitError('Please enter your email address');
      return;
    }
    
    if (!selectedTeam) {
      setSubmitError('Please select a team to vote for');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      await submitVote(email, selectedTeam);
      setVotedTeam(selectedTeam);
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Success screen
  if (submitted) {
    return (
      <div className="vote-page">
        <div className="vote-container">
          <div className="vote-card success-card">
            <div className="success-icon">✓</div>
            <h2>Vote Submitted!</h2>
            <p>Thank you for voting for <strong>{votedTeam}</strong>!</p>
            <p className="vote-thanks">Your vote has been recorded. Good luck to all the finalists!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vote-page">
      <div className="vote-container">
        <div className="vote-header">
          <h1>Vote for Your Favorite Team</h1>
          <p className="vote-subtitle">Cursor Hackathon Stuttgart - Final Round</p>
        </div>

        {teamsLoading ? (
          <div className="vote-card">
            <div className="loading-state">Loading finalist teams...</div>
          </div>
        ) : teamsError ? (
          <div className="vote-card">
            <div className="error-state">
              <p>{teamsError}</p>
              <button onClick={loadTeams} className="button button-secondary">
                Retry
              </button>
            </div>
          </div>
        ) : teams.length === 0 ? (
          <div className="vote-card">
            <div className="empty-state">
              <p>No finalist teams available yet.</p>
              <button onClick={loadTeams} className="button button-secondary">
                Refresh
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="vote-form">
            <div className="vote-card">
              <div className="form-group">
                <label htmlFor="email">Your Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  disabled={submitting}
                  autoFocus
                />
                <p className="helper-text">Must be the email you used to check in</p>
              </div>
            </div>

            <div className="vote-card teams-card">
              <h3>Select Your Favorite Team</h3>
              <p className="team-instructions">Choose one team from the top 6 finalists:</p>
              
              <div className="team-options">
                {teams.map((team, index) => (
                  <label 
                    key={team.team_name} 
                    className={`team-option ${selectedTeam === team.team_name ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="team"
                      value={team.team_name}
                      checked={selectedTeam === team.team_name}
                      onChange={(e) => setSelectedTeam(e.target.value)}
                      disabled={submitting}
                    />
                    <div className="team-option-content">
                      <div className="team-rank">#{index + 1}</div>
                      <div className="team-info">
                        <span className="team-name">{team.team_name}</span>
                        {team.idea && <span className="team-idea">{team.idea}</span>}
                      </div>
                      <div className="team-check">
                        {selectedTeam === team.team_name && <span>✓</span>}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {submitError && (
              <div className="vote-error">
                <p>{submitError}</p>
              </div>
            )}

            <button 
              type="submit" 
              className="button button-primary vote-submit"
              disabled={submitting || !email.trim() || !selectedTeam}
            >
              {submitting ? 'Submitting Vote...' : 'Submit Vote'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default VotePage;

