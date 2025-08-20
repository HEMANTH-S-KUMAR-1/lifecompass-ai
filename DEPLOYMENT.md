# Deployment Guide - LifeCompass AI

This guide covers deploying LifeCompass AI to various cloud platforms.

## 🌐 Deployment Options

### 🆓 Free Tier Deployments

#### **Option 1: Vercel (Frontend) + Railway (Backend)**
**Cost**: Free for small projects

**Frontend (Vercel):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd lifecompass-ai-frontend
vercel --prod
```

**Backend (Railway):**
1. Visit [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Select `lifecompass-ai-backend` folder
4. Add environment variables in Railway dashboard
5. Deploy automatically

#### **Option 2: Netlify (Frontend) + Render (Backend)**
**Cost**: Free for small projects

**Frontend (Netlify):**
```bash
# Build the project
cd lifecompass-ai-frontend
npm run build

# Deploy to Netlify
# Upload dist/ folder to netlify.com
```

**Backend (Render):**
1. Visit [render.com](https://render.com)
2. Connect your GitHub repository
3. Create a Web Service
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### 💳 Paid Deployments

#### **Option 3: AWS (Scalable)**
**Frontend (S3 + CloudFront):**
```bash
# Build and deploy
npm run build
aws s3 sync dist/ s3://your-bucket-name
```

**Backend (ECS or Lambda):**
```dockerfile
# Dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### **Option 4: Google Cloud Platform**
**Frontend (Firebase Hosting):**
```bash
npm install -g firebase-tools
firebase init hosting
npm run build
firebase deploy
```

**Backend (Cloud Run):**
```bash
gcloud run deploy lifecompass-backend \
  --source . \
  --platform managed \
  --region us-central1
```

## ⚙️ Environment Configuration

### Production Environment Variables

**Backend (.env):**
```env
# Database
SUPABASE_URL=https://your-prod-project.supabase.co
SUPABASE_KEY=your_prod_supabase_key

# AI Providers (configure at least one)
GOOGLE_API_KEY=your_production_google_key
OPENAI_API_KEY=your_production_openai_key
ANTHROPIC_API_KEY=your_production_anthropic_key
HUGGINGFACE_API_KEY=your_production_hf_key

# Security
PRIMARY_AI_PROVIDER=google
ALLOWED_ORIGINS=https://your-frontend-domain.com

# Performance
WORKERS=4
```

**Frontend Environment:**
```env
# API Configuration
VITE_API_URL=https://your-backend-domain.com
VITE_ENVIRONMENT=production
```

## 🔒 Security Checklist

### Backend Security
- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Set rate limiting
- [ ] Use secure headers
- [ ] Validate all inputs
- [ ] Monitor API usage

### Frontend Security
- [ ] Enable CSP headers
- [ ] Use HTTPS
- [ ] Sanitize user inputs
- [ ] Implement proper error handling
- [ ] Don't expose API keys

### Database Security
- [ ] Enable Row Level Security (RLS) in Supabase
- [ ] Use environment-specific databases
- [ ] Regular backups
- [ ] Monitor access logs

## 📊 Performance Optimization

### Backend Optimization
```python
# Add to main.py
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["your-domain.com"]
)
```

### Frontend Optimization
```javascript
// Lazy loading components
const LazyComponent = lazy(() => import('./Component'));

// Code splitting
const routes = [
  { path: '/dashboard', component: lazy(() => import('./Dashboard')) }
];
```

### Database Optimization
- Use connection pooling
- Index frequently queried columns
- Cache static data
- Monitor query performance

## 📈 Monitoring & Analytics

### Backend Monitoring
```python
# Add logging
import logging
logging.basicConfig(level=logging.INFO)

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}
```

### Frontend Analytics
```javascript
// Add analytics (optional)
import { analytics } from './analytics';

// Track user interactions
analytics.track('chat_message_sent', {
  provider: selectedProvider,
  timestamp: Date.now()
});
```

### Cost Monitoring
- Set up billing alerts
- Monitor AI provider usage
- Track database usage
- Set resource limits

## 🚀 Deployment Commands

### Complete Deployment Script
```bash
#!/bin/bash
# deploy.sh

echo "🚀 Deploying LifeCompass AI..."

# Build frontend
cd lifecompass-ai-frontend
npm ci
npm run build

# Deploy frontend
vercel --prod

# Deploy backend
cd ../lifecompass-ai-backend
git push railway main

echo "✅ Deployment complete!"
```

### Environment-Specific Deployments
```bash
# Development
npm run deploy:dev

# Staging  
npm run deploy:staging

# Production
npm run deploy:prod
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy LifeCompass AI

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
        working-directory: lifecompass-ai-frontend
      - run: npm run build
        working-directory: lifecompass-ai-frontend
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      - run: pip install -r requirements.txt
        working-directory: lifecompass-ai-backend
      - name: Deploy to Railway
        run: railway deploy
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## 🛠️ Troubleshooting

### Common Issues

**CORS Errors:**
```python
# Fix in main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Build Failures:**
```bash
# Clear caches
rm -rf node_modules package-lock.json
npm install

# Python dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

**Environment Variables:**
- Double-check all variables are set
- Use platform-specific environment variable names
- Test with minimal configuration first

### Support

- Check platform-specific documentation
- Monitor deployment logs
- Test endpoints after deployment
- Verify environment variables are loaded

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Test locally with production environment variables
- [ ] Verify all AI providers work
- [ ] Check database connections
- [ ] Review security settings
- [ ] Update documentation

### Post-Deployment
- [ ] Test all endpoints
- [ ] Verify frontend loads correctly
- [ ] Test AI chat functionality
- [ ] Check error handling
- [ ] Monitor logs for issues
- [ ] Set up monitoring alerts

---

**Happy Deploying!** 🌐🚀
