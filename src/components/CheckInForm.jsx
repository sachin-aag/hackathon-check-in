import { useState, useEffect } from 'react';

function CheckInForm({ email, existingData, onSubmit, loading }) {
  const [formData, setFormData] = useState({
    teamName: '',
    projectIdea: '',
    foodPreference: '',
    foodNotes: '',
    photoConsent: false
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (existingData) {
      setFormData({
        teamName: existingData.teamName || '',
        projectIdea: existingData.projectIdea || '',
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

  const validate = () => {
    const newErrors = {};
    
    if (!formData.teamName.trim()) {
      newErrors.teamName = 'Team name is required';
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
          <div className="form-group">
            <label htmlFor="teamName">
              Team Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="teamName"
              name="teamName"
              value={formData.teamName}
              onChange={handleChange}
              placeholder="Enter your team name"
              disabled={loading}
              className="input"
            />
            {errors.teamName && <p className="error-message">{errors.teamName}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="projectIdea">
              Project Idea (Optional)
            </label>
            <textarea
              id="projectIdea"
              name="projectIdea"
              value={formData.projectIdea}
              onChange={handleChange}
              placeholder="Briefly describe your project idea... (Optional)"
              rows="4"
              disabled={loading}
              className="textarea"
            />
          </div>

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
              rows="3"
              disabled={loading}
              className="textarea"
            />
          </div>

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
            {loading ? 'Saving...' : (isEditing ? 'Update Information' : 'Submit Check-In')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CheckInForm;
