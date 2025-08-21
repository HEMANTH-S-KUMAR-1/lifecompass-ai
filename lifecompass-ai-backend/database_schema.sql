-- LifeCompass AI Database Schema for Supabase
-- Run these commands in your Supabase SQL editor

-- Enable Row Level Security (RLS) for all tables
-- This ensures data security and proper access control

-- 1. User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'job_seeker' CHECK (role IN ('job_seeker', 'employer', 'recruiter')),
    
    -- Profile Information
    bio TEXT,
    location VARCHAR(255),
    phone VARCHAR(50),
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    
    -- Career Information
    skills TEXT[], -- Array of skills
    experience_level VARCHAR(50) CHECK (experience_level IN ('entry', 'junior', 'intermediate', 'senior', 'expert')),
    current_position VARCHAR(255),
    current_company VARCHAR(255),
    desired_salary_min INTEGER,
    desired_salary_max INTEGER,
    
    -- Preferences
    job_preferences JSONB, -- Flexible structure for job preferences
    notification_settings JSONB DEFAULT '{"email": true, "sms": false, "push": true}',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- 2. Chat History Table
CREATE TABLE IF NOT EXISTS chat_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Chat Content
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    ai_provider VARCHAR(50) NOT NULL, -- 'google', 'openai', 'anthropic', etc.
    
    -- Context and Metadata
    session_id UUID, -- Group related conversations
    message_type VARCHAR(50) DEFAULT 'career_advice', -- Type of conversation
    tags TEXT[], -- Searchable tags
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    response_time_ms INTEGER, -- Track AI response performance
    tokens_used INTEGER -- Track token usage for cost monitoring
);

-- 3. Job Applications Table
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Job Information
    job_title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    job_url VARCHAR(500),
    job_description TEXT,
    
    -- Application Details
    application_status VARCHAR(50) DEFAULT 'applied' CHECK (
        application_status IN ('saved', 'applied', 'viewed', 'interview_scheduled', 'interviewed', 'offered', 'rejected', 'accepted', 'declined')
    ),
    application_date DATE DEFAULT CURRENT_DATE,
    
    -- Salary and Benefits
    salary_min INTEGER,
    salary_max INTEGER,
    currency VARCHAR(10) DEFAULT 'USD',
    remote_option BOOLEAN,
    
    -- Location
    job_location VARCHAR(255),
    country VARCHAR(100),
    
    -- Tracking
    source VARCHAR(100), -- Where the job was found
    recruiter_contact VARCHAR(255),
    notes TEXT,
    
    -- AI Insights
    match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100), -- AI-calculated match
    ai_analysis JSONB, -- AI insights about the job match
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Resume/CV Versions Table
CREATE TABLE IF NOT EXISTS resume_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Resume Content
    version_name VARCHAR(255) NOT NULL,
    resume_text TEXT, -- Extracted text content
    file_url VARCHAR(500), -- Storage URL (Supabase Storage)
    file_type VARCHAR(20), -- 'pdf', 'docx', etc.
    file_size INTEGER,
    
    -- AI Analysis
    ai_analysis JSONB, -- AI insights about resume quality, suggestions
    skills_extracted TEXT[], -- AI-extracted skills
    experience_summary TEXT, -- AI-generated summary
    
    -- Metadata
    is_primary BOOLEAN DEFAULT false, -- Primary resume version
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Job Recommendations Table
CREATE TABLE IF NOT EXISTS job_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Job Information
    job_title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    job_url VARCHAR(500),
    job_description TEXT,
    
    -- Recommendation Score
    match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
    recommendation_reason TEXT, -- AI explanation for recommendation
    
    -- Job Details
    salary_min INTEGER,
    salary_max INTEGER,
    currency VARCHAR(10) DEFAULT 'USD',
    job_location VARCHAR(255),
    remote_option BOOLEAN,
    job_type VARCHAR(50), -- 'full-time', 'part-time', 'contract', 'freelance'
    
    -- User Interaction
    user_feedback VARCHAR(20) CHECK (user_feedback IN ('interested', 'not_interested', 'applied', 'saved')),
    feedback_reason TEXT,
    
    -- Metadata
    recommended_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    source VARCHAR(100) -- AI model or algorithm used
);

-- 6. User Sessions Table (for tracking user activity)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Session Information
    session_token VARCHAR(255) UNIQUE,
    ip_address INET,
    user_agent TEXT,
    
    -- Activity Tracking
    pages_visited INTEGER DEFAULT 0,
    actions_performed INTEGER DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_skills ON user_profiles USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_job_recommendations_user_id ON job_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_job_recommendations_score ON job_recommendations(match_score);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON job_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resume_versions_updated_at BEFORE UPDATE ON resume_versions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (Basic - users can only see their own data)
-- Note: These are basic policies. Adjust based on your authentication system

-- User Profiles: Users can see and update their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id::text::uuid);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id::text::uuid);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id::text::uuid);

-- Chat History: Users can see their own chat history
CREATE POLICY "Users can view own chat history" ON chat_history
    FOR SELECT USING (auth.uid() = user_id::text::uuid);

CREATE POLICY "Users can insert own chat" ON chat_history
    FOR INSERT WITH CHECK (auth.uid() = user_id::text::uuid);

-- Job Applications: Users can manage their own applications
CREATE POLICY "Users can view own applications" ON job_applications
    FOR SELECT USING (auth.uid() = user_id::text::uuid);

CREATE POLICY "Users can manage own applications" ON job_applications
    FOR ALL USING (auth.uid() = user_id::text::uuid);

-- Resume Versions: Users can manage their own resumes
CREATE POLICY "Users can manage own resumes" ON resume_versions
    FOR ALL USING (auth.uid() = user_id::text::uuid);

-- Job Recommendations: Users can view their own recommendations
CREATE POLICY "Users can view own recommendations" ON job_recommendations
    FOR SELECT USING (auth.uid() = user_id::text::uuid);

CREATE POLICY "Users can update own recommendations" ON job_recommendations
    FOR UPDATE USING (auth.uid() = user_id::text::uuid);

-- User Sessions: Users can view their own sessions
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id::text::uuid);

CREATE POLICY "Users can insert own sessions" ON user_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id::text::uuid);

-- Create some useful views
CREATE OR REPLACE VIEW user_profile_summary AS
SELECT 
    up.id,
    up.email,
    up.full_name,
    up.current_position,
    up.current_company,
    up.experience_level,
    array_length(up.skills, 1) as skill_count,
    COUNT(ja.id) as total_applications,
    COUNT(CASE WHEN ja.application_status = 'applied' THEN 1 END) as active_applications,
    up.created_at,
    up.last_login
FROM user_profiles up
LEFT JOIN job_applications ja ON up.id = ja.user_id
GROUP BY up.id;

-- Insert some sample data (optional - remove in production)
-- This creates a test user for development
INSERT INTO user_profiles (email, full_name, role, skills, experience_level, bio) VALUES 
('demo@lifecompass.ai', 'Demo User', 'job_seeker', 
 ARRAY['Python', 'JavaScript', 'React', 'FastAPI', 'PostgreSQL'], 
 'intermediate',
 'Passionate software developer with 3+ years of experience building web applications.')
ON CONFLICT (email) DO NOTHING;
