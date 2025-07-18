import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Users, Briefcase, Compass, Search, MessageSquare, ArrowRight, Menu, X, Linkedin, Twitter, Github, Send, User, Bot, Edit, Save, PlusCircle } from 'lucide-react';

// --- Mock Data ---
const mockJobs = [
    { id: 1, title: "Frontend Developer", company: "Vercel", location: "Worldwide (Remote)", type: "Full-time", status: "Applied" },
    { id: 2, title: "Data Scientist", company: "Supabase", location: "Europe (Remote)", type: "Full-time", status: "Viewed" },
    { id: 3, title: "UX/UI Designer", company: "Framer", location: "USA (Remote)", type: "Contract", status: "Under Review" },
    { id: 4, title: "Backend Engineer", company: "Render", location: "Worldwide (Remote)", type: "Full-time", status: "Applied" },
    { id: 5, title: "Product Manager", company: "Netlify", location: "Worldwide (Remote)", type: "Full-time", status: "Applied" },
];

const mockResources = [
    { id: 1, title: "React Basics", provider: "Coursera", category: "Web Development" },
    { id: 2, title: "Intro to Python for Data Science", provider: "edX", category: "Data Science" },
    { id: 3, title: "Machine Learning Crash Course", provider: "Kaggle Learn", category: "AI/ML" },
];

const mockSeekerProfiles = [
    { id: 1, name: "Maria Garcia", headline: "Aspiring Data Scientist | Python & R", location: "Madrid, Spain" },
    { id: 2, name: "Kenji Tanaka", headline: "Frontend Developer | React & Vue.js", location: "Tokyo, Japan" },
    { id: 3, name: "Fatima Al-Fassi", headline: "UX/UI Designer with a passion for accessible design", location: "Dubai, UAE" },
];

// --- Main App Component ---
export default function App() {
    const [currentPage, setCurrentPage] = useState('home');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [backendMessage, setBackendMessage] = useState('');

    useEffect(() => {
        const apiUrl = 'http://localhost:8000/';
        axios.get(apiUrl)
            .then(response => setBackendMessage('Connected'))
            .catch(error => {
                console.error("Error connecting to backend:", error);
                setBackendMessage("Connection Failed");
            });
    }, []);

    const navigateTo = (page) => {
        setCurrentPage(page);
        setIsMenuOpen(false);
        window.scrollTo(0, 0);
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'home':
                return <HomePage navigateTo={navigateTo} />;
            case 'seeker':
                return <CareerCockpit navigateTo={navigateTo} />;
            case 'recruiter':
                return <TalentHQ navigateTo={navigateTo} />;
            default:
                return <HomePage navigateTo={navigateTo} />;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
            {backendMessage && (
                <div className={`${backendMessage === 'Connected' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'} border-l-4 p-2 text-center text-sm`}>
                    <p><strong>Backend Status:</strong> {backendMessage}</p>
                </div>
            )}
            <Navbar navigateTo={navigateTo} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentPage}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {renderPage()}
                </motion.div>
            </AnimatePresence>
            <Footer navigateTo={navigateTo} />
        </div>
    );
}

// --- Reusable Components ---
const TabButton = ({ title, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`${
            isActive
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-t-sm`}
    >
        {title}
    </button>
);

