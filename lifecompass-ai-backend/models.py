"""
ATS Database Models
ORM models for the Applicant Tracking System using SQLAlchemy
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

Base = declarative_base()

class UserRole(enum.Enum):
    JOB_SEEKER = "job_seeker"
    RECRUITER = "recruiter"
    ADMIN = "admin"

class ApplicationStatus(enum.Enum):
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    SHORTLISTED = "shortlisted"
    INTERVIEW_SCHEDULED = "interview_scheduled"
    INTERVIEWED = "interviewed"
    OFFERED = "offered"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"

class JobStatus(enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    CLOSED = "closed"

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)  # UUID from Supabase
    email = Column(String(255), unique=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.JOB_SEEKER)
    
    # Profile information
    bio = Column(Text)
    location = Column(String(255))
    phone = Column(String(50))
    linkedin_url = Column(String(500))
    github_url = Column(String(500))
    portfolio_url = Column(String(500))
    
    # Job seeker specific fields
    skills = Column(JSON)  # Array of skills
    experience_level = Column(String(50))
    current_position = Column(String(255))
    current_company = Column(String(255))
    desired_salary_min = Column(Integer)
    desired_salary_max = Column(Integer)
    
    # Recruiter specific fields
    company_name = Column(String(255))
    company_website = Column(String(500))
    company_size = Column(String(50))
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)
    
    # Relationships
    job_postings = relationship("JobPosting", back_populates="recruiter")
    applications = relationship("Application", back_populates="applicant")
    sent_messages = relationship("ChatMessage", foreign_keys="ChatMessage.sender_id", back_populates="sender")
    received_messages = relationship("ChatMessage", foreign_keys="ChatMessage.recipient_id", back_populates="recipient")

class JobPosting(Base):
    __tablename__ = "job_postings"
    
    id = Column(String, primary_key=True)  # UUID
    recruiter_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Job details
    title = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    requirements = Column(Text)
    responsibilities = Column(Text)
    
    # Location and work arrangement
    location = Column(String(255))
    is_remote = Column(Boolean, default=False)
    work_type = Column(String(50))  # full-time, part-time, contract, internship
    
    # Compensation
    salary_min = Column(Integer)
    salary_max = Column(Integer)
    currency = Column(String(10), default="USD")
    
    # Job metadata
    department = Column(String(100))
    experience_level = Column(String(50))
    skills_required = Column(JSON)  # Array of required skills
    skills_preferred = Column(JSON)  # Array of preferred skills
    
    # Status and visibility
    status = Column(Enum(JobStatus), default=JobStatus.DRAFT)
    is_featured = Column(Boolean, default=False)
    expires_at = Column(DateTime(timezone=True))
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    recruiter = relationship("User", back_populates="job_postings")
    applications = relationship("Application", back_populates="job_posting")

class Application(Base):
    __tablename__ = "applications"
    
    id = Column(String, primary_key=True)  # UUID
    job_posting_id = Column(String, ForeignKey("job_postings.id"), nullable=False)
    applicant_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Application content
    cover_letter = Column(Text)
    resume_url = Column(String(500))  # Supabase storage URL
    resume_filename = Column(String(255))
    
    # Application status and tracking
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.SUBMITTED)
    status_updated_at = Column(DateTime(timezone=True), server_default=func.now())
    status_updated_by = Column(String, ForeignKey("users.id"))
    
    # Additional data
    answers = Column(JSON)  # Custom application questions and answers
    notes = Column(Text)  # Internal recruiter notes
    rating = Column(Integer)  # 1-5 rating by recruiter
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    job_posting = relationship("JobPosting", back_populates="applications")
    applicant = relationship("User", back_populates="applications")
    status_history = relationship("ApplicationStatusHistory", back_populates="application")

class ApplicationStatusHistory(Base):
    __tablename__ = "application_status_history"
    
    id = Column(String, primary_key=True)  # UUID
    application_id = Column(String, ForeignKey("applications.id"), nullable=False)
    
    # Status change details
    old_status = Column(Enum(ApplicationStatus))
    new_status = Column(Enum(ApplicationStatus), nullable=False)
    changed_by = Column(String, ForeignKey("users.id"), nullable=False)
    notes = Column(Text)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    application = relationship("Application", back_populates="status_history")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(String, primary_key=True)  # UUID
    sender_id = Column(String, ForeignKey("users.id"), nullable=False)
    recipient_id = Column(String, ForeignKey("users.id"), nullable=False)
    application_id = Column(String, ForeignKey("applications.id"))  # Optional: link to specific application
    
    # Message content
    message = Column(Text, nullable=False)
    message_type = Column(String(50), default="text")  # text, file, system
    file_url = Column(String(500))  # For file attachments
    file_name = Column(String(255))
    
    # Message status
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime(timezone=True))
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    recipient = relationship("User", foreign_keys=[recipient_id], back_populates="received_messages")

class SavedJob(Base):
    __tablename__ = "saved_jobs"
    
    id = Column(String, primary_key=True)  # UUID
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    job_posting_id = Column(String, ForeignKey("job_postings.id"), nullable=False)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")
    job_posting = relationship("JobPosting")

class JobView(Base):
    __tablename__ = "job_views"
    
    id = Column(String, primary_key=True)  # UUID
    user_id = Column(String, ForeignKey("users.id"))  # Optional: anonymous views
    job_posting_id = Column(String, ForeignKey("job_postings.id"), nullable=False)
    
    # View metadata
    ip_address = Column(String(45))  # IPv4 or IPv6
    user_agent = Column(Text)
    referrer = Column(String(500))
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")
    job_posting = relationship("JobPosting")