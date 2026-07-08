from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class DataQualityReportBase(BaseModel):
    missing_values_json: Optional[Dict[str, Any]] = None
    data_types_json: Optional[Dict[str, Any]] = None
    summary_stats_json: Optional[Dict[str, Any]] = None

class DataQualityReport(DataQualityReportBase):
    id: str
    dataset_version_id: str
    created_at: datetime
    class Config:
        from_attributes = True

class DatasetVersionBase(BaseModel):
    version_num: int
    row_count: Optional[int] = None
    col_count: Optional[int] = None

class DatasetVersion(DatasetVersionBase):
    id: str
    dataset_id: str
    file_path: str
    uploaded_at: datetime
    quality_report: Optional[DataQualityReport] = None
    class Config:
        from_attributes = True

class DatasetBase(BaseModel):
    name: str
    description: Optional[str] = None

class DatasetCreate(DatasetBase):
    pass

class Dataset(DatasetBase):
    id: str
    created_by: Optional[str] = None
    created_at: datetime
    versions: List[DatasetVersion] = []
    class Config:
        from_attributes = True
