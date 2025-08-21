import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  Briefcase,
  Building,
  MapPin,
  DollarSign
} from 'lucide-react';

const ApplicationForm = ({ 
  job, 
  currentUser, 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}) => {
  const [formData, setFormData] = useState({
    cover_letter: '',
    resume_file: null,
    answers: {}
  });
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);

  // Mock custom questions for the job
  const customQuestions = [
    {
      id: 'experience',
      question: 'How many years of experience do you have with React?',
      type: 'text',
      required: true
    },
    {
      id: 'availability',
      question: 'When would you be available to start?',
      type: 'date',
      required: true
    },
    {
      id: 'remote_preference',
      question: 'Are you comfortable working remotely?',
      type: 'select',
      options: ['Yes, fully remote', 'Hybrid preferred', 'On-site preferred'],
      required: false
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setFormData(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: value
      }
    }));
  };

  const handleFileUpload = (file) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        resume_file: 'Please upload a PDF, DOC, or DOCX file'
      }));
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        resume_file: 'File size must be less than 5MB'
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      resume_file: file
    }));
    
    setErrors(prev => ({
      ...prev,
      resume_file: null
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.resume_file) {
      newErrors.resume_file = 'Resume is required';
    }

    if (!formData.cover_letter.trim()) {
      newErrors.cover_letter = 'Cover letter is required';
    } else if (formData.cover_letter.trim().length < 50) {
      newErrors.cover_letter = 'Cover letter must be at least 50 characters';
    }

    // Validate custom questions
    customQuestions.forEach(question => {
      if (question.required && !formData.answers[question.id]) {
        newErrors[`answer_${question.id}`] = 'This field is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // In a real app, you would upload the file to storage first
    const mockResumeUrl = 'https://example.com/resumes/resume.pdf';
    
    const applicationData = {
      job_posting_id: job.id,
      cover_letter: formData.cover_letter,
      resume_url: mockResumeUrl,
      resume_filename: formData.resume_file.name,
      answers: formData.answers
    };

    try {
      await onSubmit(applicationData);
    } catch (error) {
      console.error('Application submission failed:', error);
    }
  };

  const formatSalary = (min, max, currency) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`;
    } else if (min) {
      return `${formatter.format(min)}+`;
    }
    return 'Salary not specified';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Apply for Position</h1>
              <p className="text-indigo-100">Submit your application below</p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Job Summary */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h2>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  {job.company_name}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {job.location}
                  {job.is_remote && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Remote
                    </span>
                  )}
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {formatSalary(job.salary_min, job.salary_max, job.currency)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Resume Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resume/CV *
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-50'
                  : errors.resume_file
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {formData.resume_file ? (
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <span className="text-gray-700">{formData.resume_file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleInputChange('resume_file', null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">
                    Drag and drop your resume here, or{' '}
                    <label className="text-indigo-600 hover:text-indigo-700 cursor-pointer">
                      browse files
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-500">PDF, DOC, or DOCX (max 5MB)</p>
                </div>
              )}
            </div>
            {errors.resume_file && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.resume_file}
              </p>
            )}
          </div>

          {/* Cover Letter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Letter *
            </label>
            <textarea
              value={formData.cover_letter}
              onChange={(e) => handleInputChange('cover_letter', e.target.value)}
              rows={6}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.cover_letter ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Tell us why you're interested in this position and what makes you a great fit..."
            />
            <div className="flex justify-between items-center mt-1">
              {errors.cover_letter ? (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.cover_letter}
                </p>
              ) : (
                <p className="text-sm text-gray-500">
                  {formData.cover_letter.length} characters (minimum 50)
                </p>
              )}
            </div>
          </div>

          {/* Custom Questions */}
          {customQuestions.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Questions</h3>
              <div className="space-y-4">
                {customQuestions.map((question) => (
                  <div key={question.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {question.question}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {question.type === 'text' && (
                      <input
                        type="text"
                        value={formData.answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                          errors[`answer_${question.id}`] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    )}
                    
                    {question.type === 'date' && (
                      <input
                        type="date"
                        value={formData.answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                          errors[`answer_${question.id}`] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    )}
                    
                    {question.type === 'select' && (
                      <select
                        value={formData.answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                          errors[`answer_${question.id}`] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select an option</option>
                        {question.options.map((option, index) => (
                          <option key={index} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {errors[`answer_${question.id}`] && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors[`answer_${question.id}`]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ApplicationForm;