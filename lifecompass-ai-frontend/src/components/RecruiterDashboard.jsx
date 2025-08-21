import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Calendar,
  Search,
  Filter,
  MoreVertical,
  Star,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const RecruiterDashboard = ({ 
  currentUser, 
  onCreateJob, 
  onEditJob, 
  onViewApplications,
  onChatWithApplicant 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Mock data - replace with API calls
  const mockStats = {
    total_jobs: 12,
    active_jobs: 8,
    draft_jobs: 2,
    closed_jobs: 2,
    total_applications: 156,
    pending_applications: 45,
    interview_applications: 12,
    successful_applications: 8
  };

  const mockJobs = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      status: 'active',
      created_at: '2024-01-15T10:00:00Z',
      application_count: 23,
      expires_at: '2024-02-15T23:59:59Z',
      is_featured: true
    },
    {
      id: '2',
      title: 'Product Manager',
      status: 'active',
      created_at: '2024-01-14T14:30:00Z',
      application_count: 18,
      expires_at: '2024-02-14T23:59:59Z',
      is_featured: false
    },
    {
      id: '3',
      title: 'UX Designer',
      status: 'draft',
      created_at: '2024-01-13T09:15:00Z',
      application_count: 0,
      expires_at: null,
      is_featured: false
    }
  ];

  const mockApplications = [
    {
      id: '1',
      job_title: 'Senior Frontend Developer',
      applicant: {
        full_name: 'John Doe',
        email: 'john@example.com',
        current_position: 'Frontend Developer',
        skills: ['React', 'TypeScript', 'Node.js']
      },
      status: 'submitted',
      created_at: '2024-01-16T10:00:00Z',
      rating: null
    },
    {
      id: '2',
      job_title: 'Senior Frontend Developer',
      applicant: {
        full_name: 'Jane Smith',
        email: 'jane@example.com',
        current_position: 'Senior Developer',
        skills: ['React', 'Vue.js', 'Python']
      },
      status: 'under_review',
      created_at: '2024-01-15T15:30:00Z',
      rating: 4
    }
  ];

  useEffect(() => {
    // Simulate API calls
    setTimeout(() => {
      setStats(mockStats);
      setJobs(mockJobs);
      setApplications(mockApplications);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-purple-100 text-purple-800';
      case 'shortlisted': return 'bg-indigo-100 text-indigo-800';
      case 'interviewed': return 'bg-cyan-100 text-cyan-800';
      case 'offered': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const StatCard = ({ title, value, icon: Icon, trend, color = 'indigo' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 flex items-center mt-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recruiter Dashboard</h1>
          <p className="text-gray-600">Manage your job postings and applications</p>
        </div>
        <button
          onClick={onCreateJob}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Post New Job
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'jobs', label: 'My Jobs' },
            { id: 'applications', label: 'Applications' },
            { id: 'analytics', label: 'Analytics' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Jobs"
              value={stats.total_jobs}
              icon={Briefcase}
              trend="+2 this month"
              color="indigo"
            />
            <StatCard
              title="Active Jobs"
              value={stats.active_jobs}
              icon={Eye}
              color="green"
            />
            <StatCard
              title="Total Applications"
              value={stats.total_applications}
              icon={Users}
              trend="+12 this week"
              color="blue"
            />
            <StatCard
              title="Pending Review"
              value={stats.pending_applications}
              icon={Clock}
              color="orange"
            />
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {applications.slice(0, 5).map((application) => (
                <div key={application.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {application.applicant.full_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {application.applicant.full_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Applied for {application.job_title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(application.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                        {application.status.replace('_', ' ')}
                      </span>
                      {application.rating && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">{application.rating}</span>
                        </div>
                      )}
                      <button
                        onClick={() => onChatWithApplicant(application)}
                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="space-y-6">
          {/* Jobs List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">My Job Postings</h2>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search jobs..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Filter className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {jobs.map((job) => (
                <div key={job.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-gray-900">{job.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                        {job.is_featured && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Posted {formatDate(job.created_at)}</span>
                        <span>{job.application_count} applications</span>
                        {job.expires_at && (
                          <span>Expires {formatDate(job.expires_at)}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewApplications(job)}
                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        <Users className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEditJob(job)}
                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="space-y-6">
          {/* Applications List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">All Applications</h2>
                <div className="flex items-center space-x-3">
                  <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="">All Statuses</option>
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="interviewed">Interviewed</option>
                    <option value="offered">Offered</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {applications.map((application) => (
                <div key={application.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {application.applicant.full_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {application.applicant.full_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {application.applicant.current_position}
                        </p>
                        <p className="text-sm text-gray-600">
                          Applied for {application.job_title}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {application.applicant.skills.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(application.status)}`}>
                        {application.status.replace('_', ' ')}
                      </span>
                      
                      {application.rating && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">{application.rating}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-full">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-full">
                          <XCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onChatWithApplicant(application)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics Dashboard</h2>
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Analytics dashboard coming soon...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;