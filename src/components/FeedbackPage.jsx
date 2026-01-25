import { useState } from 'react';
import { Link } from 'react-router-dom';
import { saveFeedback } from '../services/sheetsService';

// Rating criteria for the event
const ratingCriteria = [
  { id: 'venue', label: 'Venue', description: 'Quality of the hackathon space and facilities' },
  { id: 'wifi', label: 'WiFi', description: 'Internet connectivity (we are very sorry about this!)' },
  { id: 'food', label: 'Food & Drinks', description: 'Quality and variety of refreshments' },
  { id: 'organisation', label: 'Organisation', description: 'Event logistics, communication, and overall management' },
  { id: 'peers', label: 'Quality of Peers', description: 'Fellow participants, networking opportunities' },
];

// Duration options
const durationOptions = [
  { value: 'perfect', label: 'It was perfect' },
  { value: 'longer', label: 'I want a 24-36 hr hackathon' },
  { value: 'shorter', label: 'I want shorter hackathons' },
];

// Sponsor options
const sponsorOptions = [
  { id: 'cursor', label: 'Cursor' },
  { id: 'runpod', label: 'RunPod' },
  { id: 'elevenlabs', label: 'ElevenLabs' },
  { id: 'n8n', label: 'n8n' },
  { id: 'beyond_presence', label: 'Beyond Presence' },
];

