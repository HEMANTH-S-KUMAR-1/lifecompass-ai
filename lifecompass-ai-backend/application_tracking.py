"""
Application Tracking Module
Handle application submission, status updates, and history tracking
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from datetime import datetime
import uuid

from models import (
    Application, ApplicationStatus, ApplicationStatusHistory, 
    JobPosting, User, UserRole
)
from user_roles import require_role, get_current_user


class ApplicationService:
    def __init__(self, db: Session):
        self.db = db
    
    @require_role([UserRole.JOB_SEEKER])
    def submit_application(
        self, 
        job_posting_id: str, 
        applicant_id: str, 
        application_data: Dict[str, Any]
    ) -> Application:
        """Submit a new job application"""
        
        # Check if user already applied to this job
        existing_application = self.db.query(Application).filter(
            and_(
                Application.job_posting_id == job_posting_id,
                Application.applicant_id == applicant_id
            )
        ).first()
        
        if existing_application:
            raise ValueError("You have already applied to this job")
        
        # Verify job posting exists and is active
        job_posting = self.db.query(JobPosting).filter(
            JobPosting.id == job_posting_id
        ).first()
        
        if not job_posting:
            raise ValueError("Job posting not found")
        
        if job_posting.status.value != "active":
            raise ValueError("This job posting is no longer accepting applications")
        
        # Create application
        application = Application(
            id=str(uuid.uuid4()),
            job_posting_id=job_posting_id,
            applicant_id=applicant_id,
            cover_letter=application_data.get("cover_letter"),
            resume_url=application_data.get("resume_url"),
            resume_filename=application_data.get("resume_filename"),
            answers=application_data.get("answers"),
            status=ApplicationStatus.SUBMITTED
        )
        
        self.db.add(application)
        self.db.commit()
        self.db.refresh(application)
        
        # Create initial status history entry
        self._create_status_history(
            application.id,
            None,
            ApplicationStatus.SUBMITTED,
            applicant_id,
            "Application submitted"
        )
        
        return application
    
    def get_application(self, application_id: str) -> Optional[Application]:
        """Get a single application by ID"""
        return self.db.query(Application).filter(
            Application.id == application_id
        ).first()
    
    def get_applications_for_job(
        self, 
        job_posting_id: str, 
        recruiter_id: str,
        status: Optional[ApplicationStatus] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[Application]:
        """Get all applications for a specific job posting"""
        
        # Verify recruiter owns this job posting
        job_posting = self.db.query(JobPosting).filter(
            and_(
                JobPosting.id == job_posting_id,
                JobPosting.recruiter_id == recruiter_id
            )
        ).first()
        
        if not job_posting:
            raise ValueError("Job posting not found or access denied")
        
        query = self.db.query(Application).filter(
            Application.job_posting_id == job_posting_id
        )
        
        if status:
            query = query.filter(Application.status == status)
        
        return query.order_by(desc(Application.created_at)).offset(skip).limit(limit).all()
    
    def get_applications_by_user(
        self, 
        applicant_id: str,
        status: Optional[ApplicationStatus] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[Application]:
        """Get all applications submitted by a specific user"""
        query = self.db.query(Application).filter(
            Application.applicant_id == applicant_id
        )
        
        if status:
            query = query.filter(Application.status == status)
        
        return query.order_by(desc(Application.created_at)).offset(skip).limit(limit).all()
    
    @require_role([UserRole.RECRUITER, UserRole.ADMIN])
    def update_application_status(
        self,
        application_id: str,
        new_status: ApplicationStatus,
        updated_by: str,
        notes: Optional[str] = None
    ) -> Optional[Application]:
        """Update application status with history tracking"""
        
        application = self.db.query(Application).filter(
            Application.id == application_id
        ).first()
        
        if not application:
            return None
        
        # Verify recruiter has access to this application
        job_posting = self.db.query(JobPosting).filter(
            JobPosting.id == application.job_posting_id
        ).first()
        
        current_user = get_current_user()
        if (current_user.role != UserRole.ADMIN and 
            job_posting.recruiter_id != updated_by):
            raise ValueError("Access denied")
        
        old_status = application.status
        application.status = new_status
        application.status_updated_at = datetime.utcnow()
        application.status_updated_by = updated_by
        
        if notes:
            application.notes = notes
        
        self.db.commit()
        self.db.refresh(application)
        
        # Create status history entry
        self._create_status_history(
            application_id,
            old_status,
            new_status,
            updated_by,
            notes
        )
        
        return application
    
    @require_role([UserRole.RECRUITER, UserRole.ADMIN])
    def rate_application(
        self,
        application_id: str,
        rating: int,
        rated_by: str,
        notes: Optional[str] = None
    ) -> Optional[Application]:
        """Rate an application (1-5 stars)"""
        
        if rating < 1 or rating > 5:
            raise ValueError("Rating must be between 1 and 5")
        
        application = self.db.query(Application).filter(
            Application.id == application_id
        ).first()
        
        if not application:
            return None
        
        # Verify recruiter has access
        job_posting = self.db.query(JobPosting).filter(
            JobPosting.id == application.job_posting_id
        ).first()
        
        current_user = get_current_user()
        if (current_user.role != UserRole.ADMIN and 
            job_posting.recruiter_id != rated_by):
            raise ValueError("Access denied")
        
        application.rating = rating
        if notes:
            application.notes = notes
        
        self.db.commit()
        self.db.refresh(application)
        
        return application
    
    def get_application_history(self, application_id: str) -> List[ApplicationStatusHistory]:
        """Get status change history for an application"""
        return self.db.query(ApplicationStatusHistory).filter(
            ApplicationStatusHistory.application_id == application_id
        ).order_by(ApplicationStatusHistory.created_at).all()
    
    def get_application_statistics(
        self, 
        recruiter_id: Optional[str] = None,
        job_posting_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get application statistics"""
        
        query = self.db.query(Application)
        
        if job_posting_id:
            query = query.filter(Application.job_posting_id == job_posting_id)
        elif recruiter_id:
            # Get applications for all jobs by this recruiter
            job_ids = self.db.query(JobPosting.id).filter(
                JobPosting.recruiter_id == recruiter_id
            ).subquery()
            query = query.filter(Application.job_posting_id.in_(job_ids))
        
        total_applications = query.count()
        
        # Count by status
        status_counts = {}
        for status in ApplicationStatus:
            count = query.filter(Application.status == status).count()
            status_counts[status.value] = count
        
        # Calculate conversion rates
        submitted = status_counts.get("submitted", 0)
        under_review = status_counts.get("under_review", 0)
        shortlisted = status_counts.get("shortlisted", 0)
        interviewed = status_counts.get("interviewed", 0)
        offered = status_counts.get("offered", 0)
        
        conversion_rates = {}
        if total_applications > 0:
            conversion_rates = {
                "review_rate": (under_review + shortlisted + interviewed + offered) / total_applications * 100,
                "shortlist_rate": (shortlisted + interviewed + offered) / total_applications * 100,
                "interview_rate": (interviewed + offered) / total_applications * 100,
                "offer_rate": offered / total_applications * 100
            }
        
        return {
            "total_applications": total_applications,
            "status_counts": status_counts,
            "conversion_rates": conversion_rates
        }
    
    @require_role([UserRole.JOB_SEEKER])
    def withdraw_application(self, application_id: str, applicant_id: str) -> Optional[Application]:
        """Allow job seeker to withdraw their application"""
        
        application = self.db.query(Application).filter(
            and_(
                Application.id == application_id,
                Application.applicant_id == applicant_id
            )
        ).first()
        
        if not application:
            return None
        
        # Can only withdraw if not already processed
        if application.status in [ApplicationStatus.OFFERED, ApplicationStatus.REJECTED]:
            raise ValueError("Cannot withdraw application at this stage")
        
        old_status = application.status
        application.status = ApplicationStatus.WITHDRAWN
        application.status_updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(application)
        
        # Create status history entry
        self._create_status_history(
            application_id,
            old_status,
            ApplicationStatus.WITHDRAWN,
            applicant_id,
            "Application withdrawn by candidate"
        )
        
        return application
    
    def _create_status_history(
        self,
        application_id: str,
        old_status: Optional[ApplicationStatus],
        new_status: ApplicationStatus,
        changed_by: str,
        notes: Optional[str] = None
    ) -> ApplicationStatusHistory:
        """Create a status history entry"""
        
        history_entry = ApplicationStatusHistory(
            id=str(uuid.uuid4()),
            application_id=application_id,
            old_status=old_status,
            new_status=new_status,
            changed_by=changed_by,
            notes=notes
        )
        
        self.db.add(history_entry)
        self.db.commit()
        
        return history_entry
    
    def bulk_update_applications(
        self,
        application_ids: List[str],
        new_status: ApplicationStatus,
        updated_by: str,
        notes: Optional[str] = None
    ) -> List[Application]:
        """Bulk update multiple applications"""
        
        applications = self.db.query(Application).filter(
            Application.id.in_(application_ids)
        ).all()
        
        updated_applications = []
        
        for application in applications:
            # Verify access for each application
            job_posting = self.db.query(JobPosting).filter(
                JobPosting.id == application.job_posting_id
            ).first()
            
            current_user = get_current_user()
            if (current_user.role != UserRole.ADMIN and 
                job_posting.recruiter_id != updated_by):
                continue  # Skip applications without access
            
            old_status = application.status
            application.status = new_status
            application.status_updated_at = datetime.utcnow()
            application.status_updated_by = updated_by
            
            if notes:
                application.notes = notes
            
            # Create status history
            self._create_status_history(
                application.id,
                old_status,
                new_status,
                updated_by,
                notes
            )
            
            updated_applications.append(application)
        
        self.db.commit()
        
        return updated_applications


