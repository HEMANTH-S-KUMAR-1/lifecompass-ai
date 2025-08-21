-- ATS Database Schema for Supabase
-- Extended schema for Applicant Tracking System functionality
-- Run these commands in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('job_seeker', 'recruiter', 'admin');
CREATE TYPE application_status AS ENUM (
    'submitted', 'under_review', 'shortlisted', 'interview_scheduled', 
    'interviewed', 'offered', 'rejected', 'withdrawn'
);
CREATE TYPE job_status AS ENUM ('draft', 'active', 'paused', 'closed');
CREATE TYPE message_type AS ENUM ('text', 'file', 'system');

-- 1. Users Table (Enhanced)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'job_seeker',
    
    -- Profile Information
    bio TEXT,
    location VARCHAR(255),
    phone VARCHAR(50),
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    
    -- Job seeker specific fields
    skills JSONB DEFAULT '[]',
    experience_level VARCHAR(50),
    current_position VARCHAR(255),
    current_company VARCHAR(255),
    desired_salary_min INTEGER,
    desired_salary_max INTEGER,
    
    -- Recruiter specific fields
    company_name VARCHAR(255),
    company_website VARCHAR(500),
    company_size VARCHAR(50),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- 2. Job Postings Table
CREATE TABLE IF NOT EXISTS job_postings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recruiter_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    
    -- Job details
    title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    responsibilities TEXT,
    
    -- Location and work arrangement
    location VARCHAR(255),
    is_remote BOOLEAN DEFAULT false,
    work_type VARCHAR(50), -- full-time, part-time, contract, internship
    
    -- Compensation
    salary_min INTEGER,
    salary_max INTEGER,
    currency VARCHAR(10) DEFAULT 'USD',
    
    -- Job metadata
    department VARCHAR(100),
    experience_level VARCHAR(50),
    skills_required JSONB DEFAULT '[]',
    skills_preferred JSONB DEFAULT '[]',
    
    -- Status and visibility
    status job_status DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_posting_id UUID REFERENCES job_postings(id) ON DELETE CASCADE NOT NULL,
    applicant_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    
    -- Application content
    cover_letter TEXT,
    resume_url VARCHAR(500),
    resume_filename VARCHAR(255),
    
    -- Application status and tracking
    status application_status DEFAULT 'submitted',
    status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status_updated_by UUID REFERENCES users(id),
    
    -- Additional data
    answers JSONB DEFAULT '{}', -- Custom application questions and answers
    notes TEXT, -- Internal recruiter notes
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one application per user per job
    UNIQUE(job_posting_id, applicant_id)
);

-- 4. Application Status History Table
CREATE TABLE IF NOT EXISTS application_status_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE NOT NULL,
    
    -- Status change details
    old_status application_status,
    new_status application_status NOT NULL,
    changed_by UUID REFERENCES users(id) NOT NULL,
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
    
    -- Message content
    message TEXT NOT NULL,
    message_type message_type DEFAULT 'text',
    file_url VARCHAR(500),
    file_name VARCHAR(255),
    
    -- Message status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Saved Jobs Table
CREATE TABLE IF NOT EXISTS saved_jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    job_posting_id UUID REFERENCES job_postings(id) ON DELETE CASCADE NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one save per user per job
    UNIQUE(user_id, job_posting_id)
);

-- 7. Job Views Table (Analytics)
CREATE TABLE IF NOT EXISTS job_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Optional: anonymous views
    job_posting_id UUID REFERENCES job_postings(id) ON DELETE CASCADE NOT NULL,
    
    -- View metadata
    ip_address INET,
    user_agent TEXT,
    referrer VARCHAR(500),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    
    -- Notification content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- application_update, new_message, job_match, etc.
    
    -- Related entities
    related_id UUID, -- ID of related entity (application, job, message, etc.)
    related_type VARCHAR(50), -- Type of related entity
    
    -- Notification status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_skills ON users USING GIN(skills);

