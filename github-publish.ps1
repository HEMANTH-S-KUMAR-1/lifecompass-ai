# GitHub Publishing Script for LifeCompass AI
# This script helps prepare and push the project to GitHub

$RepoName = "Lifecompass-ai"
$RepoOwner = "HEMANTH-S-KUMAR-1"
$RepoUrl = "https://github.com/$RepoOwner/$RepoName.git"

Write-Host "🚀 Preparing LifeCompass AI for GitHub..." -ForegroundColor Green
Write-Host ""

# Check if git is installed
try {
    $gitVersion = git --version
    Write-Host "✅ Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is required but not installed" -ForegroundColor Red
    Write-Host "Please install Git from https://git-scm.com/downloads" -ForegroundColor Yellow
    exit 1
}

# Clean up unnecessary files
Write-Host "🧹 Cleaning up unnecessary files..." -ForegroundColor Yellow

# Remove Python cache directories
Get-ChildItem -Path . -Include "__pycache__" -Recurse -Force | ForEach-Object {
    Write-Host "Removing: $_" -ForegroundColor Gray
    Remove-Item -Path $_ -Recurse -Force
}

# Remove .pyc files
Get-ChildItem -Path . -Include "*.pyc","*.pyo","*.pyd" -Recurse -Force | ForEach-Object {
    Write-Host "Removing: $_" -ForegroundColor Gray
    Remove-Item -Path $_ -Force
}

# Remove node_modules if they exist
Get-ChildItem -Path . -Include "node_modules" -Recurse -Force | ForEach-Object {
    Write-Host "Removing: $_" -ForegroundColor Gray
    Remove-Item -Path $_ -Recurse -Force
}

# Remove npm logs
Get-ChildItem -Path . -Include "npm-debug.log*","yarn-debug.log*","yarn-error.log*" -Recurse -Force | ForEach-Object {
    Write-Host "Removing: $_" -ForegroundColor Gray
    Remove-Item -Path $_ -Force
}

# Remove .env files if they exist (but keep .env.example)
Get-ChildItem -Path . -Filter ".env" -Recurse -Force | ForEach-Object {
    Write-Host "Removing: $_" -ForegroundColor Gray
    Remove-Item -Path $_ -Force
}

# Verify .gitignore exists
if (-not (Test-Path ".gitignore")) {
    Write-Host "❌ .gitignore file not found!" -ForegroundColor Red
    exit 1
}

# Initialize git if not already initialized
if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
}

# Check if remote already exists
$remoteExists = git remote -v | Select-String -Pattern $RepoUrl -Quiet

if (-not $remoteExists) {
    Write-Host "Adding GitHub remote..." -ForegroundColor Yellow
    git remote add origin $RepoUrl
} else {
    Write-Host "GitHub remote already exists" -ForegroundColor Green
}

# Stage all files
Write-Host "Staging files for commit..." -ForegroundColor Yellow
git add .

# Commit changes
$commitMessage = "Initial commit of LifeCompass AI project"
Write-Host "Committing changes: $commitMessage" -ForegroundColor Yellow
git commit -m $commitMessage

# Push to GitHub
Write-Host "Ready to push to GitHub!" -ForegroundColor Green
Write-Host ""

# Check if GitHub CLI is available
try {
    $ghInstalled = $null -ne (Get-Command gh -ErrorAction SilentlyContinue)
    
    if ($ghInstalled) {
        Write-Host "GitHub CLI detected! You can use the following commands:" -ForegroundColor Cyan
        Write-Host "1. Create and push to a new repository:" -ForegroundColor White
        Write-Host "   gh repo create $RepoName --source=. --push --public" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "2. Or push to an existing repository:" -ForegroundColor White
        Write-Host "   git push -u origin main" -ForegroundColor Yellow
    } else {
        Write-Host "To push your changes to GitHub, run:" -ForegroundColor Cyan
        Write-Host "git push -u origin main" -ForegroundColor White
    }
} catch {
    Write-Host "To push your changes to GitHub, run:" -ForegroundColor Cyan
    Write-Host "git push -u origin main" -ForegroundColor White
}
Write-Host ""
Write-Host "Repository URL: $RepoUrl" -ForegroundColor Green

# Instructions for further steps
Write-Host ""
Write-Host "🎉 Project is ready for GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Push your changes to GitHub with 'git push -u origin main'" -ForegroundColor White
Write-Host "2. Enable GitHub Pages for documentation in repository settings" -ForegroundColor White
Write-Host "3. Set up CI/CD pipeline with GitHub Actions" -ForegroundColor White
Write-Host ""
Write-Host "📖 For detailed deployment instructions, see DEPLOYMENT.md" -ForegroundColor Cyan
