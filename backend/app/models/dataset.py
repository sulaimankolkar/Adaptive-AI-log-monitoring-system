import uuid
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_by = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=func.now())

    creator = relationship("User", back_populates="datasets")
    versions = relationship("DatasetVersion", back_populates="dataset", cascade="all, delete-orphan")

class DatasetVersion(Base):
    __tablename__ = "dataset_versions"

    id = Column(String, primary_key=True, default=generate_uuid)
    dataset_id = Column(String, ForeignKey("datasets.id"), nullable=False)
    version_num = Column(Integer, nullable=False)
    file_path = Column(String, nullable=False)
    row_count = Column(Integer, nullable=True)
    col_count = Column(Integer, nullable=True)
    uploaded_at = Column(DateTime, default=func.now())

    dataset = relationship("Dataset", back_populates="versions")
    quality_report = relationship("DataQualityReport", back_populates="version", uselist=False, cascade="all, delete-orphan")

class DataQualityReport(Base):
    __tablename__ = "data_quality_reports"

    id = Column(String, primary_key=True, default=generate_uuid)
    dataset_version_id = Column(String, ForeignKey("dataset_versions.id"), unique=True, nullable=False)
    missing_values_json = Column(JSON, nullable=True)
    data_types_json = Column(JSON, nullable=True)
    summary_stats_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=func.now())

    version = relationship("DatasetVersion", back_populates="quality_report")