def format_application_for_api(application: Application) -> Dict[str, Any]:
    """Format application for API response"""
    return {
        "id": application.id,
        "job_posting_id": application.job_posting_id,
        "job_title": application.job_posting.title if application.job_posting else None,
        "company_name": application.job_posting.company_name if application.job_posting else None,
        "applicant": {
            "id": application.applicant.id,
            "full_name": application.applicant.full_name,
            "email": application.applicant.email,
            "location": application.applicant.location,
            "current_position": application.applicant.current_position,
            "skills": application.applicant.skills
        } if application.applicant else None,
        "cover_letter": application.cover_letter,
        "resume_url": application.resume_url,
        "resume_filename": application.resume_filename,
        "status": application.status.value if application.status else None,
        "status_updated_at": application.status_updated_at.isoformat() if application.status_updated_at else None,
        "answers": application.answers,
        "notes": application.notes,
        "rating": application.rating,
        "created_at": application.created_at.isoformat() if application.created_at else None,
        "updated_at": application.updated_at.isoformat() if application.updated_at else None
    }


def validate_application_data(application_data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate application data before submission"""
    errors = {}
    
    # Resume is required
    if not application_data.get("resume_url"):
        errors["resume"] = "Resume is required"
    
    # Validate file format if provided
    resume_filename = application_data.get("resume_filename", "")
    if resume_filename:
        allowed_extensions = [".pdf", ".doc", ".docx"]
        if not any(resume_filename.lower().endswith(ext) for ext in allowed_extensions):
            errors["resume_format"] = "Resume must be in PDF, DOC, or DOCX format"
    
    return errors