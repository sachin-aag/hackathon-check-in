import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyJudgeCode, getAllScores } from '../services/sheetsService';

const STORAGE_KEY = 'hackathon_judge';

// Helper functions for statistics
function average(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

function standardDeviation(arr) {
  if (arr.length <= 1) return 0;
  const avg = average(arr);
  const squareDiffs = arr.map(val => Math.pow(val - avg, 2));
  return Math.sqrt(average(squareDiffs));
}

function groupBy(arr, key) {
  return arr.reduce((groups, item) => {
    const group = item[key];
    if (!groups[group]) groups[group] = [];
    groups[group].push(item);
    return groups;
  }, {});
}

// Z-score normalization per judge to remove bias
function normalizeScores(rawScores) {
  if (rawScores.length === 0) return [];

  // 1. Group scores by judge
  const byJudge = groupBy(rawScores, 'judge_name');
  
  // 2. Calculate mean & std dev for each judge
  const judgeStats = {};
  for (const [judge, scores] of Object.entries(byJudge)) {
    const totals = scores.map(s => s.total);
    judgeStats[judge] = {
      mean: average(totals),
      stdDev: standardDeviation(totals),
      count: scores.length
    };
  }
  
  // 3. Calculate z-score for each score
  const normalizedByTeam = {};
  for (const score of rawScores) {
    const { mean, stdDev } = judgeStats[score.judge_name];
    // Avoid division by zero if judge gave same score to all
    const zScore = stdDev > 0 ? (score.total - mean) / stdDev : 0;
    
    if (!normalizedByTeam[score.team_name]) {
      normalizedByTeam[score.team_name] = { zScores: [], rawScores: [] };
    }
    normalizedByTeam[score.team_name].zScores.push(zScore);
    normalizedByTeam[score.team_name].rawScores.push(score);
  }
  
  // 4. Average z-scores per team for final ranking
  return Object.entries(normalizedByTeam)
    .map(([team, data]) => {
      // Get the most recent idea description (from the latest score)
      const latestScore = data.rawScores.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      )[0];
      
      // Get list of judge names who scored this team
      const judgeNames = [...new Set(data.rawScores.map(s => s.judge_name))];
      
      return {
        team,
        idea: latestScore?.idea || '',
        normalizedScore: average(data.zScores),
        judgeCount: data.zScores.length,
        judgeNames,
        rawAverage: average(data.rawScores.map(s => s.total)),
        rawScores: data.rawScores
      };
    })
    .sort((a, b) => b.normalizedScore - a.normalizedScore);
}

function RankingsPage() {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Stats
  const [totalJudges, setTotalJudges] = useState(0);
  const [totalTeams, setTotalTeams] = useState(0);

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
      const { scores } = await getAllScores();
      
      // Calculate stats
      const judges = new Set(scores.map(s => s.judge_name));
      const teams = new Set(scores.map(s => s.team_name));
      setTotalJudges(judges.size);
      setTotalTeams(teams.size);
      
      // Normalize and rank
      const ranked = normalizeScores(scores);
      setRankings(ranked);
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

  const handleBackToJudging = () => {
    navigate('/judge');
  };

  // Format normalized score for display
  const formatScore = (score) => {
    if (score > 0) return `+${score.toFixed(2)}`;
    return score.toFixed(2);
  };

  // Get rank badge style
  const getRankStyle = (rank) => {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return '';
  };

  // Code Entry Screen
  if (!showNameEntry && !isVerified) {
    return (
      <div className="judge-page">
        <div className="judge-container">
          <div className="judge-card">
            <div className="judge-header">
              <h1>Team Rankings</h1>
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
              <h1>Team Rankings</h1>
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
                View Rankings
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Rankings Display
  return (
    <div className="judge-page rankings-page">
      <div className="judge-container rankings-container">
        <div className="judge-header-bar">
          <div className="judge-welcome">
            <span className="judge-label">Viewing as:</span>
            <span className="judge-name">{judgeName}</span>
          </div>
          <button onClick={handleBackToJudging} className="button button-secondary">
            Back to Judging
          </button>
        </div>

        <div className="rankings-header">
          <div className="rankings-title">
            <h1>Team Rankings</h1>
            <p className="rankings-subtitle">Cursor Hackathon Stuttgart</p>
          </div>
          <div className="rankings-actions">
            <button onClick={loadRankings} className="button button-secondary" disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        <div className="rankings-stats">
          <div className="stat-card">
            <span className="stat-value">{totalTeams}</span>
            <span className="stat-label">Teams Scored</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{totalJudges}</span>
            <span className="stat-label">Judges</span>
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
          <div className="loading-state">Loading rankings...</div>
        ) : rankings.length === 0 ? (
          <div className="empty-state">
            <p>No scores have been submitted yet.</p>
            <button onClick={loadRankings} className="button button-secondary">
              Refresh
            </button>
          </div>
        ) : (
          <>
            <div className="rankings-info">
              <p>
                Scores are normalized per judge using z-scores to remove bias. 
                A score of 0 means average for that judge, positive means above average.
              </p>
            </div>
            
            <div className="rankings-table-wrapper">
              <table className="rankings-table">
                <thead>
                  <tr>
                    <th className="rank-col">Rank</th>
                    <th className="team-col">Team</th>
                    <th className="idea-col">Idea</th>
                    <th className="score-col">Normalized</th>
                    <th className="raw-col">Raw Avg</th>
                    <th className="judges-col">Scored By</th>
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
                      <td className={`score-cell ${team.normalizedScore >= 0 ? 'positive' : 'negative'}`}>
                        {formatScore(team.normalizedScore)}
                      </td>
                      <td className="raw-cell">
                        {team.rawAverage.toFixed(1)}/40
                      </td>
                      <td className="judges-cell" title={team.judgeNames.join(', ')}>
                        <span className="judges-names">{team.judgeNames.map(n => n.split(' ')[0]).join(', ')}</span>
                        <span className="judges-count">({team.judgeCount}/{totalJudges})</span>
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

export default RankingsPage;

