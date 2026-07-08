import uuid
from sqlalchemy import Column, DateTime, ForeignKey, String, Text, func, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class AIInsight(Base):
    __tablename__ = "ai_insights"

    id = Column(String, primary_key=True, default=generate_uuid)
    drift_analysis_id = Column(String, ForeignKey("drift_analyses.id"), unique=True, nullable=False)
    prompt_execution_id = Column(String, ForeignKey("prompt_executions.id"), nullable=False)
    summary = Column(Text, nullable=False)
    key_findings_json = Column(JSON, nullable=True)  # List of findings
    recommendations_json = Column(JSON, nullable=True)  # List of recommendations
    created_at = Column(DateTime, default=func.now())

    analysis = relationship("DriftAnalysis", back_populates="ai_insight")
    execution = relationship("PromptExecution", back_populates="ai_insights")
