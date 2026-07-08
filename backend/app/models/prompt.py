import uuid
from sqlalchemy import Column, DateTime, ForeignKey, String, Text, Integer, Float, func, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class PromptTemplate(Base):
    __tablename__ = "prompt_templates"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False, unique=True)
    system_prompt = Column(Text, nullable=True)
    template_body = Column(Text, nullable=False)
    variables = Column(JSON, nullable=True)  # List of variables expected
    created_by = Column(String, ForeignKey("users.id"), nullable=True)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    executions = relationship("PromptExecution", back_populates="template")

class PromptExecution(Base):
    __tablename__ = "prompt_executions"

    id = Column(String, primary_key=True, default=generate_uuid)
    prompt_template_id = Column(String, ForeignKey("prompt_templates.id"), nullable=False)
    drift_analysis_id = Column(String, ForeignKey("drift_analyses.id"), nullable=False)
    rendered_prompt = Column(Text, nullable=False)
    response_text = Column(Text, nullable=True)
    tokens_used = Column(Integer, nullable=True)
    execution_time_seconds = Column(Float, nullable=True)
    executed_at = Column(DateTime, default=func.now())

    template = relationship("PromptTemplate", back_populates="executions")
    analysis = relationship("DriftAnalysis", back_populates="prompt_executions")
    guardrail_results = relationship("GuardrailResult", back_populates="execution", cascade="all, delete-orphan")
    ai_insights = relationship("AIInsight", back_populates="execution", cascade="all, delete-orphan")
