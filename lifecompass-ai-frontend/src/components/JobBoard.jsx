import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Clock, 
  DollarSign, 
  Briefcase, 
  Filter,
  Heart,
  ExternalLink,
  Building,
  Users,
  Calendar
} from 'lucide-react';

const JobBoard = ({ 
  currentUser, 
  onApplyToJob, 
  onSaveJob, 
  onViewJob,
  savedJobs = [],
  appliedJobs = []
}) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    work_type: '',
    is_remote: null,
    salary_min: '',
    salary_max: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Mock job data - replace with API call
  const mockJobs = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company_name: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      is_remote: true,
      work_type: 'full-time',
      salary_min: 120000,
      salary_max: 160000,
      currency: 'USD',
      description: 'We are looking for a Senior Frontend Developer to join our growing team...',
      skills_required: ['React', 'TypeScript', 'CSS', 'JavaScript'],
      skills_preferred: ['Next.js', 'GraphQL', 'Tailwind CSS'],
      created_at: '2024-01-15T10:00:00Z',
      expires_at: '2024-02-15T23:59:59Z',
      recruiter: {
        full_name: 'Sarah Johnson',
        company_name: 'TechCorp Inc.'
      },
      application_count: 45
    },
    {
      id: '2',
      title: 'Product Manager',
      company_name: 'StartupXYZ',
      location: 'New York, NY',
      is_remote: false,
      work_type: 'full-time',
      salary_min: 100000,
      salary_max: 140000,
      currency: 'USD',
      description: 'Join our product team to drive innovation and growth...',
      skills_required: ['Product Management', 'Analytics', 'User Research'],
      skills_preferred: ['SQL', 'A/B Testing', 'Figma'],
      created_at: '2024-01-14T14:30:00Z',
      expires_at: '2024-02-14T23:59:59Z',
      recruiter: {
        full_name: 'Mike Chen',
        company_name: 'StartupXYZ'
      },
      application_count: 23
    },
    {
      id: '3',
      title: 'UX/UI Designer',
      company_name: 'Design Studio',
      location: 'Remote',
      is_remote: true,
      work_type: 'contract',
      salary_min: 80000,
      salary_max: 100000,
      currency: 'USD',
      description: 'Create beautiful and intuitive user experiences...',
      skills_required: ['Figma', 'Adobe Creative Suite', 'User Research'],
      skills_preferred: ['Prototyping', 'Animation', 'HTML/CSS'],
      created_at: '2024-01-13T09:15:00Z',
      expires_at: '2024-02-13T23:59:59Z',
      recruiter: {
        full_name: 'Emma Davis',
        company_name: 'Design Studio'
      },
      application_count: 67
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setJobs(mockJobs);
      setLoading(false);
    }, 1000);
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const filteredJobs = jobs.filter(job => {
    if (filters.search && !job.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !job.company_name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    if (filters.work_type && job.work_type !== filters.work_type) {
      return false;
    }
    if (filters.is_remote !== null && job.is_remote !== filters.is_remote) {
      return false;
    }
    if (filters.salary_min && job.salary_max < parseInt(filters.salary_min)) {
      return false;
    }
    if (filters.salary_max && job.salary_min > parseInt(filters.salary_max)) {
      return false;
    }
    return true;
  });

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
    } else if (max) {
      return `Up to ${formatter.format(max)}`;
    }
    return 'Salary not specified';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const posted = new Date(timestamp);
    const diffInHours = Math.floor((now - posted) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const isJobSaved = (jobId) => savedJobs.includes(jobId);
  const isJobApplied = (jobId) => appliedJobs.includes(jobId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Board</h1>
        <p className="text-gray-600">Discover your next career opportunity</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search jobs, companies, or keywords..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Location"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </button>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-200 pt-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select
                  value={filters.work_type}
                  onChange={(e) => handleFilterChange('work_type', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Job Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>

                <select
                  value={filters.is_remote === null ? '' : filters.is_remote.toString()}
                  onChange={(e) => handleFilterChange('is_remote', e.target.value === '' ? null : e.target.value === 'true')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Locations</option>
                  <option value="true">Remote</option>
                  <option value="false">On-site</option>
                </select>

                <input
                  type="number"
                  placeholder="Min Salary"
                  value={filters.salary_min}
                  onChange={(e) => handleFilterChange('salary_min', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />

                <input
                  type="number"
                  placeholder="Max Salary"
                  value={filters.salary_max}
                  onChange={(e) => handleFilterChange('salary_max', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Job Listings */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredJobs.map((job) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 hover:text-indigo-600 cursor-pointer">
                      {job.title}
                    </h3>
                    <button
                      onClick={() => onSaveJob(job.id)}
                      className={`p-2 rounded-full transition-colors ${
                        isJobSaved(job.id)
                          ? 'text-red-500 hover:text-red-600'
                          : 'text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${isJobSaved(job.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-1" />
                      {job.company_name}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.location}
                      {job.is_remote && (
                        <span className="ml-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Remote
                        </span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-1" />
                      <span className="capitalize">{job.work_type.replace('-', ' ')}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-gray-600 mb-4">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {formatSalary(job.salary_min, job.salary_max, job.currency)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatTimeAgo(job.created_at)}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {job.application_count} applicants
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-2">
                    {job.description}
                  </p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills_required.slice(0, 5).map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills_required.length > 5 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                        +{job.skills_required.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  {isJobApplied(job.id) ? (
                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
                      Applied
                    </span>
                  ) : (
                    <button
                      onClick={() => onApplyToJob(job)}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                      Apply Now
                    </button>
                  )}
                  
                  <button
                    onClick={() => onViewJob(job)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center"
                  >
                    View Details
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </button>
                </div>

                <div className="text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Expires {new Date(job.expires_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or filters to find more opportunities.
          </p>
        </div>
      )}
    </div>
  );
};

export default JobBoard;