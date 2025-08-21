"""
Chat Interface Module
Real-time messaging between job seekers and recruiters
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from datetime import datetime
import uuid

from models import ChatMessage, User, UserRole, Application
from user_roles import require_role, get_current_user


class ChatService:
    def __init__(self, db: Session):
        self.db = db
    
    def send_message(
        self,
        sender_id: str,
        recipient_id: str,
        message: str,
        application_id: Optional[str] = None,
        message_type: str = "text",
        file_url: Optional[str] = None,
        file_name: Optional[str] = None
    ) -> ChatMessage:
        """Send a message between users"""
        
        # Verify users exist and have permission to chat
        sender = self.db.query(User).filter(User.id == sender_id).first()
        recipient = self.db.query(User).filter(User.id == recipient_id).first()
        
        if not sender or not recipient:
            raise ValueError("Sender or recipient not found")
        
        # Verify chat permission if linked to application
        if application_id:
            application = self.db.query(Application).filter(
                Application.id == application_id
            ).first()
            
            if not application:
                raise ValueError("Application not found")
            
            # Only allow chat between applicant and job poster
            if not ((sender_id == application.applicant_id and 
                    recipient_id == application.job_posting.recruiter_id) or
                   (sender_id == application.job_posting.recruiter_id and 
                    recipient_id == application.applicant_id)):
                raise ValueError("Not authorized to chat about this application")
        
        # Create message
        chat_message = ChatMessage(
            id=str(uuid.uuid4()),
            sender_id=sender_id,
            recipient_id=recipient_id,
            application_id=application_id,
            message=message,
            message_type=message_type,
            file_url=file_url,
            file_name=file_name
        )
        
        self.db.add(chat_message)
        self.db.commit()
        self.db.refresh(chat_message)
        
        return chat_message
    
    def get_conversation(
        self,
        user1_id: str,
        user2_id: str,
        application_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[ChatMessage]:
        """Get conversation between two users"""
        
        query = self.db.query(ChatMessage).filter(
            or_(
                and_(
                    ChatMessage.sender_id == user1_id,
                    ChatMessage.recipient_id == user2_id
                ),
                and_(
                    ChatMessage.sender_id == user2_id,
                    ChatMessage.recipient_id == user1_id
                )
            )
        )
        
        if application_id:
            query = query.filter(ChatMessage.application_id == application_id)
        
        return query.order_by(desc(ChatMessage.created_at)).offset(skip).limit(limit).all()
    
    def get_user_conversations(
        self,
        user_id: str,
        skip: int = 0,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Get all conversations for a user with latest message"""
        
        # Get all unique conversation partners
        sent_messages = self.db.query(ChatMessage.recipient_id).filter(
            ChatMessage.sender_id == user_id
        ).distinct()
        
        received_messages = self.db.query(ChatMessage.sender_id).filter(
            ChatMessage.recipient_id == user_id
        ).distinct()
        
        # Combine and get unique partner IDs
        partner_ids = set()
        for msg in sent_messages:
            partner_ids.add(msg.recipient_id)
        for msg in received_messages:
            partner_ids.add(msg.sender_id)
        
        conversations = []
        
        for partner_id in partner_ids:
            # Get latest message in conversation
            latest_message = self.db.query(ChatMessage).filter(
                or_(
                    and_(
                        ChatMessage.sender_id == user_id,
                        ChatMessage.recipient_id == partner_id
                    ),
                    and_(
                        ChatMessage.sender_id == partner_id,
                        ChatMessage.recipient_id == user_id
                    )
                )
            ).order_by(desc(ChatMessage.created_at)).first()
            
            if latest_message:
                # Get partner info
                partner = self.db.query(User).filter(User.id == partner_id).first()
                
                # Count unread messages
                unread_count = self.db.query(ChatMessage).filter(
                    and_(
                        ChatMessage.sender_id == partner_id,
                        ChatMessage.recipient_id == user_id,
                        ChatMessage.is_read == False
                    )
                ).count()
                
                conversations.append({
                    "partner": {
                        "id": partner.id,
                        "full_name": partner.full_name,
                        "role": partner.role.value,
                        "company_name": partner.company_name if partner.role == UserRole.RECRUITER else None
                    },
                    "latest_message": {
                        "id": latest_message.id,
                        "message": latest_message.message,
                        "message_type": latest_message.message_type,
                        "sender_id": latest_message.sender_id,
                        "created_at": latest_message.created_at.isoformat()
                    },
                    "unread_count": unread_count,
                    "application_id": latest_message.application_id
                })
        
        # Sort by latest message time
        conversations.sort(key=lambda x: x["latest_message"]["created_at"], reverse=True)
        
        return conversations[skip:skip + limit]
    
    def mark_messages_as_read(
        self,
        user_id: str,
        partner_id: str,
        application_id: Optional[str] = None
    ) -> int:
        """Mark messages as read"""
        
        query = self.db.query(ChatMessage).filter(
            and_(
                ChatMessage.sender_id == partner_id,
                ChatMessage.recipient_id == user_id,
                ChatMessage.is_read == False
            )
        )
        
        if application_id:
            query = query.filter(ChatMessage.application_id == application_id)
        
        messages = query.all()
        
        for message in messages:
            message.is_read = True
            message.read_at = datetime.utcnow()
        
        self.db.commit()
        
        return len(messages)
    
    def get_unread_message_count(self, user_id: str) -> int:
        """Get total unread message count for user"""
        return self.db.query(ChatMessage).filter(
            and_(
                ChatMessage.recipient_id == user_id,
                ChatMessage.is_read == False
            )
        ).count()
    
    def delete_message(self, message_id: str, user_id: str) -> bool:
        """Delete a message (only sender can delete)"""
        
        message = self.db.query(ChatMessage).filter(
            and_(
                ChatMessage.id == message_id,
                ChatMessage.sender_id == user_id
            )
        ).first()
        
        if not message:
            return False
        
        self.db.delete(message)
        self.db.commit()
        
        return True
    
    def search_messages(
        self,
        user_id: str,
        search_query: str,
        partner_id: Optional[str] = None,
        application_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 20
    ) -> List[ChatMessage]:
        """Search messages by content"""
        
        query = self.db.query(ChatMessage).filter(
            and_(
                or_(
                    ChatMessage.sender_id == user_id,
                    ChatMessage.recipient_id == user_id
                ),
                ChatMessage.message.ilike(f"%{search_query}%")
            )
        )
        
        if partner_id:
            query = query.filter(
                or_(
                    and_(
                        ChatMessage.sender_id == user_id,
                        ChatMessage.recipient_id == partner_id
                    ),
                    and_(
                        ChatMessage.sender_id == partner_id,
                        ChatMessage.recipient_id == user_id
                    )
                )
            )
        
        if application_id:
            query = query.filter(ChatMessage.application_id == application_id)
        
        return query.order_by(desc(ChatMessage.created_at)).offset(skip).limit(limit).all()
    
    def get_application_messages(
        self,
        application_id: str,
        user_id: str,
        skip: int = 0,
        limit: int = 50
    ) -> List[ChatMessage]:
        """Get all messages related to a specific application"""
        
        # Verify user has access to this application
        application = self.db.query(Application).filter(
            Application.id == application_id
        ).first()
        
        if not application:
            raise ValueError("Application not found")
        
        # Check if user is either the applicant or the recruiter
        if (user_id != application.applicant_id and 
            user_id != application.job_posting.recruiter_id):
            raise ValueError("Access denied")
        
        return self.db.query(ChatMessage).filter(
            ChatMessage.application_id == application_id
        ).order_by(ChatMessage.created_at).offset(skip).limit(limit).all()
    
    def create_system_message(
        self,
        recipient_id: str,
        message: str,
        application_id: Optional[str] = None
    ) -> ChatMessage:
        """Create a system-generated message"""
        
        system_message = ChatMessage(
            id=str(uuid.uuid4()),
            sender_id="system",  # Special system sender ID
            recipient_id=recipient_id,
            application_id=application_id,
            message=message,
            message_type="system"
        )
        
        self.db.add(system_message)
        self.db.commit()
        self.db.refresh(system_message)
        
        return system_message


