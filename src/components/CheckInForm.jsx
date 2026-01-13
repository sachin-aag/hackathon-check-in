import { useState, useEffect } from 'react';

function CheckInForm({ email, existingData, onSubmit, loading }) {
  const [formData, setFormData] = useState({
    hasOwnIdea: true,
    initialIdea: '',
    skills: '',
    foodPreference: '',
    foodNotes: '',
    photoConsent: false
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (existingData) {
      setFormData({
        hasOwnIdea: existingData.hasOwnIdea !== undefined ? existingData.hasOwnIdea : true,
        initialIdea: existingData.initialIdea || '',
        skills: existingData.skills || '',
        foodPreference: existingData.foodPreference || '',
        foodNotes: existingData.foodNotes || '',
        photoConsent: existingData.photoConsent || false
      });
    }
  }, [existingData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRadioChange = (value) => {
    setFormData(prev => ({
      ...prev,
      hasOwnIdea: value
    }));
    if (errors.hasOwnIdea) {
      setErrors(prev => ({ ...prev, hasOwnIdea: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.skills.trim()) {
      newErrors.skills = 'Please share your skills';
    }
    
    if (formData.hasOwnIdea && !formData.initialIdea.trim()) {
      newErrors.initialIdea = 'Please describe your idea';
    }
    
    if (!formData.foodPreference) {
      newErrors.foodPreference = 'Please select your food preference';
    }
    
    if (!formData.photoConsent) {
      newErrors.photoConsent = 'You must consent to photos to complete check-in';
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  const isEditing = !!existingData;

  return (
    <div className="screen-container">
      <div className="card">
        <div className="card-header">
          <h1>{isEditing ? '✏️ Edit Your Information' : '📝 Complete Your Check-In'}</h1>
          <p className="subtitle">
            {isEditing ? 'Update your information below' : `Checking in: ${email}`}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          {/* Idea Preference Section */}
          <div className="form-group">
            <label className="form-label-main">
              What brings you to the hackathon? <span className="required">*</span>
            </label>
            <div className="radio-group">
              <label className={`radio-option ${formData.hasOwnIdea ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="ideaPreference"
                  checked={formData.hasOwnIdea === true}
                  onChange={() => handleRadioChange(true)}
                  disabled={loading}
                />
                <div className="radio-content">
                  <span className="radio-icon">💡</span>
                  <div>
                    <strong>I have my own idea</strong>
                    <p className="radio-description">I want to build something specific and form a team around it</p>
                  </div>
                </div>
              </label>
              <label className={`radio-option ${formData.hasOwnIdea === false ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="ideaPreference"
                  checked={formData.hasOwnIdea === false}
                  onChange={() => handleRadioChange(false)}
                  disabled={loading}
                />
                <div className="radio-content">
                  <span className="radio-icon">🤝</span>
                  <div>
                    <strong>I'm looking to join a team</strong>
                    <p className="radio-description">I want to contribute my skills to someone else's project</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Initial Idea - Only show if they have their own idea */}
          {formData.hasOwnIdea && (
            <div className="form-group">
              <label htmlFor="initialIdea">
                Describe your idea <span className="required">*</span>
              </label>
              <textarea
                id="initialIdea"
                name="initialIdea"
                value={formData.initialIdea}
                onChange={handleChange}
                placeholder="What do you want to build? Describe your project idea..."
                rows="4"
                disabled={loading}
                className="textarea"
              />
              {errors.initialIdea && <p className="error-message">{errors.initialIdea}</p>}
            </div>
          )}

          {/* Skills Section */}
          <div className="form-group">
            <label htmlFor="skills">
              Share your skills <span className="required">*</span>
            </label>
            <textarea
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="What skills do you bring? (e.g., Frontend development, UI/UX design, Machine Learning, etc.)"
              rows="3"
              disabled={loading}
              className="textarea"
            />
            <p className="helper-text">
              💡 This helps others understand what you can contribute to a team
            </p>
            {errors.skills && <p className="error-message">{errors.skills}</p>}
          </div>

          {/* Food Preference */}
          <div className="form-group">
            <label htmlFor="foodPreference">
              Food Preference <span className="required">*</span>
            </label>
            <select
              id="foodPreference"
              name="foodPreference"
              value={formData.foodPreference}
              onChange={handleChange}
              disabled={loading}
              className="input select"
            >
              <option value="">Select your preference...</option>
              <option value="Non-vegetarian">Non-vegetarian</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Vegan">Vegan</option>
            </select>
            {errors.foodPreference && <p className="error-message">{errors.foodPreference}</p>}
          </div>

          {/* Food Notes */}
          <div className="form-group">
            <label htmlFor="foodNotes">
              Food Notes (Allergens, etc.)
            </label>
            <textarea
              id="foodNotes"
              name="foodNotes"
              value={formData.foodNotes}
              onChange={handleChange}
              placeholder="Any food allergies or additional dietary requirements? (Optional)"
              rows="2"
              disabled={loading}
              className="textarea"
            />
          </div>

          {/* Photo Consent */}
          <div className="form-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="photoConsent"
                name="photoConsent"
                checked={formData.photoConsent}
                onChange={handleChange}
                disabled={loading}
                className="checkbox"
              />
              <label htmlFor="photoConsent" className="checkbox-label">
                I consent to being photographed during the hackathon for promotional purposes <span className="required">*</span>
              </label>
            </div>
            {errors.photoConsent && <p className="error-message">{errors.photoConsent}</p>}
          </div>

          <button 
            type="submit" 
            className="button button-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (isEditing ? 'Update Information' : 'Complete Check-In')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CheckInForm;