function FeedbackPage() {
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    overallScore: 5,
    venueScore: 3,
    wifiScore: 3,
    foodScore: 3,
    organisationScore: 3,
    peersScore: 3,
    feedback: '',
    durationFeedback: '',
    githubRepo: '',
    projectLink: '',
    videoLink: '',
    sponsorsUsed: [],
    feedbackTools: '',
    futureSponsors: '',
    comments: '',
  });

  // Form errors
  const [errors, setErrors] = useState({});
  
  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // Success state
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleScoreChange = (field, value, maxValue = 5) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= maxValue) {
      setFormData(prev => ({ ...prev, [field]: numValue }));
    }
  };

  const handleSponsorChange = (sponsorLabel) => {
    setFormData(prev => {
      const current = prev.sponsorsUsed;
      if (current.includes(sponsorLabel)) {
        return { ...prev, sponsorsUsed: current.filter(s => s !== sponsorLabel) };
      } else {
        return { ...prev, sponsorsUsed: [...current, sponsorLabel] };
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.durationFeedback) {
      newErrors.durationFeedback = 'Please select a duration preference';
    }

    // Validate URLs if provided
    if (formData.githubRepo.trim()) {
      try {
        new URL(formData.githubRepo);
      } catch {
        newErrors.githubRepo = 'Please enter a valid URL';
      }
    }

    if (formData.projectLink.trim()) {
      try {
        new URL(formData.projectLink);
      } catch {
        newErrors.projectLink = 'Please enter a valid URL';
      }
    }

    if (formData.videoLink.trim()) {
      try {
        new URL(formData.videoLink);
      } catch {
        newErrors.videoLink = 'Please enter a valid URL';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      await saveFeedback({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        overall_score: formData.overallScore,
        venue_score: formData.venueScore,
        wifi_score: formData.wifiScore,
        food_and_drinks_score: formData.foodScore,
        organisation_score: formData.organisationScore,
        quality_of_peers_score: formData.peersScore,
        feedback: formData.feedback.trim(),
        duration_feedback: formData.durationFeedback,
        github_repo: formData.githubRepo.trim(),
        project_link: formData.projectLink.trim(),
        video_link: formData.videoLink.trim(),
        sponsor_list: formData.sponsorsUsed.join(', '),
        feedback_tools: formData.feedbackTools.trim(),
        future_sponsors: formData.futureSponsors.trim(),
        comments: formData.comments.trim(),
      });
      
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
      <div className="judge-page">
        <div className="judge-container">
          <div className="judge-card success-card">
            <div className="success-icon">✓</div>
            <h2>Thank You!</h2>
            <p>Your feedback has been submitted successfully.</p>
            <p style={{ color: '#94a3b8', marginTop: '1rem' }}>
              We really appreciate you taking the time to share your thoughts. 
              Your feedback helps us make future events even better!
            </p>
            <div className="button-group" style={{ marginTop: '2rem' }}>
              <Link to="/" className="button button-primary">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vote-page">
      <div className="vote-container" style={{ maxWidth: '700px' }}>
        <div className="vote-header">
          <h1>Post-Event Feedback</h1>
          <p className="vote-subtitle">Cursor Hackathon Stuttgart - January 24, 2026</p>
        </div>

        <div className="vote-card">
          <form onSubmit={handleSubmit} className="judge-form">
            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">
                Email Address <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                disabled={submitting}
              />
              {errors.email && <p className="error-message">{errors.email}</p>}
            </div>

            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="name">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your full name"
                disabled={submitting}
              />
              {errors.name && <p className="error-message">{errors.name}</p>}
            </div>

            {/* Overall Rating */}
            <div className="criteria-section">
              <div className="criteria-header">
                <h3>Overall Event Rating</h3>
                <span className="scale-hint">1-10 (10 = best)</span>
              </div>
              
              <div className="criterion-row">
                <div className="criterion-info">
                  <label>How would you rate the event overall?</label>
                </div>
                <div className="rating-radio-group rating-radio-group-10">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
                    <label key={value} className={`rating-radio ${formData.overallScore === value ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="overallScore"
                        value={value}
                        checked={formData.overallScore === value}
                        onChange={(e) => handleScoreChange('overallScore', e.target.value, 10)}
                        disabled={submitting}
                      />
                      <span className="rating-value">{value}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Category Ratings */}
            <div className="criteria-section">
              <div className="criteria-header">
                <h3>Rate Different Aspects</h3>
                <span className="scale-hint">1-5 (5 = best)</span>
              </div>
              
              {ratingCriteria.map(criterion => {
                const fieldMap = {
                  venue: 'venueScore',
                  wifi: 'wifiScore',
                  food: 'foodScore',
                  organisation: 'organisationScore',
                  peers: 'peersScore',
                };
                const fieldName = fieldMap[criterion.id];
                
                return (
                  <div key={criterion.id} className="criterion-row">
                    <div className="criterion-info">
                      <label>{criterion.label}</label>
                      <span className="criterion-desc">{criterion.description}</span>
                    </div>
                    <div className="rating-radio-group">
                      {[1, 2, 3, 4, 5].map(value => (
                        <label key={value} className={`rating-radio ${formData[fieldName] === value ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name={fieldName}
                            value={value}
                            checked={formData[fieldName] === value}
                            onChange={(e) => handleScoreChange(fieldName, e.target.value)}
                            disabled={submitting}
                          />
                          <span className="rating-value">{value}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* General Feedback */}
            <div className="form-group">
              <label htmlFor="feedback">Any feedback for us?</label>
              <textarea
                id="feedback"
                name="feedback"
                value={formData.feedback}
                onChange={handleInputChange}
                placeholder="Share your thoughts about the event..."
                rows={4}
                disabled={submitting}
              />
            </div>

            {/* Duration Feedback */}
            <div className="form-group">
              <label>
                What did you think of the duration? <span className="required">*</span>
              </label>
              <div className="radio-options-list">
                {durationOptions.map(option => (
                  <label 
                    key={option.value}
                    className={`radio-option-item ${formData.durationFeedback === option.value ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="durationFeedback"
                      value={option.value}
                      checked={formData.durationFeedback === option.value}
                      onChange={handleInputChange}
                      disabled={submitting}
                    />
                    <span className="radio-circle"></span>
                    <span className="radio-label">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.durationFeedback && <p className="error-message">{errors.durationFeedback}</p>}
            </div>

            {/* GitHub Repo */}
            <div className="form-group">
              <label htmlFor="githubRepo">Share your project's GitHub repo</label>
              <input
                type="url"
                id="githubRepo"
                name="githubRepo"
                value={formData.githubRepo}
                onChange={handleInputChange}
                placeholder="https://github.com/username/repo"
                disabled={submitting}
              />
              <p className="helper-text">Open source repos only - help others learn from your work!</p>
              {errors.githubRepo && <p className="error-message">{errors.githubRepo}</p>}
            </div>

            {/* Project Link */}
            <div className="form-group">
              <label htmlFor="projectLink">Share a link where people can access your project</label>
              <input
                type="url"
                id="projectLink"
                name="projectLink"
                value={formData.projectLink}
                onChange={handleInputChange}
                placeholder="https://your-project.com"
                disabled={submitting}
              />
              {errors.projectLink && <p className="error-message">{errors.projectLink}</p>}
            </div>

            {/* Video Link */}
            <div className="form-group">
              <label htmlFor="videoLink">Share a video of your project</label>
              <input
                type="url"
                id="videoLink"
                name="videoLink"
                value={formData.videoLink}
                onChange={handleInputChange}
                placeholder="https://youtube.com/watch?v=... or https://loom.com/..."
                disabled={submitting}
              />
              <p className="helper-text">YouTube, Loom, or any video link showcasing your project</p>
              {errors.videoLink && <p className="error-message">{errors.videoLink}</p>}
            </div>

            {/* Sponsors Used */}
            <div className="sponsors-section">
              <label className="sponsors-label">Which sponsors did you use?</label>
              <div className="sponsors-checkboxes">
                {sponsorOptions.map(sponsor => (
                  <label key={sponsor.id} className="sponsor-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.sponsorsUsed.includes(sponsor.label)}
                      onChange={() => handleSponsorChange(sponsor.label)}
                      disabled={submitting}
                    />
                    <span className="checkbox-mark"></span>
                    <span className="sponsor-name">{sponsor.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tool Feedback */}
            <div className="form-group">
              <label htmlFor="feedbackTools">Any feedback for the tools you used?</label>
              <textarea
                id="feedbackTools"
                name="feedbackTools"
                value={formData.feedbackTools}
                onChange={handleInputChange}
                placeholder="Share your experience with the sponsor tools..."
                rows={3}
                disabled={submitting}
              />
            </div>

            {/* Future Sponsors */}
            <div className="form-group">
              <label htmlFor="futureSponsors">Any sponsors you want to see at future events?</label>
              <textarea
                id="futureSponsors"
                name="futureSponsors"
                value={formData.futureSponsors}
                onChange={handleInputChange}
                placeholder="Companies or tools you'd like us to partner with..."
                rows={2}
                disabled={submitting}
              />
            </div>

            {/* Additional Comments */}
            <div className="form-group">
              <label htmlFor="comments">Any other feedback you want to add?</label>
              <textarea
                id="comments"
                name="comments"
                value={formData.comments}
                onChange={handleInputChange}
                placeholder="Anything else on your mind..."
                rows={3}
                disabled={submitting}
              />
            </div>

            {submitError && (
              <div className="vote-error">
                <p>{submitError}</p>
              </div>
            )}

            <button 
              type="submit" 
              className="button button-primary"
              disabled={submitting}
              style={{ marginTop: '1rem' }}
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FeedbackPage;
