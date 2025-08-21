"""
Job Postings Module
CRUD operations for job listings with role-based access control
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc
from datetime import datetime, timedelta
import uuid

from models import JobPosting, User, UserRole, JobStatus, Application
from user_roles import require_role, get_current_user


class JobPostingService:
    def __init__(self, db: Session):
        self.db = db
    
    @require_role([UserRole.RECRUITER, UserRole.ADMIN])
    def create_job_posting(self, job_data: Dict[str, Any], recruiter_id: str) -> JobPosting:
        """Create a new job posting"""
        job_posting = JobPosting(
            id=str(uuid.uuid4()),
            recruiter_id=recruiter_id,
            **job_data
        )
        
        self.db.add(job_posting)
        self.db.commit()
        self.db.refresh(job_posting)
        
        return job_posting
    
    def get_job_posting(self, job_id: str, include_inactive: bool = False) -> Optional[JobPosting]:
        """Get a single job posting by ID"""
        query = self.db.query(JobPosting).filter(JobPosting.id == job_id)
        
        if not include_inactive:
            query = query.filter(JobPosting.status == JobStatus.ACTIVE)
        
        return query.first()
    
    def get_job_postings(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        location: Optional[str] = None,
        work_type: Optional[str] = None,
        is_remote: Optional[bool] = None,
        salary_min: Optional[int] = None,
        salary_max: Optional[int] = None,
        skills: Optional[List[str]] = None,
        recruiter_id: Optional[str] = None,
        status: Optional[JobStatus] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> List[JobPosting]:
        """Get job postings with filtering and pagination"""
        
        query = self.db.query(JobPosting)
        
        # Apply filters
        if recruiter_id:
            query = query.filter(JobPosting.recruiter_id == recruiter_id)
        else:
            # Public view - only show active jobs
            query = query.filter(JobPosting.status == JobStatus.ACTIVE)
        
        if status:
            query = query.filter(JobPosting.status == status)
        
        if search:
            search_filter = or_(
                JobPosting.title.ilike(f"%{search}%"),
                JobPosting.description.ilike(f"%{search}%"),
                JobPosting.company_name.ilike(f"%{search}%")
            )
            query = query.filter(search_filter)
        
        if location:
            query = query.filter(JobPosting.location.ilike(f"%{location}%"))
        
        if work_type:
            query = query.filter(JobPosting.work_type == work_type)
        
        if is_remote is not None:
            query = query.filter(JobPosting.is_remote == is_remote)
        
        if salary_min:
            query = query.filter(JobPosting.salary_max >= salary_min)
        
        if salary_max:
            query = query.filter(JobPosting.salary_min <= salary_max)
        
        if skills:
            # Filter jobs that require any of the specified skills
            for skill in skills:
                query = query.filter(
                    or_(
                        JobPosting.skills_required.contains([skill]),
                        JobPosting.skills_preferred.contains([skill])
                    )
                )
        
        # Apply sorting
        if sort_order == "desc":
            query = query.order_by(desc(getattr(JobPosting, sort_by)))
        else:
            query = query.order_by(asc(getattr(JobPosting, sort_by)))
        
        return query.offset(skip).limit(limit).all()
    
    @require_role([UserRole.RECRUITER, UserRole.ADMIN])
    def update_job_posting(
        self, 
        job_id: str, 
        update_data: Dict[str, Any], 
        recruiter_id: str
    ) -> Optional[JobPosting]:
        """Update a job posting"""
        job_posting = self.db.query(JobPosting).filter(
            and_(
                JobPosting.id == job_id,
                JobPosting.recruiter_id == recruiter_id
            )
        ).first()
        
        if not job_posting:
            return None
        
        for key, value in update_data.items():
            if hasattr(job_posting, key):
                setattr(job_posting, key, value)
        
        job_posting.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(job_posting)
        
        return job_posting
    
    @require_role([UserRole.RECRUITER, UserRole.ADMIN])
    def delete_job_posting(self, job_id: str, recruiter_id: str) -> bool:
        """Delete a job posting (soft delete by setting status to closed)"""
        job_posting = self.db.query(JobPosting).filter(
            and_(
                JobPosting.id == job_id,
                JobPosting.recruiter_id == recruiter_id
            )
        ).first()
        
        if not job_posting:
            return False
        
        job_posting.status = JobStatus.CLOSED
        job_posting.updated_at = datetime.utcnow()
        self.db.commit()
        
        return True
    
    @require_role([UserRole.RECRUITER, UserRole.ADMIN])
    def change_job_status(
        self, 
        job_id: str, 
        new_status: JobStatus, 
        recruiter_id: str
    ) -> Optional[JobPosting]:
        """Change job posting status"""
        job_posting = self.db.query(JobPosting).filter(
            and_(
                JobPosting.id == job_id,
                JobPosting.recruiter_id == recruiter_id
            )
        ).first()
        
        if not job_posting:
            return None
        
        job_posting.status = new_status
        job_posting.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(job_posting)
        
        return job_posting
    
    def get_job_statistics(self, recruiter_id: Optional[str] = None) -> Dict[str, Any]:
        """Get job posting statistics"""
        query = self.db.query(JobPosting)
        
        if recruiter_id:
            query = query.filter(JobPosting.recruiter_id == recruiter_id)
        
        total_jobs = query.count()
        active_jobs = query.filter(JobPosting.status == JobStatus.ACTIVE).count()
        draft_jobs = query.filter(JobPosting.status == JobStatus.DRAFT).count()
        closed_jobs = query.filter(JobPosting.status == JobStatus.CLOSED).count()
        
        # Get jobs created in the last 30 days
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_jobs = query.filter(JobPosting.created_at >= thirty_days_ago).count()
        
        return {
            "total_jobs": total_jobs,
            "active_jobs": active_jobs,
            "draft_jobs": draft_jobs,
            "closed_jobs": closed_jobs,
            "recent_jobs": recent_jobs
        }
    
    def get_trending_skills(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get most frequently required skills across active job postings"""
        # This would require more complex SQL aggregation
        # For now, return a placeholder implementation
        active_jobs = self.db.query(JobPosting).filter(
            JobPosting.status == JobStatus.ACTIVE
        ).all()
        
        skill_counts = {}
        for job in active_jobs:
            if job.skills_required:
                for skill in job.skills_required:
                    skill_counts[skill] = skill_counts.get(skill, 0) + 1
            if job.skills_preferred:
                for skill in job.skills_preferred:
                    skill_counts[skill] = skill_counts.get(skill, 0) + 1
        
        # Sort by count and return top skills
        trending_skills = sorted(
            [{"skill": skill, "count": count} for skill, count in skill_counts.items()],
            key=lambda x: x["count"],
            reverse=True
        )[:limit]
        
        return trending_skills
    
    def get_jobs_by_recruiter(self, recruiter_id: str) -> List[JobPosting]:
        """Get all job postings by a specific recruiter"""
        return self.db.query(JobPosting).filter(
            JobPosting.recruiter_id == recruiter_id
        ).order_by(desc(JobPosting.created_at)).all()
    
    def search_jobs_advanced(
        self,
        query_params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Advanced job search with faceted results"""
        jobs = self.get_job_postings(**query_params)
        
        # Get facets for filtering
        all_jobs = self.db.query(JobPosting).filter(
            JobPosting.status == JobStatus.ACTIVE
        ).all()
        
        # Calculate facets
        locations = list(set([job.location for job in all_jobs if job.location]))
        work_types = list(set([job.work_type for job in all_jobs if job.work_type]))
        companies = list(set([job.company_name for job in all_jobs]))
        
        return {
            "jobs": jobs,
            "facets": {
                "locations": locations,
                "work_types": work_types,
                "companies": companies
            },
            "total_count": len(jobs)
        }


# Utility functions for job posting validation
def validate_job_posting_data(job_data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate job posting data before creation/update"""
    errors = {}
    
    required_fields = ["title", "company_name", "description"]
    for field in required_fields:
        if not job_data.get(field):
            errors[field] = f"{field} is required"
    
    # Validate salary range
    salary_min = job_data.get("salary_min")
    salary_max = job_data.get("salary_max")
    if salary_min and salary_max and salary_min > salary_max:
        errors["salary"] = "Minimum salary cannot be greater than maximum salary"
    
    # Validate work type
    valid_work_types = ["full-time", "part-time", "contract", "internship", "freelance"]
    work_type = job_data.get("work_type")
    if work_type and work_type not in valid_work_types:
        errors["work_type"] = f"Work type must be one of: {', '.join(valid_work_types)}"
    
    return errors


def format_job_posting_for_api(job_posting: JobPosting) -> Dict[str, Any]:
    """Format job posting for API response"""
    return {
        "id": job_posting.id,
        "title": job_posting.title,
        "company_name": job_posting.company_name,
        "description": job_posting.description,
        "requirements": job_posting.requirements,
        "responsibilities": job_posting.responsibilities,
        "location": job_posting.location,
        "is_remote": job_posting.is_remote,
        "work_type": job_posting.work_type,
        "salary_min": job_posting.salary_min,
        "salary_max": job_posting.salary_max,
        "currency": job_posting.currency,
        "department": job_posting.department,
        "experience_level": job_posting.experience_level,
        "skills_required": job_posting.skills_required,
        "skills_preferred": job_posting.skills_preferred,
        "status": job_posting.status.value if job_posting.status else None,
        "is_featured": job_posting.is_featured,
        "expires_at": job_posting.expires_at.isoformat() if job_posting.expires_at else None,
        "created_at": job_posting.created_at.isoformat() if job_posting.created_at else None,
        "updated_at": job_posting.updated_at.isoformat() if job_posting.updated_at else None,
        "recruiter": {
            "id": job_posting.recruiter.id,
            "full_name": job_posting.recruiter.full_name,
            "company_name": job_posting.recruiter.company_name
        } if job_posting.recruiter else None,
        "application_count": len(job_posting.applications) if job_posting.applications else 0
    }