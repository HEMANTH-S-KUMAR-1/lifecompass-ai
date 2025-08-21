# LifeCompass AI Frontend

A modern React frontend for the LifeCompass AI career platform, built with Vite for fast development and optimized builds.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- LifeCompass AI Backend running (see `../lifecompass-ai-backend/`)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment (optional)**
   ```bash
   # Copy example environment file
   cp .env.example .env.local
   
   # Edit .env.local with your backend URL
   # For development: REACT_APP_API_URL=http://localhost:8000
   # For production: REACT_APP_API_URL=https://your-backend-domain.com
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:5173`
   - The app will automatically reload when you make changes

## 🏗️ Build & Deploy

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy
The built files will be in the `dist/` directory. You can deploy to:
- **Vercel**: Connect your GitHub repo for automatic deployments
- **Netlify**: Drag and drop the `dist/` folder
- **Any static hosting**: Upload the contents of `dist/`

## ⚙️ Configuration

### Environment Variables
Create `.env.local` for local development:

```env
# Backend API URL
REACT_APP_API_URL=http://localhost:8000

# Optional settings
REACT_APP_API_TIMEOUT=10000
REACT_APP_ENABLE_DEBUG=false
```

### API Configuration
The app uses a centralized API configuration system:

- **API Config**: `src/config/api.js` - Endpoints and base configuration
- **API Services**: `src/services/api.js` - Reusable API call functions
- **Auto Environment**: Automatically switches between dev/prod settings

### Backend Connection
The frontend automatically detects and connects to the backend:

- **Development**: `http://localhost:8000` (default)
- **Production**: Uses `REACT_APP_API_URL` environment variable
- **Status Check**: Displays connection status in the UI
- **Health Monitor**: Shows backend health and AI provider status

## 🎨 Features

### Current Features
- **Responsive Design**: Works on desktop and mobile
- **AI Provider Status**: Real-time backend connection monitoring
- **Modern UI**: Built with Tailwind CSS and Framer Motion
- **Career Tools**: Job tracking, AI chat interface
- **Profile Management**: User registration and profile creation

### Architecture
- **React 18**: Latest React with hooks and concurrent features
- **Vite**: Fast build tool with HMR
- **Axios**: HTTP client with interceptors
- **Framer Motion**: Smooth animations
- **Lucide React**: Beautiful icons
- **Tailwind CSS**: Utility-first styling

## 🛠️ Development

### Project Structure
```
src/
├── config/          # Configuration files
│   └── api.js       # API endpoints and settings
├── services/        # API service functions
│   └── api.js       # Reusable API calls
├── components/      # React components (future)
├── pages/           # Page components (future)
├── hooks/           # Custom React hooks (future)
├── utils/           # Utility functions (future)
├── App.jsx          # Main application component
├── main.jsx         # Application entry point
└── index.css        # Global styles
```

### Adding New API Endpoints
1. Add endpoint to `src/config/api.js`
2. Create service function in `src/services/api.js`
3. Use service in your components

### Code Style
- Follow React best practices
- Use functional components with hooks
- Implement proper error handling
- Add loading states for async operations

## 🔒 Security

### Environment Variables
- Store sensitive configuration in `.env.local`
- Never commit `.env.local` to version control
- Use `REACT_APP_` prefix for client-side variables
- Backend API keys should NEVER be in frontend code

### Production Deployment
- Use HTTPS for all API calls
- Configure CORS properly on backend
- Implement proper authentication (future)
- Validate all user inputs

## 📚 Tech Stack

### Core
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **JavaScript (ES6+)** - Programming language

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

### HTTP & API
- **Axios** - HTTP client
- **Centralized API config** - Organized endpoint management

### Development
- **ESLint** - Code linting
- **Hot Module Replacement** - Fast development
- **Environment-based configuration** - Dev/prod settings

## 🆘 Troubleshooting

### Backend Connection Issues
- Ensure backend is running on `http://localhost:8000`
- Check if backend has CORS configured for frontend origin
- Verify environment variables in `.env.local`

### Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`
- Check for ESLint errors: `npm run lint`

### Deployment Issues
- Ensure `REACT_APP_API_URL` points to your deployed backend
- Check that backend allows CORS from your frontend domain
- Verify all environment variables are set in hosting platform

## 📝 License

This project is part of the LifeCompass AI platform. See the main project LICENSE file for details.
