import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Menu, X, User as UserIcon, LogOut } from 'lucide-react';

// Import pages and components
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import JobBoard from './components/JobBoard.jsx';
import ApplicationForm from './components/ApplicationForm.jsx';
import RecruiterDashboard from './components/RecruiterDashboard.jsx';
import ChatInterface from './components/ChatInterface.jsx';

// Import services
import { healthService, userService, chatService } from './services/api.js';

export default function App() {
    const [currentPage, setCurrentPage] = useState('home');
    const [currentUser, setCurrentUser] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [backendStatus, setBackendStatus] = useState({
        connected: false,
        message: 'Connecting...'
    });

    // Mock user data - replace with actual authentication
    const mockUser = {
        id: '1',
        email: 'user@example.com',
        full_name: 'John Doe',
        role: 'job_seeker',
        bio: 'Passionate software developer looking for new opportunities',
        location: 'San Francisco, CA',
        skills: ['React', 'TypeScript', 'Node.js', 'Python'],
        experience_level: 'intermediate',
        current_position: 'Frontend Developer',
        current_company: 'TechCorp'
    };

    useEffect(() => {
        // Check backend status
        healthService.checkStatus()
            .then(result => {
                if (result.success) {
                    setBackendStatus({
                        connected: true,
                        message: 'Connected'
                    });
                } else {
                    setBackendStatus({
                        connected: false,
                        message: 'Connection Failed'
                    });
                }
            })
            .catch(() => {
                setBackendStatus({
                    connected: false,
                    message: 'Connection Failed'
                });
            });
    }, []);

    const navigateTo = (page) => {
        setCurrentPage(page);
        setIsMenuOpen(false);
    };

    const handleLogin = async (loginData) => {
        setIsLoading(true);
        try {
            // Mock login - replace with actual authentication
            await new Promise(resolve => setTimeout(resolve, 1000));
            setCurrentUser(mockUser);
            navigateTo('dashboard');
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (registerData) => {
        setIsLoading(true);
        try {
            // Mock registration - replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            const newUser = {
                ...mockUser,
                ...registerData,
                id: Math.random().toString(36).substr(2, 9)
            };
            setCurrentUser(newUser);
            navigateTo('dashboard');
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        setCurrentUser(null);
        navigateTo('home');
    };

    const handleUpdateProfile = async (profileData) => {
        setIsLoading(true);
        try {
            // Mock profile update - replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setCurrentUser(prev => ({ ...prev, ...profileData }));
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'home':
                return <Home onNavigate={navigateTo} currentUser={currentUser} />;
            case 'login':
                return <Login onLogin={handleLogin} onNavigate={navigateTo} isLoading={isLoading} />;
            case 'register':
                return <Register onRegister={handleRegister} onNavigate={navigateTo} isLoading={isLoading} />;
            case 'profile':
                return <Profile currentUser={currentUser} onUpdateProfile={handleUpdateProfile} onNavigate={navigateTo} />;
            case 'jobs':
                return <JobBoard currentUser={currentUser} />;
            case 'dashboard':
                if (currentUser?.role === 'recruiter') {
                    return <RecruiterDashboard currentUser={currentUser} />;
                } else {
                    return <JobBoard currentUser={currentUser} />;
                }
            case 'messages':
                return <ChatInterface currentUser={currentUser} />;
            default:
                return <Home onNavigate={navigateTo} currentUser={currentUser} />;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar 
                currentUser={currentUser}
                onNavigate={navigateTo} 
                onLogout={handleLogout}
                isMenuOpen={isMenuOpen} 
                setIsMenuOpen={setIsMenuOpen} 
            />
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
            {currentPage === 'home' && <Footer onNavigate={navigateTo} />}
        </div>
    );
}

const Navbar = ({ currentUser, onNavigate, onLogout, isMenuOpen, setIsMenuOpen }) => {
    const getNavLinks = () => {
        if (!currentUser) {
            return [
                { name: "Jobs", page: "jobs" },
                { name: "About", page: "home" }
            ];
        }
        
        if (currentUser.role === 'recruiter') {
            return [
                { name: "Dashboard", page: "dashboard" },
                { name: "Jobs", page: "jobs" },
                { name: "Messages", page: "messages" }
            ];
        } else {
            return [
                { name: "Jobs", page: "jobs" },
                { name: "Applications", page: "applications" },
                { name: "Messages", page: "messages" }
            ];
        }
    };

    const navLinks = getNavLinks();

    return (
        <nav className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <button 
                            onClick={() => onNavigate('home')} 
                            className="flex-shrink-0 flex items-center gap-2 text-xl font-bold text-gray-900"
                        >
                            <Compass className="h-7 w-7 text-indigo-600" />
                            <span>LifeCompass ATS</span>
                        </button>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {navLinks.map((link) => (
                                <button 
                                    key={link.name} 
                                    onClick={() => onNavigate(link.page)} 
                                    className="text-gray-600 hover:bg-gray-200 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    {link.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* User Menu */}
                    <div className="hidden md:block">
                        {currentUser ? (
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => onNavigate('profile')}
                                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                                >
                                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                        {currentUser.full_name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium">{currentUser.full_name}</span>
                                </button>
                                <button
                                    onClick={onLogout}
                                    className="text-gray-500 hover:text-gray-700 p-2"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <button 
                                    onClick={() => onNavigate('login')} 
                                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Sign In
                                </button>
                                <button 
                                    onClick={() => onNavigate('register')} 
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                                >
                                    Get Started
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="-mr-2 flex md:hidden">
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)} 
                            className="bg-gray-200 inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-300"
                        >
                            {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        exit={{ opacity: 0, height: 0 }} 
                        className="md:hidden bg-white border-t border-gray-200"
                    >
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {navLinks.map((link) => (
                                <button 
                                    key={link.name} 
                                    onClick={() => onNavigate(link.page)} 
                                    className="text-gray-600 hover:bg-gray-200 hover:text-gray-900 block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors"
                                >
                                    {link.name}
                                </button>
                            ))}
                        </div>
                        {currentUser ? (
                            <div className="pt-4 pb-3 border-t border-gray-200">
                                <div className="px-2 space-y-2">
                                    <button 
                                        onClick={() => onNavigate('profile')} 
                                        className="w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-200 rounded-md"
                                    >
                                        Profile
                                    </button>
                                    <button 
                                        onClick={onLogout} 
                                        className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="pt-4 pb-3 border-t border-gray-200">
                                <div className="px-2 space-y-2">
                                    <button 
                                        onClick={() => onNavigate('login')} 
                                        className="w-full bg-gray-100 text-gray-900 px-4 py-2 rounded-md text-sm font-medium"
                                    >
                                        Sign In
                                    </button>
                                    <button 
                                        onClick={() => onNavigate('register')} 
                                        className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                                    >
                                        Get Started
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

const Footer = ({ onNavigate }) => {
    return (
        <footer className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <button 
                        onClick={() => onNavigate('home')} 
                        className="flex items-center gap-2 text-xl font-bold text-gray-900 mx-auto mb-4"
                    >
                        <Compass className="h-7 w-7 text-indigo-600" />
                        <span>LifeCompass ATS</span>
                    </button>
                    <p className="text-gray-500 text-base mb-8">
                        Connecting talent with opportunity, globally.
                    </p>
                </div>
                <div className="mt-12 border-t border-gray-200 pt-8"><p className="text-base text-gray-400 xl:text-center">&copy; {new Date().getFullYear()} LifeCompass AI. All rights reserved.</p></div>
            </div>
        </footer>
    );
};
                <div className="text-center">
                    <button 
                        onClick={() => onNavigate('home')} 
                        className="flex items-center gap-2 text-xl font-bold text-gray-900 mx-auto mb-4"
                    >
                        <Compass className="h-7 w-7 text-indigo-600" />
                        <span>LifeCompass ATS</span>
                    </button>
                    <p className="text-gray-500 text-base">
                        Connecting talent with opportunity, globally.
                    </p>
                </div>