CREATE INDEX IF NOT EXISTS idx_job_postings_recruiter ON job_postings(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_location ON job_postings(location);
CREATE INDEX IF NOT EXISTS idx_job_postings_work_type ON job_postings(work_type);
CREATE INDEX IF NOT EXISTS idx_job_postings_skills_required ON job_postings USING GIN(skills_required);
CREATE INDEX IF NOT EXISTS idx_job_postings_created_at ON job_postings(created_at);

CREATE INDEX IF NOT EXISTS idx_applications_job_posting ON applications(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at);

CREATE INDEX IF NOT EXISTS idx_application_history_application ON application_status_history(application_id);
CREATE INDEX IF NOT EXISTS idx_application_history_created_at ON application_status_history(created_at);

CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_recipient ON chat_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_application ON chat_messages(application_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_unread ON chat_messages(recipient_id, is_read) WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_posting ON saved_jobs(job_posting_id);

CREATE INDEX IF NOT EXISTS idx_job_views_job_posting ON job_views(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_job_views_user ON job_views(user_id);
CREATE INDEX IF NOT EXISTS idx_job_views_created_at ON job_views(created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_postings_updated_at BEFORE UPDATE ON job_postings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Users: Users can see and update their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Job Postings: Public read for active jobs, recruiters can manage their own
CREATE POLICY "Anyone can view active job postings" ON job_postings
    FOR SELECT USING (status = 'active');

CREATE POLICY "Recruiters can view own job postings" ON job_postings
    FOR SELECT USING (auth.uid()::text = recruiter_id::text);

CREATE POLICY "Recruiters can manage own job postings" ON job_postings
    FOR ALL USING (auth.uid()::text = recruiter_id::text);

-- Applications: Applicants see their own, recruiters see applications to their jobs
CREATE POLICY "Applicants can view own applications" ON applications
    FOR SELECT USING (auth.uid()::text = applicant_id::text);

CREATE POLICY "Applicants can create applications" ON applications
    FOR INSERT WITH CHECK (auth.uid()::text = applicant_id::text);

CREATE POLICY "Applicants can update own applications" ON applications
    FOR UPDATE USING (auth.uid()::text = applicant_id::text);

CREATE POLICY "Recruiters can view applications to their jobs" ON applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM job_postings 
            WHERE job_postings.id = applications.job_posting_id 
            AND job_postings.recruiter_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Recruiters can update applications to their jobs" ON applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM job_postings 
            WHERE job_postings.id = applications.job_posting_id 
            AND job_postings.recruiter_id::text = auth.uid()::text
        )
    );

-- Application Status History: Same as applications
CREATE POLICY "Users can view application history" ON application_status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM applications 
            WHERE applications.id = application_status_history.application_id 
            AND (applications.applicant_id::text = auth.uid()::text
                OR EXISTS (
                    SELECT 1 FROM job_postings 
                    WHERE job_postings.id = applications.job_posting_id 
                    AND job_postings.recruiter_id::text = auth.uid()::text
                ))
        )
    );

CREATE POLICY "Recruiters can create application history" ON application_status_history
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM applications 
            JOIN job_postings ON job_postings.id = applications.job_posting_id
            WHERE applications.id = application_status_history.application_id 
            AND job_postings.recruiter_id::text = auth.uid()::text
        )
    );

-- Chat Messages: Users can see messages they sent or received
CREATE POLICY "Users can view own messages" ON chat_messages
    FOR SELECT USING (
        auth.uid()::text = sender_id::text OR auth.uid()::text = recipient_id::text
    );

CREATE POLICY "Users can send messages" ON chat_messages
    FOR INSERT WITH CHECK (auth.uid()::text = sender_id::text);

CREATE POLICY "Users can update own messages" ON chat_messages
    FOR UPDATE USING (auth.uid()::text = sender_id::text OR auth.uid()::text = recipient_id::text);

