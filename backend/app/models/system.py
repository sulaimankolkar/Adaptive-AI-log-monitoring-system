import uuid
from sqlalchemy import Column, DateTime, ForeignKey, String, Text, func, JSON, Boolean
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(String, primary_key=True, default=generate_uuid)
    key = Column(String, unique=True, index=True, nullable=False)
    value = Column(Text, nullable=False)
    description = Column(Text, nullable=True)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    type = Column(String, default="info")  # alert, info
    created_at = Column(DateTime, default=func.now())

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    entity_type = Column(String, nullable=True)
    entity_id = Column(String, nullable=True)
    timestamp = Column(DateTime, default=func.now())
