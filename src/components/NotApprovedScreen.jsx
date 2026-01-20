function NotApprovedScreen({ onTryAgain }) {
  return (
    <div className="screen-container">
      <div className="card">
        <div className="card-header">
          <div className="icon-large">⚠️</div>
          <h1>Email Not Approved</h1>
          <p className="subtitle">
            Your email is not on the approved participant list.
          </p>
        </div>

        <div className="message-content">
          <p>
            If you believe this is an error, please contact the hackathon organizers 
            for assistance.
          </p>
        </div>

        <button 
          onClick={onTryAgain}
          className="button button-secondary"
        >
          Try Another Email
        </button>
      </div>
    </div>
  );
}

export default NotApprovedScreen;



