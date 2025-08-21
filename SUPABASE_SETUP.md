# Supabase Setup Guide for LifeCompass AI

This guide will walk you through setting up Supabase for the LifeCompass AI project, including database configuration, security, and integration.

## 🚀 Quick Setup (5 minutes)

### 1. Create Supabase Project

1. **Sign up** at [supabase.com](https://supabase.com)
2. **Create new project**:
   - Click "New Project"
   - Choose organization (create one if needed)
   - Enter project name: `lifecompass-ai`
   - Set database password (save this!)
   - Choose region closest to your users
   - Click "Create new project"

3. **Wait for setup** (~2 minutes)

### 2. Get API Credentials

1. **Navigate to Settings → API**
2. **Copy these values**:
   - Project URL: `https://your-project-id.supabase.co`
   - Anon (public) key: `eyJ...` (long string)

3. **Add to your `.env` file**:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=your_anon_key_here
   ```

### 3. Set Up Database Schema

1. **Go to SQL Editor** in Supabase dashboard
2. **Copy contents** of `database_schema.sql` (in backend directory)
3. **Paste and run** the SQL script
4. **Verify tables** were created in Table Editor

## 🗄️ Database Schema Overview

The schema includes these main tables:

### Core Tables
- **user_profiles** - User account and career information
- **chat_history** - AI conversation storage
- **job_applications** - Job application tracking
- **resume_versions** - Resume/CV management
- **job_recommendations** - AI job suggestions
- **user_sessions** - Activity tracking

### Key Features
- **UUID primary keys** for security
- **Row Level Security (RLS)** enabled
- **Automatic timestamps** with triggers
- **Flexible JSONB** fields for AI data
- **Performance indexes** on critical columns

## 🔒 Security Configuration

### Row Level Security (RLS)
RLS is automatically enabled and configured with these policies:

- **Users can only access their own data**
- **Authentication required** for all operations
- **Admin access** through service role key

### Authentication Options
Choose your preferred auth method:

1. **Email/Password** (default)
2. **OAuth providers** (Google, GitHub, etc.)
3. **Magic links**
4. **Phone authentication**

Configure in **Authentication → Settings**.

## ⚙️ Advanced Configuration

### Environment Variables

```env
# Required
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_anon_key_here

# Optional: Service Role (for admin operations)
SUPABASE_SERVICE_KEY=your_service_role_key

# Optional: Connection settings
DB_POOL_SIZE=10
DB_TIMEOUT=30
```

### Database Optimization

1. **Enable realtime** for live updates:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE chat_history;
   ALTER PUBLICATION supabase_realtime ADD TABLE job_applications;
   ```

2. **Set up backups** in Project Settings → Database
3. **Monitor performance** in Project Settings → Database → Logs

### Storage Configuration (for file uploads)

1. **Create storage bucket** for resumes:
   ```sql
   INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);
   ```

2. **Set up storage policies**:
   ```sql
   CREATE POLICY "Users can upload own resumes" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = owner);
   ```

## 🧪 Testing Your Setup

### 1. Test Database Connection

Run the backend server and check:
```bash
curl http://localhost:8000/api/health
```

Should return:
```json
{
  "services": {
    "database": {
      "connected": true,
      "error": null
    }
  }
}
```

### 2. Test User Creation

```bash
curl -X POST http://localhost:8000/api/signup
```

Should create a test user and return success.

### 3. Verify in Supabase

1. Go to **Table Editor → user_profiles**
2. Should see test user data
3. Check **Authentication → Users** for auth records

## 🚀 Production Deployment

### 1. Environment Setup

**Vercel/Netlify:**
```env
SUPABASE_URL=your_production_url
SUPABASE_KEY=your_production_key
```

**Railway/Render:**
- Add environment variables in platform settings
- Use the same Supabase project or create production instance

### 2. Database Migration

For production, consider:
- **Separate production project** in Supabase
- **Database migrations** for schema updates
- **Backup strategy** configuration

### 3. Security Checklist

- [ ] RLS policies reviewed and tested
- [ ] Service role key secured
- [ ] CORS configured properly
- [ ] SSL/HTTPS enabled
- [ ] API rate limiting configured

## 🔧 Troubleshooting

### Connection Issues

**Problem**: "Supabase not configured"
- Check environment variables are set
- Verify `.env` file exists and is loaded
- Restart development server

**Problem**: "Failed to connect to Supabase"
- Check project URL format
- Verify API key is correct
- Check network connectivity

### Permission Errors

**Problem**: "Row Level Security policy violation"
- Check RLS policies in SQL Editor
- Verify user authentication
- Test with service role key

**Problem**: "Table doesn't exist"
- Run `database_schema.sql` script
- Check table names match code
- Verify database migration completed

### Performance Issues

**Problem**: Slow queries
- Check database indexes
- Monitor query performance in Supabase
- Consider adding custom indexes

**Problem**: Too many connections
- Adjust connection pool settings
- Use connection pooling in production

## 📚 Additional Resources

### Supabase Documentation
- [Getting Started](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time](https://supabase.com/docs/guides/realtime)

### LifeCompass AI Integration
- Check `supabase_config.py` for Python integration
- See `services/api.js` for frontend integration
- Review `main.py` for API endpoints

### Community Support
- [Supabase Discord](https://discord.supabase.com/)
- [GitHub Issues](https://github.com/supabase/supabase/issues)
- [LifeCompass AI Documentation](../README.md)

---

✅ **Once setup is complete**, your LifeCompass AI backend will have full database functionality including user management, chat history, and job application tracking!