// --- Core Page Components ---
const Navbar = ({ navigateTo, isMenuOpen, setIsMenuOpen }) => {
    const navLinks = [ { name: "For Job Seekers", page: "seeker" }, { name: "For Recruiters", page: "recruiter" }, { name: "About", page: "home" }, ];
    return (
        <nav className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center"><button onClick={() => navigateTo('home')} className="flex-shrink-0 flex items-center gap-2 text-xl font-bold text-gray-900"><Compass className="h-7 w-7 text-indigo-600" /><span>LifeCompass AI</span></button></div>
                    <div className="hidden md:block"><div className="ml-10 flex items-baseline space-x-4">{navLinks.map((link) => (<button key={link.name} onClick={() => navigateTo(link.page)} className="text-gray-600 hover:bg-gray-200 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">{link.name}</button>))}</div></div>
                    <div className="hidden md:block"><button onClick={() => navigateTo('seeker')} className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-transform hover:scale-105">Get Started</button></div>
                    <div className="-mr-2 flex md:hidden"><button onClick={() => setIsMenuOpen(!isMenuOpen)} className="bg-gray-200 inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-200 focus:ring-white"><span className="sr-only">Open main menu</span>{isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}</button></div>
                </div>
            </div>
            <AnimatePresence>{isMenuOpen && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden"><div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">{navLinks.map((link) => (<button key={link.name} onClick={() => navigateTo(link.page)} className="text-gray-600 hover:bg-gray-200 hover:text-gray-900 block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors">{link.name}</button>))}</div><div className="pt-4 pb-3 border-t border-gray-200"><div className="px-2"><button onClick={() => navigateTo('seeker')} className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-transform hover:scale-105">Get Started</button></div></div></motion.div>)}</AnimatePresence>
        </nav>
    );
};

const HomePage = ({ navigateTo }) => {
    return (
        <main>
            <header className="bg-white"><div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 text-center"><motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">Your <span className="text-indigo-600">Global Career</span> Starts Here</motion.h1><motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-600">LifeCompass AI is the global marketplace connecting emerging talent with remote and international opportunities. Break down geographical barriers and build the future of your career.</motion.p><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="mt-8 flex justify-center gap-4 flex-wrap"><button onClick={() => navigateTo('seeker')} className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-transform hover:scale-105 shadow-lg">Find My Next Role <ArrowRight className="ml-2 h-5 w-5" /></button><button onClick={() => navigateTo('recruiter')} className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-transform hover:scale-105 shadow-lg">Hire Global Talent</button></motion.div></div></header>
            <section className="py-20 bg-gray-50"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="text-center"><h2 className="text-3xl font-extrabold text-gray-900">A Platform Built for a Borderless World</h2><p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">Dedicated spaces for job seekers and recruiters to thrive globally.</p></div><div className="mt-16 grid md:grid-cols-2 gap-16 items-center"><FeatureCard icon={<Users className="h-12 w-12 text-white" />} title="For Job Seekers" subtitle="Your Career Cockpit 🚀" description="Build a universal profile, get AI-powered learning paths, and track your applications to global opportunities in one place." onClick={() => navigateTo('seeker')} /><FeatureCard icon={<Briefcase className="h-12 w-12 text-white" />} title="For Recruiters" subtitle="Your Talent HQ 🎯" description="Showcase your company, post jobs for a global audience, and discover skilled talent from anywhere in the world." onClick={() => navigateTo('recruiter')} /></div></div></section>
        </main>
    );
};

const Footer = ({ navigateTo }) => {
    return (
        <footer className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8"><div className="space-y-8 xl:col-span-1"><button onClick={() => navigateTo('home')} className="flex items-center gap-2 text-xl font-bold text-gray-900"><Compass className="h-7 w-7 text-indigo-600" /><span>LifeCompass AI</span></button><p className="text-gray-500 text-base">Democratizing access to opportunity, for anyone, anywhere.</p><div className="flex space-x-6"><a href="#" className="text-gray-400 hover:text-gray-500"><Linkedin /></a><a href="#" className="text-gray-400 hover:text-gray-500"><Twitter /></a><a href="#" className="text-gray-400 hover:text-gray-500"><Github /></a></div></div><div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2"><div className="md:grid md:grid-cols-2 md:gap-8"><div><h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Solutions</h3><ul className="mt-4 space-y-4"><li><button onClick={() => navigateTo('seeker')} className="text-base text-gray-500 hover:text-gray-900">For Job Seekers</button></li><li><button onClick={() => navigateTo('recruiter')} className="text-base text-gray-500 hover:text-gray-900">For Recruiters</button></li></ul></div><div className="mt-12 md:mt-0"><h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3><ul className="mt-4 space-y-4"><li><button onClick={() => navigateTo('home')} className="text-base text-gray-500 hover:text-gray-900">About</button></li><li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Careers</a></li></ul></div></div><div className="md:grid md:grid-cols-2 md:gap-8"><div><h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3><ul className="mt-4 space-y-4"><li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Privacy</a></li><li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Terms</a></li></ul></div></div></div></div>
                <div className="mt-12 border-t border-gray-200 pt-8"><p className="text-base text-gray-400 xl:text-center">&copy; {new Date().getFullYear()} LifeCompass AI. All rights reserved.</p></div>
            </div>
        </footer>
    );
};

// --- Job Seeker Components ---
const CareerCockpit = ({ navigateTo }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const renderContent = () => {
        switch(activeTab) {
            case 'dashboard': return <ApplicationTrackingDashboard />;
            case 'search': return <GlobalJobSearch />;
            case 'learning': return <LearningPaths />;
            case 'profile': return <UniversalProfile />;
            default: return <ApplicationTrackingDashboard />;
        }
    };
    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-gray-900">Career Cockpit 🚀</h1><p className="mt-2 text-lg text-gray-600">Your central hub for launching a global career.</p>
            <div className="mt-8 border-b border-gray-200"><nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs"><TabButton title="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} /><TabButton title="Global Job Search" isActive={activeTab === 'search'} onClick={() => setActiveTab('search')} /><TabButton title="Learning Paths" isActive={activeTab === 'learning'} onClick={() => setActiveTab('learning')} /><TabButton title="My Profile" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} /></nav></div>
            <div className="mt-8">{renderContent()}</div>
            <CareerCompassChatbot />
        </div>
    );
};

