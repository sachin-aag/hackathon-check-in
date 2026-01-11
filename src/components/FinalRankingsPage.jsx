import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyJudgeCode, getFinalRankings } from '../services/sheetsService';

const STORAGE_KEY = 'hackathon_judge';

function FinalRankingsPage() {
  const navigate = useNavigate();
  
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
  
  // Rankings data
  const [rankings, setRankings] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

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

  // Load rankings when verified
  useEffect(() => {
    if (isVerified) {
      loadRankings();
    }
  }, [isVerified]);

  const loadRankings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getFinalRankings();
      setRankings(data.rankings);
      setTotalVotes(data.totalVotes);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
    } catch (err) {
      setCodeError(err.message);
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

  const handleBackToRankings = () => {
    navigate('/rankings');
  };

  // Get rank badge style
  const getRankStyle = (rank) => {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return '';
  };

  // Format percentage
  const formatPercent = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Code Entry Screen
  if (!showNameEntry && !isVerified) {
    return (
      <div className="judge-page">
        <div className="judge-container">
          <div className="judge-card">
            <div className="judge-header">
              <h1>Final Rankings</h1>
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
              <h1>Final Rankings</h1>
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
                  placeholder="Enter your name"
                  autoFocus
                />
              </div>
              
              <button 
                type="submit" 
                className="button button-primary"
                disabled={!nameInput.trim()}
              >
                View Final Rankings
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Final Rankings Display
  return (
    <div className="judge-page rankings-page final-rankings-page">
      <div className="judge-container rankings-container">
        <div className="judge-header-bar">
          <div className="judge-welcome">
            <span className="judge-label">Viewing as:</span>
            <span className="judge-name">{judgeName}</span>
          </div>
          <button onClick={handleBackToRankings} className="button button-secondary">
            All Teams Rankings
          </button>
        </div>

        <div className="rankings-header">
          <div className="rankings-title">
            <h1>Final Rankings</h1>
            <p className="rankings-subtitle">Top 6 Finalists - Combined Scores</p>
          </div>
          <div className="rankings-actions">
            <button onClick={loadRankings} className="button button-secondary" disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        <div className="rankings-stats">
          <div className="stat-card">
            <span className="stat-value">{rankings.length}</span>
            <span className="stat-label">Finalists</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{totalVotes}</span>
            <span className="stat-label">Total Votes</span>
          </div>
          {lastUpdated && (
            <div className="stat-card">
              <span className="stat-value">{lastUpdated.toLocaleTimeString()}</span>
              <span className="stat-label">Last Updated</span>
            </div>
          )}
        </div>

        {error && (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={loadRankings} className="button button-secondary">
              Retry
            </button>
          </div>
        )}

        {loading && rankings.length === 0 ? (
          <div className="loading-state">Loading final rankings...</div>
        ) : rankings.length === 0 ? (
          <div className="empty-state">
            <p>No final rankings available yet.</p>
            <button onClick={loadRankings} className="button button-secondary">
              Refresh
            </button>
          </div>
        ) : (
          <>
            <div className="rankings-info">
              <p>
                Final Score = 50% Judge Score + 50% Audience Vote
              </p>
            </div>
            
            <div className="rankings-table-wrapper">
              <table className="rankings-table final-rankings-table">
                <thead>
                  <tr>
                    <th className="rank-col">Rank</th>
                    <th className="team-col">Team</th>
                    <th className="idea-col">Idea</th>
                    <th className="component-col">Judges (50%)</th>
                    <th className="component-col">Votes (50%)</th>
                    <th className="final-col">Final Score</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((team, index) => (
                    <tr key={team.team}>
                      <td className={`rank-cell ${getRankStyle(index + 1)}`}>
                        {index + 1}
                      </td>
                      <td className="team-cell">
                        {team.team}
                      </td>
                      <td className="idea-cell">
                        {team.idea || <span className="no-idea">—</span>}
                      </td>
                      <td className="component-cell">
                        <span className="component-normalized">{formatPercent(team.judgeScore)}</span>
                        <span className="component-raw">({team.judgeRaw.toFixed(1)}/40 avg)</span>
                        <span className="component-detail">{team.judgeCount} judge{team.judgeCount !== 1 ? 's' : ''}</span>
                      </td>
                      <td className="component-cell">
                        <span className="component-normalized">{formatPercent(team.votePercent)}</span>
                        <span className="component-raw">{team.votes} vote{team.votes !== 1 ? 's' : ''}</span>
                      </td>
                      <td className="final-cell">
                        <span className="final-score">{formatPercent(team.finalScore)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default FinalRankingsPage;

