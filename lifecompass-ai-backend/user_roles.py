"""
User Roles Module
Role management and permission enforcement for the ATS system
"""

from functools import wraps
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from flask import g, request, jsonify
import jwt
import os

from models import User, UserRole


# Global variable to store current user (in a real app, use proper context management)
_current_user = None


def get_current_user() -> Optional[User]:
    """Get the currently authenticated user"""
    return _current_user


def set_current_user(user: User):
    """Set the current user (for testing/development)"""
    global _current_user
    _current_user = user


class PermissionError(Exception):
    """Custom exception for permission-related errors"""
    pass


def require_role(allowed_roles: List[UserRole]):
    """Decorator to require specific roles for accessing endpoints"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            current_user = get_current_user()
            
            if not current_user:
                raise PermissionError("Authentication required")
            
            if current_user.role not in allowed_roles:
                raise PermissionError(f"Access denied. Required roles: {[role.value for role in allowed_roles]}")
            
            return func(*args, **kwargs)
        return wrapper
    return decorator


def require_authentication(func):
    """Decorator to require authentication"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        current_user = get_current_user()
        
        if not current_user:
            raise PermissionError("Authentication required")
        
        return func(*args, **kwargs)
    return wrapper


class RoleManager:
    """Manage user roles and permissions"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_permissions(self, user: User) -> Dict[str, bool]:
        """Get all permissions for a user based on their role"""
        permissions = {
            # Job seeker permissions
            "can_apply_to_jobs": False,
            "can_view_own_applications": False,
            "can_withdraw_applications": False,
            "can_chat_with_recruiters": False,
            "can_save_jobs": False,
            
            # Recruiter permissions
            "can_post_jobs": False,
            "can_edit_own_jobs": False,
            "can_view_applications": False,
            "can_update_application_status": False,
            "can_chat_with_applicants": False,
            "can_rate_applications": False,
            "can_view_analytics": False,
            
            # Admin permissions
            "can_manage_users": False,
            "can_manage_all_jobs": False,
            "can_view_system_analytics": False,
            "can_moderate_content": False,
        }
        
        if user.role == UserRole.JOB_SEEKER:
            permissions.update({
                "can_apply_to_jobs": True,
                "can_view_own_applications": True,
                "can_withdraw_applications": True,
                "can_chat_with_recruiters": True,
                "can_save_jobs": True,
            })
        
        elif user.role == UserRole.RECRUITER:
            permissions.update({
                "can_post_jobs": True,
                "can_edit_own_jobs": True,
                "can_view_applications": True,
                "can_update_application_status": True,
                "can_chat_with_applicants": True,
                "can_rate_applications": True,
                "can_view_analytics": True,
            })
        
        elif user.role == UserRole.ADMIN:
            # Admin has all permissions
            permissions = {key: True for key in permissions.keys()}
        
        return permissions
    
    def can_user_access_job(self, user: User, job_posting_id: str) -> bool:
        """Check if user can access a specific job posting"""
        from models import JobPosting
        
        job_posting = self.db.query(JobPosting).filter(
            JobPosting.id == job_posting_id
        ).first()
        
        if not job_posting:
            return False
        
        # Admin can access all jobs
        if user.role == UserRole.ADMIN:
            return True
        
        # Recruiters can access their own jobs
        if user.role == UserRole.RECRUITER and job_posting.recruiter_id == user.id:
            return True
        
        # Job seekers can access active jobs
        if user.role == UserRole.JOB_SEEKER and job_posting.status.value == "active":
            return True
        
        return False
    
    def can_user_access_application(self, user: User, application_id: str) -> bool:
        """Check if user can access a specific application"""
        from models import Application
        
        application = self.db.query(Application).filter(
            Application.id == application_id
        ).first()
        
        if not application:
            return False
        
        # Admin can access all applications
        if user.role == UserRole.ADMIN:
            return True
        
        # Job seekers can access their own applications
        if user.role == UserRole.JOB_SEEKER and application.applicant_id == user.id:
            return True
        
        # Recruiters can access applications for their jobs
        if (user.role == UserRole.RECRUITER and 
            application.job_posting.recruiter_id == user.id):
            return True
        
        return False
    
    def can_users_chat(self, user1: User, user2: User, application_id: Optional[str] = None) -> bool:
        """Check if two users can chat with each other"""
        
        # Admin can chat with anyone
        if user1.role == UserRole.ADMIN or user2.role == UserRole.ADMIN:
            return True
        
        # If linked to an application, verify the relationship
        if application_id:
            from models import Application
            
            application = self.db.query(Application).filter(
                Application.id == application_id
            ).first()
            
            if not application:
                return False
            
            # Only applicant and job poster can chat about an application
            valid_participants = {application.applicant_id, application.job_posting.recruiter_id}
            user_ids = {user1.id, user2.id}
            
            return user_ids == valid_participants
        
        # General chat rules: job seekers can chat with recruiters
        roles = {user1.role, user2.role}
        return roles == {UserRole.JOB_SEEKER, UserRole.RECRUITER}
    
    def get_accessible_jobs(self, user: User, db: Session) -> List[str]:
        """Get list of job IDs that user can access"""
        from models import JobPosting, JobStatus
        
        if user.role == UserRole.ADMIN:
            # Admin can access all jobs
            jobs = db.query(JobPosting.id).all()
            return [job.id for job in jobs]
        
        elif user.role == UserRole.RECRUITER:
            # Recruiters can access their own jobs
            jobs = db.query(JobPosting.id).filter(
                JobPosting.recruiter_id == user.id
            ).all()
            return [job.id for job in jobs]
        
        elif user.role == UserRole.JOB_SEEKER:
            # Job seekers can access active jobs
            jobs = db.query(JobPosting.id).filter(
                JobPosting.status == JobStatus.ACTIVE
            ).all()
            return [job.id for job in jobs]
        
        return []
    
    def change_user_role(self, user_id: str, new_role: UserRole, changed_by: str) -> Optional[User]:
        """Change a user's role (admin only)"""
        current_user = get_current_user()
        
        if not current_user or current_user.role != UserRole.ADMIN:
            raise PermissionError("Only admins can change user roles")
        
        user = self.db.query(User).filter(User.id == user_id).first()
        
        if not user:
            return None
        
        old_role = user.role
        user.role = new_role
        
        self.db.commit()
        self.db.refresh(user)
        
        # Log role change (implement audit logging as needed)
        self._log_role_change(user_id, old_role, new_role, changed_by)
        
        return user
    
    def _log_role_change(self, user_id: str, old_role: UserRole, new_role: UserRole, changed_by: str):
        """Log role changes for audit purposes"""
        # Implement audit logging here
        print(f"Role change: User {user_id} changed from {old_role.value} to {new_role.value} by {changed_by}")


