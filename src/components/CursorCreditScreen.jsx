import { useState } from 'react';

function CursorCreditScreen({ code, email, onContinue }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent('Your Cursor Credit Code');
    const body = encodeURIComponent(`Here's your Cursor credit code: ${code}\n\nEnjoy!`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Cursor Credit Code',
          text: `Your Cursor credit code: ${code}`,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopy();
    }
  };

  if (!code) {
    return (
      <div className="screen-container">
        <div className="card">
          <div className="card-header">
            <div className="icon-large">⚠️</div>
            <h1>No Codes Available</h1>
            <p className="subtitle">All cursor credit codes have been assigned.</p>
          </div>

          <div className="message-content">
            <p>Please contact the organizers if you believe this is an error.</p>
          </div>

          <button onClick={onContinue} className="button button-primary">
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-container">
      <div className="card cursor-credit-card">
        <div className="card-header">
          <div className="icon-large">🎁</div>
          <h1>Your Cursor Credit!</h1>
          <p className="subtitle">Here's your exclusive Cursor credit code</p>
        </div>

        <div className="credit-code-container">
          <div className="credit-code-box">
            <code className="credit-code">{code}</code>
          </div>
          <p className="credit-hint">Save this code to redeem your Cursor credit</p>
        </div>

        <div className="share-section">
          <h3>Share your code</h3>
          <p className="share-hint">Send it to your email or another device</p>
          
          <div className="button-group">
            <button 
              onClick={handleCopy}
              className="button button-secondary"
            >
              {copied ? '✓ Copied!' : '📋 Copy Code'}
            </button>

            <button 
              onClick={handleEmailShare}
              className="button button-secondary"
            >
              📧 Email to Myself
            </button>

            {navigator.share && (
              <button 
                onClick={handleNativeShare}
                className="button button-secondary"
              >
                📤 Share
              </button>
            )}
          </div>
        </div>

        <button onClick={onContinue} className="button button-primary">
          Continue to Dashboard
        </button>

        <p className="credit-footer">
          This code has been assigned to: <strong>{email}</strong>
        </p>
      </div>
    </div>
  );
}

export default CursorCreditScreen;