-- Saved Jobs: Users can manage their own saved jobs
CREATE POLICY "Users can manage own saved jobs" ON saved_jobs
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Job Views: Users can create views, view own views
CREATE POLICY "Users can create job views" ON job_views
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text OR user_id IS NULL);

CREATE POLICY "Users can view own job views" ON job_views
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Notifications: Users can manage their own notifications
CREATE POLICY "Users can manage own notifications" ON notifications
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Create useful views
CREATE OR REPLACE VIEW user_dashboard_stats AS
SELECT 
    u.id as user_id,
    u.role,
    CASE 
        WHEN u.role = 'job_seeker' THEN (
            SELECT json_build_object(
                'total_applications', COUNT(*),
                'pending_applications', COUNT(*) FILTER (WHERE a.status IN ('submitted', 'under_review')),
                'interview_applications', COUNT(*) FILTER (WHERE a.status IN ('interview_scheduled', 'interviewed')),
                'successful_applications', COUNT(*) FILTER (WHERE a.status = 'offered')
            )
            FROM applications a WHERE a.applicant_id = u.id
        )
        WHEN u.role = 'recruiter' THEN (
            SELECT json_build_object(
                'total_jobs', COUNT(DISTINCT jp.id),
                'active_jobs', COUNT(DISTINCT jp.id) FILTER (WHERE jp.status = 'active'),
                'total_applications', COUNT(a.id),
                'pending_applications', COUNT(a.id) FILTER (WHERE a.status IN ('submitted', 'under_review'))
            )
            FROM job_postings jp
            LEFT JOIN applications a ON a.job_posting_id = jp.id
            WHERE jp.recruiter_id = u.id
        )
    END as stats
FROM users u;

-- Create function to get trending skills
CREATE OR REPLACE FUNCTION get_trending_skills(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(skill TEXT, job_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        skill_name::TEXT,
        COUNT(*) as job_count
    FROM (
        SELECT jsonb_array_elements_text(skills_required) as skill_name
        FROM job_postings 
        WHERE status = 'active' AND skills_required IS NOT NULL
        UNION ALL
        SELECT jsonb_array_elements_text(skills_preferred) as skill_name
        FROM job_postings 
        WHERE status = 'active' AND skills_preferred IS NOT NULL
    ) skills
    GROUP BY skill_name
    ORDER BY job_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to match jobs to user skills
CREATE OR REPLACE FUNCTION match_jobs_to_user(user_uuid UUID, limit_count INTEGER DEFAULT 20)
RETURNS TABLE(
    job_id UUID,
    title VARCHAR,
    company_name VARCHAR,
    match_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        jp.id,
        jp.title,
        jp.company_name,
        CASE 
            WHEN u.skills IS NULL OR jsonb_array_length(u.skills) = 0 THEN 0
            ELSE (
                SELECT COUNT(*)::INTEGER * 10
                FROM jsonb_array_elements_text(u.skills) user_skill
                WHERE user_skill = ANY(
                    SELECT jsonb_array_elements_text(jp.skills_required)
                    UNION
                    SELECT jsonb_array_elements_text(jp.skills_preferred)
                )
            )
        END as match_score
    FROM job_postings jp
    CROSS JOIN users u
    WHERE u.id = user_uuid
    AND jp.status = 'active'
    ORDER BY match_score DESC, jp.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for testing (remove in production)
INSERT INTO users (id, email, full_name, role, skills, experience_level, bio, location) VALUES 
(uuid_generate_v4(), 'jobseeker@example.com', 'John Doe', 'job_seeker', 
 '["JavaScript", "React", "Node.js", "Python"]', 'intermediate',
 'Full-stack developer with 3 years of experience', 'San Francisco, CA'),
(uuid_generate_v4(), 'recruiter@example.com', 'Jane Smith', 'recruiter', 
 '[]', null, 'Senior Technical Recruiter', 'New York, NY')
ON CONFLICT (email) DO NOTHING;

-- Create realtime subscriptions for live updates
-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE applications;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;