import uuid
from sqlalchemy import Column, DateTime, ForeignKey, String, func
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, default=generate_uuid)
    drift_analysis_id = Column(String, ForeignKey("drift_analyses.id"), nullable=False)
    format = Column(String, default="pdf")  # pdf, json
    file_path = Column(String, nullable=False)
    created_by = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=func.now())

    analysis = relationship("DriftAnalysis", back_populates="reports")
    creator = relationship("User", back_populates="reports")
