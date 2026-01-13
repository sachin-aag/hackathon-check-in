import { Link } from 'react-router-dom';

function DataReviewScreen({ data, onEdit, onStartOver, onTeamFormation }) {
  const handleCopyCode = () => {
    if (data.cursorCode) {
      navigator.clipboard.writeText(data.cursorCode);
    }
  };

  const hasTeam = data.teamName && data.teamName.trim() !== '';

  return (
    <div className="screen-container">
      <div className="card">
        <div className="card-header">
          <div className="icon-large">✅</div>
          <h1>You're Checked In!</h1>
          <p className="subtitle">Here's your check-in information</p>
        </div>

        <div className="data-review">
          <div className="data-item">
            <label className="data-label">Email</label>
            <p className="data-value">{data.email}</p>
          </div>

          {/* Skills */}
          <div className="data-item">
            <label className="data-label">Your Skills</label>
            <p className="data-value">{data.skills || 'Not specified'}</p>
          </div>

          {/* Idea Preference */}
          <div className="data-item">
            <label className="data-label">Hackathon Approach</label>
            <p className="data-value">
              {data.hasOwnIdea ? (
                <span className="approach-badge has-idea">💡 Building my own idea</span>
              ) : (
                <span className="approach-badge looking-to-join">🤝 Looking to join a team</span>
              )}
            </p>
          </div>

          {/* Initial Idea - only if they have one */}
          {data.hasOwnIdea && data.initialIdea && (
            <div className="data-item">
              <label className="data-label">Your Idea</label>
              <p className="data-value">{data.initialIdea}</p>
            </div>
          )}

          {/* Looking for teammates info */}
          {data.hasOwnIdea && data.lookingForTeammates && (
            <div className="data-item">
              <label className="data-label">Looking for Teammates</label>
              <p className="data-value">
                <span className="approach-badge looking-to-join">🔍 Yes, looking for teammates</span>
              </p>
              {data.desiredSkills && (
                <p className="data-value desired-skills">
                  <strong>Desired skills:</strong> {data.desiredSkills}
                </p>
              )}
            </div>
          )}

          {/* Team Section */}
          <div className="data-section">
            <h3 className="section-title">Team Status</h3>
            {hasTeam ? (
              <>
                <div className="data-item">
                  <label className="data-label">Team Name</label>
                  <p className="data-value team-name-display">{data.teamName}</p>
                </div>
                {data.projectIdea && (
                  <div className="data-item">
                    <label className="data-label">Project Idea</label>
                    <p className="data-value">{data.projectIdea}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="no-team-notice">
                <p>You haven't joined a team yet.</p>
                <button 
                  onClick={onTeamFormation}
                  className="button button-accent"
                >
                  👥 Form or Join a Team
                </button>
              </div>
            )}
          </div>

          {/* Food Preference */}
          <div className="data-item">
            <label className="data-label">Food Preference</label>
            <p className="data-value">{data.foodPreference}</p>
          </div>

          {data.foodNotes && (
            <div className="data-item">
              <label className="data-label">Food Notes</label>
              <p className="data-value">{data.foodNotes}</p>
            </div>
          )}

          <div className="data-item">
            <label className="data-label">Photo Consent</label>
            <p className="data-value">
              {data.photoConsent ? '✓ Yes, I consent' : '✗ No consent given'}
            </p>
          </div>

          {data.cursorCode && (
            <div className="data-item cursor-code-item">
              <label className="data-label">🎁 Cursor Credit Code</label>
              <div className="cursor-code-display">
                <code className="cursor-code-text">{data.cursorCode}</code>
                <button onClick={handleCopyCode} className="copy-code-btn" title="Copy code">
                  📋
                </button>
              </div>
            </div>
          )}

          {data.timestamp && (
            <div className="data-item">
              <label className="data-label">Checked In At</label>
              <p className="data-value timestamp">
                {new Date(data.timestamp).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <div className="button-group">
          <button 
            onClick={onEdit}
            className="button button-primary"
          >
            Edit Check-In Info
          </button>
          {hasTeam && (
            <button 
              onClick={onTeamFormation}
              className="button button-secondary"
            >
              Edit Team
            </button>
          )}
          <button 
            onClick={onStartOver}
            className="button button-secondary"
          >
            Start Over
          </button>
        </div>

        <div className="event-info-link">
          <Link to="/">← View Event Info & Schedule</Link>
        </div>
      </div>
    </div>
  );
}

export default DataReviewScreen;