# Authentication helpers (integrate with your auth system)
def authenticate_user(token: str, db: Session) -> Optional[User]:
    """Authenticate user from JWT token"""
    try:
        # Decode JWT token (replace with your actual secret)
        secret_key = os.getenv("JWT_SECRET_KEY", "your-secret-key")
        payload = jwt.decode(token, secret_key, algorithms=["HS256"])
        
        user_id = payload.get("user_id")
        if not user_id:
            return None
        
        user = db.query(User).filter(User.id == user_id).first()
        return user
    
    except jwt.InvalidTokenError:
        return None


def create_jwt_token(user: User) -> str:
    """Create JWT token for user"""
    import jwt
    from datetime import datetime, timedelta
    
    secret_key = os.getenv("JWT_SECRET_KEY", "your-secret-key")
    
    payload = {
        "user_id": user.id,
        "email": user.email,
        "role": user.role.value,
        "exp": datetime.utcnow() + timedelta(days=7)  # Token expires in 7 days
    }
    
    return jwt.encode(payload, secret_key, algorithm="HS256")


# Middleware for FastAPI (adapt as needed)
def auth_middleware(request, db: Session):
    """Authentication middleware"""
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    
    token = auth_header.split(" ")[1]
    user = authenticate_user(token, db)
    
    if user:
        set_current_user(user)
    
    return user


# Permission checking utilities
def check_permission(permission: str, user: Optional[User] = None) -> bool:
    """Check if current user has a specific permission"""
    if not user:
        user = get_current_user()
    
    if not user:
        return False
    
    role_manager = RoleManager(None)  # Pass actual db session in real implementation
    permissions = role_manager.get_user_permissions(user)
    
    return permissions.get(permission, False)


def require_permission(permission: str):
    """Decorator to require a specific permission"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if not check_permission(permission):
                raise PermissionError(f"Permission required: {permission}")
            return func(*args, **kwargs)
        return wrapper
    return decorator


# Role-based view helpers
def filter_data_by_role(data: List[Dict[str, Any]], user: User) -> List[Dict[str, Any]]:
    """Filter data based on user role and permissions"""
    if user.role == UserRole.ADMIN:
        return data  # Admin sees everything
    
    # Implement role-specific filtering logic
    filtered_data = []
    
    for item in data:
        # Add role-specific filtering logic here
        # For example, job seekers only see active jobs
        # Recruiters only see their own jobs, etc.
        filtered_data.append(item)
    
    return filtered_data


# Error handlers
class AuthenticationError(Exception):
    """Authentication failed"""
    pass


class AuthorizationError(Exception):
    """User not authorized for this action"""
    pass


def handle_permission_error(error: PermissionError):
    """Handle permission errors in API responses"""
    return {
        "error": "Permission denied",
        "message": str(error),
        "status_code": 403
    }


def handle_authentication_error(error: AuthenticationError):
    """Handle authentication errors in API responses"""
    return {
        "error": "Authentication required",
        "message": str(error),
        "status_code": 401
    }