const ApplicationTrackingDashboard = () => {
    const getStatusColor = (status) => {
        switch (status) {
            case "Applied": return "bg-blue-100 text-blue-800";
            case "Viewed": return "bg-purple-100 text-purple-800";
            case "Under Review": return "bg-yellow-100 text-yellow-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };
    return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><h2 className="text-2xl font-semibold text-gray-800 mb-4">Application Status</h2><div className="bg-white shadow overflow-hidden sm:rounded-md"><ul role="list" className="divide-y divide-gray-200">{mockJobs.map((job) => (<li key={job.id}><a href="#" className="block hover:bg-gray-50"><div className="px-4 py-4 sm:px-6"><div className="flex items-center justify-between"><p className="text-lg font-medium text-indigo-600 truncate">{job.title}</p><div className="ml-2 flex-shrink-0 flex"><p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(job.status)}`}>{job.status}</p></div></div><div className="mt-2 sm:flex sm:justify-between"><div className="sm:flex"><p className="flex items-center text-sm text-gray-500"><Briefcase className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />{job.company}</p><p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6"><Compass className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />{job.location}</p></div></div></div></a></li>))}</ul></div></motion.div>);
};

const GlobalJobSearch = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [locationQuery, setLocationQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState([]);

    const handleSearch = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setResults([]);
        // Simulate API call
        setTimeout(() => {
            const filteredJobs = mockJobs.filter(job => 
                job.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
                job.location.toLowerCase().includes(locationQuery.toLowerCase())
            );
            setResults(filteredJobs);
            setIsLoading(false);
        }, 1000);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Find Your Next Global Opportunity</h2>
            <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input type="text" placeholder="Role, skill, or company" className="md:col-span-2 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    <input type="text" placeholder="Country, Region, or 'Worldwide'" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" value={locationQuery} onChange={e => setLocationQuery(e.target.value)} />
                    <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:bg-indigo-400">
                        {isLoading ? 'Searching...' : <><Search className="h-5 w-5" /> Search</>}
                    </button>
                </div>
            </form>
            <div className="mt-8">
                {isLoading && <p className="text-center text-gray-500">Searching for opportunities...</p>}
                {!isLoading && results.length > 0 && (
                    <div className="space-y-4">
                        {results.map(job => (
                             <div key={job.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-lg font-semibold text-indigo-600">{job.title}</p>
                                        <p className="text-sm text-gray-600">{job.company} - {job.location}</p>
                                    </div>
                                    <button className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-200">Apply</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                 {!isLoading && results.length === 0 && <p className="text-center text-gray-500">No results found. Try a different search.</p>}
            </div>
        </motion.div>
    );
};

const LearningPaths = () => {
    return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><h2 className="text-2xl font-semibold text-gray-800 mb-4">AI-Powered Learning Recommendations</h2><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{mockResources.map(resource => (<div key={resource.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"><p className="text-sm font-semibold text-indigo-600">{resource.category}</p><h3 className="text-lg font-bold text-gray-800 mt-1">{resource.title}</h3><p className="text-gray-500 mt-2">Provider: {resource.provider}</p><a href="#" className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium">Start Learning <ArrowRight className="ml-1 h-4 w-4" /></a></div>))}</div></motion.div>);
};

const UniversalProfile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: "Alex Doe",
        headline: "Early-career professional seeking remote opportunities in tech.",
        location: "Global"
    });
    const [message, setMessage] = useState('');

    const handleSave = () => {
        setIsEditing(false);
        setMessage('Profile saved successfully!');
        setTimeout(() => setMessage(''), 3000);
    };
    
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Your Universal Profile</h2>
                <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                    {isEditing ? <><Save size={18}/> Save</> : <><Edit size={18}/> Edit Profile</>}
                </button>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
                {message && <div className="mb-4 text-center p-2 rounded-md bg-green-100 text-green-800">{message}</div>}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" disabled={!isEditing} value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Headline</label>
                        <input type="text" disabled={!isEditing} value={profile.headline} onChange={e => setProfile({...profile, headline: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <input type="text" disabled={!isEditing} value={profile.location} onChange={e => setProfile({...profile, location: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"/>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};


// --- Recruiter Components ---
const TalentHQ = ({ navigateTo }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const renderContent = () => {
        switch(activeTab) {
            case 'dashboard': return <RecruiterDashboard />;
            case 'postJob': return <PostJobForm />;
            case 'searchTalent': return <TalentSearch />;
            default: return <RecruiterDashboard />;
        }
    };
    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-gray-900">Talent HQ 🎯</h1>
            <p className="mt-2 text-lg text-gray-600">Discover and hire the world's best talent.</p>
            <div className="mt-8 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                    <TabButton title="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <TabButton title="Post a Job" isActive={activeTab === 'postJob'} onClick={() => setActiveTab('postJob')} />
                    <TabButton title="Search Talent" isActive={activeTab === 'searchTalent'} onClick={() => setActiveTab('searchTalent')} />
                </nav>
            </div>
            <div className="mt-8">{renderContent()}</div>
        </div>
    );
};

const RecruiterDashboard = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Active Listings</h2>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <Briefcase className="mx-auto h-12 w-12 text-indigo-400" />
            <p className="mt-4 text-gray-600">Your posted jobs and applicant pipelines will appear here.</p>
        </div>
    </motion.div>
);

const PostJobForm = () => {
    const [jobDetails, setJobDetails] = useState({ title: '', company: '', location: '', description: '' });
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage(`Job "${jobDetails.title}" posted successfully!`);
        setJobDetails({ title: '', company: '', location: '', description: '' });
        setTimeout(() => setMessage(''), 4000);
    };

    return (
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Create a New Job Posting</h2>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
                {message && <div className="w-full text-center p-3 rounded-md bg-green-100 text-green-800">{message}</div>}
                <div>
                    <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">Job Title</label>
                    <input type="text" id="jobTitle" value={jobDetails.title} onChange={e => setJobDetails({...jobDetails, title: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required/>
                </div>
                 <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company</label>
                    <input type="text" id="company" value={jobDetails.company} onChange={e => setJobDetails({...jobDetails, company: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required/>
                </div>
                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location (e.g., "USA Remote", "Worldwide")</label>
                    <input type="text" id="location" value={jobDetails.location} onChange={e => setJobDetails({...jobDetails, location: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required/>
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Job Description</label>
                    <textarea id="description" rows="4" value={jobDetails.description} onChange={e => setJobDetails({...jobDetails, description: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" required/>
                </div>
                <button type="submit" className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                    <PlusCircle size={20}/> Post Job
                </button>
            </form>
        </motion.div>
    );
};

const TalentSearch = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Worldwide Talent Database</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input type="text" placeholder="Skill, role, or keyword" className="md:col-span-2 w-full px-4 py-2 border border-gray-300 rounded-md"/>
                <input type="text" placeholder="Country or Region" className="w-full px-4 py-2 border border-gray-300 rounded-md"/>
                <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 flex items-center justify-center gap-2">
                    <Search className="h-5 w-5" /> Search Talent
                </button>
            </div>
        </div>
        <div className="mt-8 space-y-4">
            {mockSeekerProfiles.map(profile => (
                <div key={profile.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-lg font-semibold text-indigo-600">{profile.name}</p>
                            <p className="text-sm text-gray-600">{profile.headline}</p>
                            <p className="text-xs text-gray-500 mt-1">{profile.location}</p>
                        </div>
                        <button className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-200">View Profile</button>
                    </div>
                </div>
            ))}
        </div>
    </motion.div>
);


// --- Chatbot Component ---
const FeatureCard = ({ icon, title, subtitle, description, onClick }) => (<motion.div whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }} className="bg-white p-8 rounded-xl shadow-md cursor-pointer" onClick={onClick}><div className="flex items-center gap-6"><div className="flex-shrink-0 bg-indigo-600 p-4 rounded-full">{icon}</div><div><h3 className="text-lg font-medium text-gray-500">{title}</h3><p className="text-2xl font-bold text-gray-900">{subtitle}</p></div></div><p className="mt-6 text-gray-600">{description}</p></motion.div>);

const CareerCompassChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([ { sender: 'ai', text: "Hello! I'm Career Compass. How can I help you with your global career journey today?" } ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;
        const userMessage = { sender: 'user', text: inputValue };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:8000/api/chat', { message: inputValue });
            const aiMessage = { sender: 'ai', text: response.data.reply };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Error communicating with chatbot API:", error);
            const errorMessage = { sender: 'ai', text: "I'm sorry, I'm having trouble connecting right now." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIsOpen(!isOpen)} className="bg-indigo-600 text-white rounded-full p-4 shadow-lg flex items-center justify-center">
                    {isOpen ? <X className="h-8 w-8" /> : <MessageSquare className="h-8 w-8" />}
                </motion.button>
            </div>
            <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.5 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.5 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed bottom-24 right-6 w-full max-w-sm h-[60vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
                >
                    <div className="bg-indigo-600 text-white p-4 rounded-t-xl flex-shrink-0"><h3 className="font-bold text-lg">Career Compass 🧭</h3><p className="text-sm opacity-90">Your AI Career Advisor</p></div>
                    <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-2.5 my-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                                {msg.sender === 'ai' && <div className="flex-shrink-0 bg-indigo-500 text-white rounded-full h-8 w-8 flex items-center justify-center"><Bot size={18}/></div>}
                                <div className={`p-3 rounded-lg max-w-xs ${msg.sender === 'user' ? 'bg-indigo-100 text-gray-800 rounded-br-none' : 'bg-white text-gray-800 shadow-sm rounded-bl-none'}`}><p className="text-sm">{msg.text}</p></div>
                                {msg.sender === 'user' && <div className="flex-shrink-0 bg-gray-300 text-gray-700 rounded-full h-8 w-8 flex items-center justify-center"><User size={18}/></div>}
                            </div>
                        ))}
                        {isLoading && (
                             <div className="flex items-start gap-2.5 my-2">
                                <div className="flex-shrink-0 bg-indigo-500 text-white rounded-full h-8 w-8 flex items-center justify-center"><Bot size={18}/></div>
                                <div className="p-3 rounded-lg bg-white shadow-sm rounded-bl-none">
                                    <div className="flex items-center space-x-1">
                                        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }} className="h-2 w-2 bg-gray-400 rounded-full"/>
                                        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="h-2 w-2 bg-gray-400 rounded-full"/>
                                        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="h-2 w-2 bg-gray-400 rounded-full"/>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    <form onSubmit={handleSubmit} className="p-4 border-t bg-white flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <input type="text" placeholder="Ask about resumes, interviews..." className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition" value={inputValue} onChange={(e) => setInputValue(e.target.value)} disabled={isLoading}/>
                            <button type="submit" disabled={isLoading} className="bg-indigo-600 text-white p-2.5 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 transition"><Send size={20}/></button>
                        </div>
                    </form>
                </motion.div>
            )}
            </AnimatePresence>
        </>
    );
};