def format_message_for_api(message: ChatMessage) -> Dict[str, Any]:
    """Format chat message for API response"""
    return {
        "id": message.id,
        "sender": {
            "id": message.sender.id if message.sender else "system",
            "full_name": message.sender.full_name if message.sender else "System",
            "role": message.sender.role.value if message.sender else "system"
        },
        "recipient": {
            "id": message.recipient.id,
            "full_name": message.recipient.full_name,
            "role": message.recipient.role.value
        },
        "application_id": message.application_id,
        "message": message.message,
        "message_type": message.message_type,
        "file_url": message.file_url,
        "file_name": message.file_name,
        "is_read": message.is_read,
        "read_at": message.read_at.isoformat() if message.read_at else None,
        "created_at": message.created_at.isoformat()
    }


def validate_message_data(message_data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate message data before sending"""
    errors = {}
    
    if not message_data.get("message", "").strip():
        errors["message"] = "Message content is required"
    
    message_type = message_data.get("message_type", "text")
    if message_type not in ["text", "file", "system"]:
        errors["message_type"] = "Invalid message type"
    
    if message_type == "file":
        if not message_data.get("file_url"):
            errors["file_url"] = "File URL is required for file messages"
        if not message_data.get("file_name"):
            errors["file_name"] = "File name is required for file messages"
    
    return errors


# Real-time notification helpers
def notify_new_message(message: ChatMessage):
    """Send real-time notification for new message (placeholder for WebSocket/Supabase realtime)"""
    # This would integrate with your real-time system (WebSocket, Supabase realtime, etc.)
    notification_data = {
        "type": "new_message",
        "recipient_id": message.recipient_id,
        "sender_name": message.sender.full_name if message.sender else "System",
        "message_preview": message.message[:50] + "..." if len(message.message) > 50 else message.message,
        "application_id": message.application_id,
        "created_at": message.created_at.isoformat()
    }
    
    # Send notification (implement based on your real-time solution)
    pass


def notify_application_status_change(application_id: str, new_status: str, applicant_id: str):
    """Send system message when application status changes"""
    # This would create a system message to notify the applicant
    pass