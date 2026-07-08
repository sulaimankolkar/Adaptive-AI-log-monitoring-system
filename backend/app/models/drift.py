import uuid
from sqlalchemy import Column, DateTime, ForeignKey, String, Float, Boolean, func
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class DriftAnalysis(Base):
    __tablename__ = "drift_analyses"

    id = Column(String, primary_key=True, default=generate_uuid)
    reference_version_id = Column(String, ForeignKey("dataset_versions.id"), nullable=False)
    target_version_id = Column(String, ForeignKey("dataset_versions.id"), nullable=False)
    status = Column(String, default="pending")  # pending, running, completed, failed
    created_by = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=func.now())

    creator = relationship("User", back_populates="drift_analyses")
    metrics = relationship("DriftMetrics", back_populates="analysis", cascade="all, delete-orphan")
    prompt_executions = relationship("PromptExecution", back_populates="analysis", cascade="all, delete-orphan")
    ai_insight = relationship("AIInsight", back_populates="analysis", uselist=False, cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="analysis", cascade="all, delete-orphan")

    reference_version = relationship("DatasetVersion", foreign_keys=[reference_version_id])
    target_version = relationship("DatasetVersion", foreign_keys=[target_version_id])

class DriftMetrics(Base):
    __tablename__ = "drift_metrics"

    id = Column(String, primary_key=True, default=generate_uuid)
    drift_analysis_id = Column(String, ForeignKey("drift_analyses.id"), nullable=False)
    feature_name = Column(String, nullable=False)
    statistical_method = Column(String, nullable=False)  # Kolmogorov-Smirnov, Chi-Square, PSI
    score = Column(Float, nullable=False)
    p_value = Column(Float, nullable=True)
    is_drifted = Column(Boolean, default=False)
    severity = Column(String, nullable=False)  # none, minor, moderate, major
    drift_type = Column(String, nullable=False)  # numerical, categorical

    analysis = relationship("DriftAnalysis", back_populates="metrics")
