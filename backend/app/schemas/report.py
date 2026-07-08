from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReportBase(BaseModel):
    drift_analysis_id: str
    format: Optional[str] = "pdf"

class Report(ReportBase):
    id: str
    file_path: str
    created_by: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True
