import { useState } from 'react';

function EmailScreen({ onEmailSubmit, loading }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    onEmailSubmit(email.trim());
  };

  return (
    <div className="screen-container">
      <div className="card">
        <div className="card-header">
          <h1>🎉 Hackathon Check-In</h1>
          <p className="subtitle">Welcome! Let's get you checked in.</p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              disabled={loading}
              className="input"
              autoFocus
            />
            <p className="helper-text">
              💡 Enter the email you used when registering for the hackathon.
              Check your confirmation email if you're unsure.
            </p>
            {error && <p className="error-message">{error}</p>}
          </div>

          <button 
            type="submit" 
            className="button button-primary"
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EmailScreen;

