from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.prompt import PromptExecution
from app.schemas.insight import AIInsight
from app.schemas.report import Report

class DriftMetricsBase(BaseModel):
    feature_name: str
    statistical_method: str
    score: float
    p_value: Optional[float] = None
    is_drifted: bool
    severity: str
    drift_type: str

class DriftMetrics(DriftMetricsBase):
    id: str
    drift_analysis_id: str
    class Config:
        from_attributes = True

class DriftAnalysisBase(BaseModel):
    reference_version_id: str
    target_version_id: str

class DriftAnalysisCreate(DriftAnalysisBase):
    pass

class DriftAnalysis(DriftAnalysisBase):
    id: str
    status: str
    created_by: Optional[str] = None
    created_at: datetime
    metrics: List[DriftMetrics] = []
    prompt_executions: List[PromptExecution] = []
    ai_insight: Optional[AIInsight] = None
    reports: List[Report] = []
    class Config:
        from_attributes = True
