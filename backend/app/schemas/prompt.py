from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class GuardrailResultBase(BaseModel):
    check_name: str
    status: str
    score: Optional[float] = None
    feedback: Optional[str] = None

class GuardrailResult(GuardrailResultBase):
    id: str
    prompt_execution_id: str
    verified_at: datetime
    class Config:
        from_attributes = True

class PromptExecutionBase(BaseModel):
    rendered_prompt: str
    response_text: Optional[str] = None
    tokens_used: Optional[int] = None
    execution_time_seconds: Optional[float] = None

class PromptExecution(PromptExecutionBase):
    id: str
    prompt_template_id: str
    drift_analysis_id: str
    executed_at: datetime
    guardrail_results: List[GuardrailResult] = []
    class Config:
        from_attributes = True

class PromptTemplateBase(BaseModel):
    name: str
    system_prompt: Optional[str] = None
    template_body: str
    variables: Optional[List[str]] = None

class PromptTemplateCreate(PromptTemplateBase):
    pass

class PromptTemplate(PromptTemplateBase):
    id: str
    created_by: Optional[str] = None
    updated_at: datetime
    class Config:
        from_attributes = True
