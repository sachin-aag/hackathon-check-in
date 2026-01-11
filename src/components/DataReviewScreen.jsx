function DataReviewScreen({ data, onEdit, onStartOver }) {
  const handleCopyCode = () => {
    if (data.cursorCode) {
      navigator.clipboard.writeText(data.cursorCode);
    }
  };

  return (
    <div className="screen-container">
      <div className="card">
        <div className="card-header">
          <div className="icon-large">✅</div>
          <h1>You're All Set!</h1>
          <p className="subtitle">Here's your check-in information</p>
        </div>

        <div className="data-review">
          <div className="data-item">
            <label className="data-label">Email</label>
            <p className="data-value">{data.email}</p>
          </div>

          <div className="data-item">
            <label className="data-label">Team Name</label>
            <p className="data-value">{data.teamName}</p>
          </div>

          <div className="data-item">
            <label className="data-label">Project Idea</label>
            <p className="data-value">{data.projectIdea}</p>
          </div>

          <div className="data-item">
            <label className="data-label">Food Preference</label>
            <p className="data-value">{data.foodPreference}</p>
          </div>

          <div className="data-item">
            <label className="data-label">Food Notes</label>
            <p className="data-value">
              {data.foodNotes || 'None specified'}
            </p>
          </div>

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
              <label className="data-label">Last Updated</label>
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
            Edit Information
          </button>
          <button 
            onClick={onStartOver}
            className="button button-secondary"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataReviewScreen;

