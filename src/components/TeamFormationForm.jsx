import { useState, useEffect, useRef } from 'react';
import { getApprovedParticipants, saveTeamFormation } from '../services/sheetsService';

function TeamFormationForm({ currentUserEmail, existingTeamData, onComplete, onBack }) {
  const [formData, setFormData] = useState({
    teamName: existingTeamData?.teamName || '',
    projectIdea: existingTeamData?.projectIdea || ''
  });
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingParticipants, setLoadingParticipants] = useState(true);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const isEditMode = !!(existingTeamData?.teamName);
  const existingTeamName = existingTeamData?.teamName || '';

  // Sync form data with props when they change
  useEffect(() => {
    if (existingTeamData) {
      setFormData({
        teamName: existingTeamData.teamName || '',
        projectIdea: existingTeamData.projectIdea || ''
      });
    }
  }, [existingTeamData]);

  // Fetch approved participants on mount
  useEffect(() => {
    async function fetchParticipants() {
      try {
        const result = await getApprovedParticipants();
        const allParticipants = result.participants || [];
        setParticipants(allParticipants);
        
        // Find current user
        const currentUser = allParticipants.find(
          p => p.email.toLowerCase() === currentUserEmail.toLowerCase()
        );
        
        if (isEditMode && existingTeamName) {
          // Edit mode: Load all existing team members
          const existingTeamMembers = allParticipants.filter(
            p => p.teamName && p.teamName.toLowerCase() === existingTeamName.toLowerCase()
          );
          
          if (existingTeamMembers.length > 0) {
            setSelectedMembers(existingTeamMembers);
          } else if (currentUser) {
            // Fallback: just add current user if no team members found
            setSelectedMembers([currentUser]);
          }
        } else {
          // New team: just add current user
          if (currentUser) {
            setSelectedMembers([currentUser]);
          }
        }
      } catch (error) {
        console.error('Error fetching participants:', error);
        setSubmitError('Failed to load participants. Please refresh and try again.');
      } finally {
        setLoadingParticipants(false);
      }
    }
    fetchParticipants();
  }, [currentUserEmail, isEditMode, existingTeamName]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter participants for dropdown
  const filteredParticipants = participants.filter(p => {
    // Exclude already selected members
    if (selectedMembers.some(m => m.email.toLowerCase() === p.email.toLowerCase())) {
      return false;
    }
    // Exclude participants already in a DIFFERENT team (allow same team members to be re-added)
    if (p.teamName && p.teamName.trim() !== '') {
      // In edit mode, allow members from the same team
      if (isEditMode && p.teamName.toLowerCase() === existingTeamName.toLowerCase()) {
        // This person is in the same team, but they're already in selectedMembers
        // so they won't show up anyway
      } else {
        return false;
      }
    }
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        p.email.toLowerCase().includes(query) ||
        (p.name && p.name.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
  };

  const handleSelectParticipant = (participant) => {
    if (selectedMembers.length >= 4) {
      setErrors(prev => ({ ...prev, members: 'Maximum 4 team members allowed' }));
      return;
    }
    setSelectedMembers(prev => [...prev, participant]);
    setSearchQuery('');
    setShowDropdown(false);
    if (errors.members) {
      setErrors(prev => ({ ...prev, members: '' }));
    }
  };

  const handleRemoveMember = (email) => {
    // Don't allow removing current user
    if (email.toLowerCase() === currentUserEmail.toLowerCase()) {
      return;
    }
    setSelectedMembers(prev => prev.filter(m => m.email.toLowerCase() !== email.toLowerCase()));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.teamName.trim()) {
      newErrors.teamName = 'Team name is required';
    }
    
    if (!formData.projectIdea.trim()) {
      newErrors.projectIdea = 'Project idea is required';
    }
    
    if (selectedMembers.length === 0) {
      newErrors.members = 'At least one team member is required';
    }
    
    if (selectedMembers.length > 4) {
      newErrors.members = 'Maximum 4 team members allowed';
    }
    
    return newErrors;
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Show confirmation dialog if user is already in a team
    if (isEditMode) {
      setShowConfirmDialog(true);
    } else {
      handleConfirmedSubmit();
    }
  };

  const handleConfirmedSubmit = async () => {
    setShowConfirmDialog(false);
    setSubmitError('');
    setLoading(true);
    
    try {
      const emails = selectedMembers.map(m => m.email);
      await saveTeamFormation(emails, {
        teamName: formData.teamName,
        projectIdea: formData.projectIdea
      });
      onComplete(formData.teamName);
    } catch (error) {
      console.error('Error saving team:', error);
      setSubmitError('Failed to save team. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingParticipants) {
    return (
      <div className="screen-container">
        <div className="card">
          <div className="card-header">
            <div className="loading-spinner"></div>
            <p>Loading participants...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-container">
      <div className="card">
        <div className="card-header">
          <h1>{isEditMode ? '✏️ Edit Your Team' : '👥 Form Your Team'}</h1>
          <p className="subtitle">
            {isEditMode 
              ? 'Update your team details and members'
              : 'Create your team and add members (1-4 participants)'}
          </p>
        </div>

        {/* Important note about one registration per team */}
        {!isEditMode && (
          <div className="info-banner">
            <span className="info-icon">ℹ️</span>
            <div className="info-content">
              <strong>One registration per team</strong>
              <p>Only one team member needs to register the team. All selected members will be added automatically.</p>
            </div>
          </div>
        )}

        {/* Warning banner for edit mode */}
        {isEditMode && (
          <div className="warning-banner">
            <span className="warning-icon">⚠️</span>
            <div className="warning-content">
              <strong>You're editing team "{existingTeamName}"</strong>
              <p>Changes will update the team for all current members. Removed members will no longer be part of this team.</p>
            </div>
          </div>
        )}

        {submitError && (
          <div className="error-banner inline-error">
            <span>⚠️ {submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmitClick} className="form">
          {/* Team Name */}
          <div className="form-group">
            <label htmlFor="teamName">
              Team Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="teamName"
              name="teamName"
              value={formData.teamName}
              onChange={handleInputChange}
              placeholder="Enter your team name"
              disabled={loading}
              className="input"
            />
            {errors.teamName && <p className="error-message">{errors.teamName}</p>}
          </div>

          {/* Project Idea */}
          <div className="form-group">
            <label htmlFor="projectIdea">
              Project Idea <span className="required">*</span>
            </label>
            <textarea
              id="projectIdea"
              name="projectIdea"
              value={formData.projectIdea}
              onChange={handleInputChange}
              placeholder="Describe what your team will build..."
              rows="4"
              disabled={loading}
              className="textarea"
            />
            {errors.projectIdea && <p className="error-message">{errors.projectIdea}</p>}
          </div>

          {/* Team Members */}
          <div className="form-group">
            <label>
              Team Members <span className="required">*</span>
              <span className="member-count">({selectedMembers.length}/4)</span>
            </label>
            
            {/* Selected Members */}
            <div className="selected-members">
              {selectedMembers.map(member => (
                <div key={member.email} className="member-chip">
                  <span className="member-email">
                    {member.name || member.email}
                    {member.email.toLowerCase() === currentUserEmail.toLowerCase() && (
                      <span className="you-badge">(you)</span>
                    )}
                  </span>
                  {member.email.toLowerCase() !== currentUserEmail.toLowerCase() && (
                    <button
                      type="button"
                      className="remove-member"
                      onClick={() => handleRemoveMember(member.email)}
                      disabled={loading}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Search Input */}
            {selectedMembers.length < 4 && (
              <div className="participant-search" ref={dropdownRef}>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search for participants by email..."
                  disabled={loading}
                  className="input search-input"
                />
                
                {showDropdown && (
                  <div className="participant-dropdown">
                    {filteredParticipants.length > 0 ? (
                      filteredParticipants.slice(0, 10).map(p => (
                        <div
                          key={p.email}
                          className="dropdown-item"
                          onClick={() => handleSelectParticipant(p)}
                        >
                          <div className="participant-info">
                            <span className="participant-email">{p.email}</span>
                            {p.name && <span className="participant-name">{p.name}</span>}
                          </div>
                          <div className="participant-meta">
                            {p.hasCheckedIn ? (
                              <span className="status-badge checked-in">✓ Checked in</span>
                            ) : (
                              <span className="status-badge not-checked-in">Not checked in</span>
                            )}
                            {p.hasOwnIdea && (
                              <span className="status-badge has-idea">💡 Has idea</span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="dropdown-empty">
                        {searchQuery.trim() 
                          ? 'No matching participants found'
                          : 'All available participants already selected or in teams'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {errors.members && <p className="error-message">{errors.members}</p>}
            <p className="helper-text">
              💡 Only participants not already in a team are shown
            </p>
          </div>

          <div className="button-group">
            <button 
              type="submit" 
              className="button button-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEditMode ? 'Update Team' : 'Create Team')}
            </button>
            <button 
              type="button"
              className="button button-secondary"
              onClick={onBack}
              disabled={loading}
            >
              Back
            </button>
          </div>
        </form>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="confirm-dialog-overlay">
            <div className="confirm-dialog">
              <div className="confirm-dialog-header">
                <span className="confirm-icon">⚠️</span>
                <h3>Confirm Team Changes</h3>
              </div>
              <div className="confirm-dialog-body">
                <p>You are about to update team <strong>"{formData.teamName}"</strong>.</p>
                <p>This will:</p>
                <ul>
                  <li>Update the team name and project idea for all members</li>
                  <li>Add new members to this team</li>
                  <li>Remove members who are no longer selected</li>
                </ul>
                <p>Are you sure you want to continue?</p>
              </div>
              <div className="confirm-dialog-actions">
                <button 
                  className="button button-primary"
                  onClick={handleConfirmedSubmit}
                >
                  Yes, Update Team
                </button>
                <button 
                  className="button button-secondary"
                  onClick={() => setShowConfirmDialog(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeamFormationForm;
