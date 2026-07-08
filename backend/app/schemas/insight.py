from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class AIInsightBase(BaseModel):
    summary: str
    key_findings_json: Optional[List[str]] = None
    recommendations_json: Optional[List[str]] = None

class AIInsight(AIInsightBase):
    id: str
    drift_analysis_id: str
    prompt_execution_id: str
    created_at: datetime
    class Config:
        from_attributes = True


class GuardrailValidationResult(BaseModel):
    check_name: str
    status: str
    score: Optional[float] = None
    feedback: Optional[str] = None


class InsightDetail(BaseModel):
    analysis_id: str
    insight_available: bool
    drift_severity: str
    executive_summary: Optional[str] = None
    technical_analysis: List[str] = []
    business_impact: Optional[str] = None
    recommendations: List[str] = []
    prompt_used: Optional[str] = None
    guardrail_validation_result: Optional[GuardrailValidationResult] = None
    generation_time: Optional[float] = None
    model_used: Optional[str] = None
    generated_at: Optional[datetime] = None


class InsightListItem(BaseModel):
    analysis_id: str
    status: str
    created_at: datetime
    drift_severity: str
    insight_available: bool
    generated_at: Optional[datetime] = None
