import { useState } from 'react';
import { Link } from 'react-router-dom';
import EmailScreen from './EmailScreen';
import NotApprovedScreen from './NotApprovedScreen';
import CheckInForm from './CheckInForm';
import DataReviewScreen from './DataReviewScreen';
import CursorCreditScreen from './CursorCreditScreen';
import TeamFormationForm from './TeamFormationForm';
import { checkEmailApproval, saveParticipantData, assignCursorCode } from '../services/sheetsService';

function CheckInApp() {
  const [currentScreen, setCurrentScreen] = useState('email'); // email | form | review | notApproved | success | cursorCredit | teamFormation
  const [participantEmail, setParticipantEmail] = useState('');
  const [existingData, setExistingData] = useState(null);
  const [cursorCode, setCursorCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleTeamComplete = (teamName) => {
    // Update existing data with the new team name
    setExistingData(prev => ({
      ...prev,
      teamName: teamName
    }));
    setCurrentScreen('review');
  };

  const handleTeamBack = () => {
    setCurrentScreen('review');
  };

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
        />
      )}

      {currentScreen === 'teamFormation' && (
        <TeamFormationForm 
          currentUserEmail={participantEmail}
          existingTeamName={existingData?.teamName || ''}
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
