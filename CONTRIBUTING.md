# Contributing to LifeCompass AI

Thank you for your interest in contributing to LifeCompass AI! This guide will help you get started.

## 🤝 How to Contribute

### 1. Fork the Repository
- Click the "Fork" button on GitHub
- Clone your fork locally:
```bash
git clone https://github.com/YOUR_USERNAME/lifecompass-ai.git
cd lifecompass-ai
```

### 2. Set Up Development Environment
```bash
# Run the setup script
./setup.sh          # Linux/Mac
# or
./setup.ps1         # Windows

# Configure your API keys in .env
cp lifecompass-ai-backend/.env.example lifecompass-ai-backend/.env
# Edit .env with your API keys
```

### 3. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 4. Make Your Changes
- Follow the coding standards below
- Test your changes thoroughly
- Update documentation if needed

### 5. Submit a Pull Request
```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

## 🎯 Areas for Contribution

### Frontend (React)
- **UI/UX improvements**: Better designs, accessibility
- **New components**: Job search filters, user profiles
- **Performance**: Optimization, lazy loading
- **Mobile responsiveness**: Touch-friendly interfaces

### Backend (FastAPI)
- **New AI providers**: Integration with additional AI services
- **Database features**: User authentication, job storage
- **API endpoints**: New career-related services
- **Performance**: Caching, rate limiting

### AI Provider System
- **New providers**: Add support for more AI services
- **Fallback logic**: Improve provider switching
- **Cost optimization**: Better usage tracking
- **Response quality**: Improve prompt engineering

### Documentation
- **Setup guides**: Platform-specific instructions
- **API documentation**: Detailed endpoint descriptions
- **Tutorials**: Step-by-step usage guides
- **Troubleshooting**: Common issues and solutions

## 📝 Coding Standards

### Python (Backend)
```python
# Use type hints
def create_user(name: str, email: str) -> dict:
    return {"name": name, "email": email}

# Follow PEP 8
# Use descriptive variable names
# Add docstrings for functions
```

### JavaScript/React (Frontend)
```javascript
// Use functional components with hooks
const MyComponent = ({ prop1, prop2 }) => {
    const [state, setState] = useState(initialValue);
    
    // Use descriptive names
    // Follow React best practices
    return <div>...</div>;
};

// Use const/let, not var
// Use arrow functions consistently
```

### File Naming
- **Python**: `snake_case.py`
- **JavaScript**: `PascalCase.jsx` for components, `camelCase.js` for utilities
- **Documentation**: `UPPERCASE.md` for main docs, `lowercase.md` for specific docs

## 🧪 Testing Guidelines

### Backend Testing
```bash
cd lifecompass-ai-backend
# Add tests in tests/ directory
pytest
```

### Frontend Testing
```bash
cd lifecompass-ai-frontend
# Add tests alongside components
npm test
```

### Manual Testing
1. Test with multiple AI providers
2. Test error handling (no API keys, network issues)
3. Test responsive design on mobile/desktop
4. Test accessibility with screen readers

## 🐛 Bug Reports

When reporting bugs, include:
- **Environment**: OS, Python/Node versions
- **Configuration**: Which AI providers you're using
- **Steps to reproduce**: Detailed steps
- **Expected vs actual behavior**
- **Screenshots/logs**: If applicable

### Bug Report Template
```markdown
**Environment:**
- OS: Windows 11 / macOS / Linux
- Python: 3.9.0
- Node: 18.0.0
- AI Provider: Google AI / OpenAI / etc.

**Bug Description:**
Clear description of the issue

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Screenshots/Logs:**
Any relevant visual evidence or error messages
```

## 💡 Feature Requests

For new features, please:
1. Check existing issues first
2. Describe the use case
3. Explain the expected behavior
4. Consider implementation complexity
5. Discuss AI provider compatibility

### Feature Request Template
```markdown
**Feature Description:**
What you want to add

**Use Case:**
Why this feature would be useful

**Proposed Implementation:**
How you think it could work

**AI Provider Impact:**
How this affects different AI providers

**Additional Context:**
Any other relevant information
```

## 🔄 Development Workflow

### Local Development
```bash
# Start backend
cd lifecompass-ai-backend
uvicorn main:app --reload

# Start frontend (in another terminal)
cd lifecompass-ai-frontend
npm run dev
```

### Before Committing
```bash
# Backend
cd lifecompass-ai-backend
python -m flake8 .
python -m black .

# Frontend
cd lifecompass-ai-frontend
npm run lint
npm run build  # Ensure it builds
```

### Commit Message Format
```
type(scope): description

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance

Examples:
feat(ai): add Claude AI provider support
fix(frontend): resolve chat input validation
docs(setup): update installation instructions
```

## 🌟 Recognition

Contributors will be:
- Listed in the project README
- Mentioned in release notes
- Given appropriate GitHub repository permissions

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and ideas
- **Documentation**: Check README and docs first

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for making LifeCompass AI better! 🚀
