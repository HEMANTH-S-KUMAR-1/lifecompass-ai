import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Building, 
  Edit, 
  Save, 
  X,
  Plus,
  Trash2,
  ExternalLink,
  Star,
  Calendar,
  Award
} from 'lucide-react';

const Profile = ({ currentUser, onUpdateProfile, onNavigate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    bio: '',
    location: '',
    phone: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
    skills: [],
    experience_level: '',
    current_position: '',
    current_company: '',
    company_name: '',
    company_website: '',
    company_size: ''
  });
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        full_name: currentUser.full_name || '',
        email: currentUser.email || '',
        bio: currentUser.bio || '',
        location: currentUser.location || '',
        phone: currentUser.phone || '',
        linkedin_url: currentUser.linkedin_url || '',
        github_url: currentUser.github_url || '',
        portfolio_url: currentUser.portfolio_url || '',
        skills: currentUser.skills || [],
        experience_level: currentUser.experience_level || '',
        current_position: currentUser.current_position || '',
        current_company: currentUser.current_company || '',
        company_name: currentUser.company_name || '',
        company_website: currentUser.company_website || '',
        company_size: currentUser.company_size || ''
      });
    }
  }, [currentUser]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (currentUser) {
      setFormData({
        full_name: currentUser.full_name || '',
        email: currentUser.email || '',
        bio: currentUser.bio || '',
        location: currentUser.location || '',
        phone: currentUser.phone || '',
        linkedin_url: currentUser.linkedin_url || '',
        github_url: currentUser.github_url || '',
        portfolio_url: currentUser.portfolio_url || '',
        skills: currentUser.skills || [],
        experience_level: currentUser.experience_level || '',
        current_position: currentUser.current_position || '',
        current_company: currentUser.current_company || '',
        company_name: currentUser.company_name || '',
        company_website: currentUser.company_website || '',
        company_size: currentUser.company_size || ''
      });
    }
    setIsEditing(false);
  };

  const isJobSeeker = currentUser?.role === 'job_seeker';
  const isRecruiter = currentUser?.role === 'recruiter';

  // Mock data for demonstration
  const mockStats = {
    job_seeker: {
      applications_sent: 12,
      interviews_scheduled: 3,
      profile_views: 45,
      saved_jobs: 8
    },
    recruiter: {
      jobs_posted: 5,
      applications_received: 67,
      candidates_interviewed: 15,
      positions_filled: 2
    }
  };

  const stats = mockStats[currentUser?.role] || {};

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="relative">
          {/* Cover Photo */}
          <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-lg"></div>
          
          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            <div className="flex items-end -mt-16 mb-4">
              <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {formData.full_name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{formData.full_name}</h1>
                    <p className="text-gray-600">
                      {isJobSeeker && formData.current_position && (
                        <span>{formData.current_position}</span>
                      )}
                      {isJobSeeker && formData.current_company && (
                        <span> at {formData.current_company}</span>
                      )}
                      {isRecruiter && formData.company_name && (
                        <span>Recruiter at {formData.company_name}</span>
                      )}
                    </p>
                    {formData.location && (
                      <p className="text-gray-500 flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {formData.location}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleSave}
                          disabled={loading}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {loading ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
            {isEditing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-gray-700">
                {formData.bio || 'No bio added yet.'}
              </p>
            )}
          </div>

          {/* Skills Section (Job Seekers) */}
          {isJobSeeker && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills</h2>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Add a skill..."
                    />
                    <button
                      onClick={handleAddSkill}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                      >
                        {skill}
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-2 text-indigo-600 hover:text-indigo-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.length > 0 ? (
                    formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No skills added yet.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-700 flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    {formData.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Your phone number"
                  />
                ) : (
                  <p className="text-gray-700 flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    {formData.phone || 'Not provided'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                {isEditing ? (
                  <input
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="LinkedIn profile URL"
                  />
                ) : (
                  formData.linkedin_url ? (
                    <a
                      href={formData.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-700 flex items-center"
                    >
                      LinkedIn Profile
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </a>
                  ) : (
                    <p className="text-gray-500">Not provided</p>
                  )
                )}
              </div>

              {isJobSeeker && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio</label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={formData.portfolio_url}
                      onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Portfolio website URL"
                    />
                  ) : (
                    formData.portfolio_url ? (
                      <a
                        href={formData.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-700 flex items-center"
                      >
                        View Portfolio
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </a>
                    ) : (
                      <p className="text-gray-500">Not provided</p>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {isJobSeeker ? 'Job Search Stats' : 'Recruiting Stats'}
            </h3>
            <div className="space-y-4">
              {Object.entries(stats).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-gray-600 capitalize">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className="font-semibold text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Experience Level (Job Seekers) */}
          {isJobSeeker && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience</h3>
              {isEditing ? (
                <select
                  value={formData.experience_level}
                  onChange={(e) => handleInputChange('experience_level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select level</option>
                  <option value="entry">Entry Level</option>
                  <option value="junior">Junior</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="senior">Senior</option>
                  <option value="expert">Expert</option>
                </select>
              ) : (
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-indigo-600 mr-2" />
                  <span className="capitalize">
                    {formData.experience_level || 'Not specified'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Company Info (Recruiters) */}
          {isRecruiter && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-700 flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      {formData.company_name || 'Not provided'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={formData.company_website}
                      onChange={(e) => handleInputChange('company_website', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Company website URL"
                    />
                  ) : (
                    formData.company_website ? (
                      <a
                        href={formData.company_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-700 flex items-center"
                      >
                        Company Website
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </a>
                    ) : (
                      <p className="text-gray-500">Not provided</p>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {isJobSeeker && (
                <>
                  <button
                    onClick={() => onNavigate('jobs')}
                    className="w-full text-left px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    Browse Jobs
                  </button>
                  <button
                    onClick={() => onNavigate('applications')}
                    className="w-full text-left px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    My Applications
                  </button>
                </>
              )}
              {isRecruiter && (
                <>
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="w-full text-left px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    Recruiter Dashboard
                  </button>
                  <button
                    onClick={() => onNavigate('post-job')}
                    className="w-full text-left px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    Post New Job
                  </button>
                </>
              )}
              <button
                onClick={() => onNavigate('messages')}
                className="w-full text-left px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                Messages
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;