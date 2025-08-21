# 🗄️ Database Setup Instructions

Since Supabase doesn't allow direct SQL execution through the API for security reasons, you need to manually set up the database schema through the Supabase dashboard.

## Step 1: Access Supabase Dashboard

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Find your project: `jcpljuhvgmzpgyywbquv`
4. Click on your project to open the dashboard

## Step 2: Open SQL Editor

1. In your Supabase dashboard, click on **"SQL Editor"** in the left sidebar
2. Click **"New Query"** to create a new SQL script

## Step 3: Copy and Execute the Database Schema

1. Open the file `database_schema.sql` in this directory
2. Copy the entire contents of the file
3. Paste it into the SQL Editor in Supabase
4. Click **"Run"** button to execute the schema

## Step 4: Verify Tables Were Created

1. Go to **"Table Editor"** in the left sidebar
2. You should see the following tables:
   - `user_profiles`
   - `chat_history`
   - `job_applications`
   - `resume_versions`
   - `job_recommendations`
   - `user_sessions`

## Alternative: Quick Setup

If you prefer, you can also execute the schema in smaller chunks:

### Core Tables (Run this first):
```sql
-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'job_seeker' CHECK (role IN ('job_seeker', 'employer', 'recruiter')),
    bio TEXT,
    location VARCHAR(255),
    phone VARCHAR(50),
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    skills TEXT[],
    experience_level VARCHAR(50) CHECK (experience_level IN ('entry', 'junior', 'intermediate', 'senior', 'expert')),
    current_position VARCHAR(255),
    current_company VARCHAR(255),
    desired_salary_min INTEGER,
    desired_salary_max INTEGER,
    job_preferences JSONB,
    notification_settings JSONB DEFAULT '{"email": true, "sms": false, "push": true}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Chat History Table
CREATE TABLE IF NOT EXISTS chat_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    ai_provider VARCHAR(50) NOT NULL,
    session_id UUID,
    message_type VARCHAR(50) DEFAULT 'career_advice',
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    response_time_ms INTEGER,
    tokens_used INTEGER
);
```

### After Basic Tables are Created:
Then run the rest of the schema from `database_schema.sql`

## Step 5: Test the Connection

Once the tables are created, run the test again:

```bash
cd lifecompass-ai-backend
python test_setup.py
```

This should show that Supabase is working properly.

## Troubleshooting

- **Tables already exist error**: This is normal if you're running the script multiple times
- **Permission denied**: Make sure you're using the correct Supabase URL and key
- **Connection failed**: Verify your internet connection and Supabase credentials

## Next Steps

After the database is set up:
1. Start the backend server: `uvicorn main:app --reload`
2. Test the API endpoints
3. Set up the frontend
