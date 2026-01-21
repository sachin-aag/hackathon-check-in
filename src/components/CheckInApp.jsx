import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EmailScreen from './EmailScreen';
import NotApprovedScreen from './NotApprovedScreen';
import CheckInForm from './CheckInForm';
import DataReviewScreen from './DataReviewScreen';
import CursorCreditScreen from './CursorCreditScreen';
import TeamFormationForm from './TeamFormationForm';
import { checkEmailApproval, saveParticipantData, assignCursorCode } from '../services/sheetsService';

// Check-in opens on January 24th, 2026 at 8:00 AM CET
const CHECK_IN_OPEN_DATE = new Date('2026-01-24T08:00:00+01:00');

function CheckInApp() {
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [currentScreen, setCurrentScreen] = useState('email'); // email | form | review | notApproved | success | cursorCredit | teamFormation
  const [participantEmail, setParticipantEmail] = useState('');
  const [existingData, setExistingData] = useState(null);
  const [cursorCode, setCursorCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if check-in is open based on current time
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      if (now >= CHECK_IN_OPEN_DATE) {
        setIsCheckInOpen(true);
      } else {
        setIsCheckInOpen(false);
        // Calculate remaining time for display
        const diff = CHECK_IN_OPEN_DATE - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
      }
    };
    
    checkTime();
    const interval = setInterval(checkTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const handleEmailSubmit = async (email) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await checkEmailApproval(email);
      
      if (!result.approved) {
        setCurrentScreen('notApproved');
        setParticipantEmail(email);
      } else if (result.existingData) {
        // User is approved and has already filled out the form
        setParticipantEmail(email);
        setExistingData(result.existingData);
        setCurrentScreen('review');
      } else {
        // User is approved but hasn't filled out the form yet
        setParticipantEmail(email);
        setExistingData(null);
        setCurrentScreen('form');
      }
    } catch (err) {
      console.error('Error checking email:', err);
      setError('Failed to check email. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    setError('');
    
    try {
      await saveParticipantData(participantEmail, formData);
      
      // Try to assign a cursor code
      try {
        const codeResult = await assignCursorCode(participantEmail);
        setCursorCode(codeResult.code);
        
        // Update existing data with the submitted data and cursor code
        setExistingData({
          email: participantEmail,
          ...formData,
          cursorCode: codeResult.code,
          timestamp: new Date().toISOString()
        });
        
        setCurrentScreen('cursorCredit');
      } catch (codeError) {
        console.error('Error getting cursor code:', codeError);
        
        // Update existing data even if code assignment fails
        setExistingData({
          email: participantEmail,
          ...formData,
          timestamp: new Date().toISOString()
        });
        
        // Continue even if code assignment fails
        setCurrentScreen('success');
        setTimeout(() => {
          setCurrentScreen('review');
        }, 2000);
      }
    } catch (err) {
      console.error('Error saving data:', err);
      setError('Failed to save your information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setCurrentScreen('form');
  };

  const handleStartOver = () => {
    setCurrentScreen('email');
    setParticipantEmail('');
    setExistingData(null);
    setCursorCode(null);
    setError('');
  };

  const handleTryAgain = () => {
    setCurrentScreen('email');
    setParticipantEmail('');
    setCursorCode(null);
    setError('');
  };

  const handleCreditContinue = () => {
    setCurrentScreen('review');
  };

  const handleTeamFormation = () => {
    setCurrentScreen('teamFormation');
  };

  const handleTeamComplete = async (teamName) => {
    // Refresh data from backend to get updated team info
    try {
      const result = await checkEmailApproval(participantEmail);
      if (result.existingData) {
        setExistingData(result.existingData);
      } else {
        // Fallback: just update the team name locally
        setExistingData(prev => ({
          ...prev,
          teamName: teamName
        }));
      }
    } catch (err) {
      // Fallback: just update the team name locally
      setExistingData(prev => ({
        ...prev,
        teamName: teamName
      }));
    }
    setCurrentScreen('review');
  };

  const handleTeamBack = () => {
    setCurrentScreen('review');
  };

  // Show "Not Yet Open" screen if check-in hasn't opened yet
  if (!isCheckInOpen) {
    return (
      <div className="app">
        <div className="screen-container">
          <div className="card">
            <div className="card-header">
              <div className="icon-large">⏰</div>
              <h1>Check-In Not Yet Open</h1>
              <p className="subtitle">Check-in opens on January 24th at 8:00 AM CET</p>
              <p className="countdown">Opens in: {timeRemaining}</p>
            </div>
          </div>
        </div>
        <div className="back-to-info">
          <Link to="/" className="info-link">← Back to Event Info</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')} className="close-button">×</button>
        </div>
      )}

      {currentScreen === 'email' && (
        <EmailScreen 
          onEmailSubmit={handleEmailSubmit}
          loading={loading}
        />
      )}

      {currentScreen === 'notApproved' && (
        <NotApprovedScreen 
          onTryAgain={handleTryAgain}
        />
      )}

      {currentScreen === 'form' && (
        <CheckInForm 
          email={participantEmail}
          existingData={existingData}
          onSubmit={handleFormSubmit}
          loading={loading}
        />
      )}

      {currentScreen === 'review' && existingData && (
        <DataReviewScreen 
          data={existingData}
          onEdit={handleEdit}
          onStartOver={handleStartOver}
          onTeamFormation={handleTeamFormation}
        />
      )}

      {currentScreen === 'cursorCredit' && (
        <CursorCreditScreen 
          code={cursorCode}
          email={participantEmail}
          onContinue={handleCreditContinue}
          onTeamFormation={handleTeamFormation}
        />
      )}

      {currentScreen === 'teamFormation' && (
        <TeamFormationForm 
          currentUserEmail={participantEmail}
          existingTeamData={{
            teamName: existingData?.teamName || '',
            projectIdea: existingData?.projectIdea || ''
          }}
          onComplete={handleTeamComplete}
          onBack={handleTeamBack}
        />
      )}

      {currentScreen === 'success' && (
        <div className="screen-container">
          <div className="card success-card">
            <div className="card-header">
              <div className="icon-large">🎉</div>
              <h1>Success!</h1>
              <p className="subtitle">Your information has been saved.</p>
            </div>
          </div>
        </div>
      )}

      <div className="back-to-info">
        <Link to="/" className="info-link">← Back to Event Info</Link>
      </div>
    </div>
  );
}

export default CheckInApp;
