import uuid
from sqlalchemy import Column, DateTime, ForeignKey, String, Float, Text, func
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class GuardrailResult(Base):
    __tablename__ = "guardrail_results"

    id = Column(String, primary_key=True, default=generate_uuid)
    prompt_execution_id = Column(String, ForeignKey("prompt_executions.id"), nullable=False)
    check_name = Column(String, nullable=False)  # schema_conformity, toxic_content, metric_factuality
    status = Column(String, default="pass")  # pass, fail
    score = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)
    verified_at = Column(DateTime, default=func.now())

    execution = relationship("PromptExecution", back_populates="guardrail_results")
