import os
import json
import pandas as pd
from sqlalchemy.orm import Session
from fastapi import UploadFile
from app.models.dataset import Dataset, DatasetVersion, DataQualityReport

STORAGE_DIR = "storage"

def ensure_storage_dir():
    if not os.path.exists(STORAGE_DIR):
        os.makedirs(STORAGE_DIR)

class DatasetService:
    @staticmethod
    def create_dataset(db: Session, name: str, description: str, creator_id: str) -> Dataset:
        dataset = Dataset(name=name, description=description, created_by=creator_id)
        db.add(dataset)
        db.commit()
        db.refresh(dataset)
        return dataset

    @staticmethod
    async def upload_version(
        db: Session, 
        dataset_id: str, 
        upload_file: UploadFile
    ) -> DatasetVersion:
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
        if not dataset:
            raise ValueError("Dataset not found.")

        if not upload_file.filename:
            raise ValueError("Uploaded file must have a filename.")

        file_ext = os.path.splitext(upload_file.filename)[1].lower()
        if file_ext != ".csv":
            raise ValueError("Only CSV files are supported.")

        ensure_storage_dir()
        
        # Get next version number
        existing_versions = db.query(DatasetVersion).filter(DatasetVersion.dataset_id == dataset_id).all()
        max_version = max((v.version_num for v in existing_versions), default=0)
        version_num = max_version + 1
        
        # Define storage path
        filename = f"{dataset_id}_v{version_num}{file_ext}"
        file_path = os.path.join(STORAGE_DIR, filename)
        
        # Save file to storage
        with open(file_path, "wb") as f:
            content = await upload_file.read()
            f.write(content)
            
        # Parse data with pandas to generate stats and counts
        try:
            # Parse CSV and derive quality summary
            df = pd.read_csv(file_path, low_memory=False)
            row_count, col_count = df.shape
            
            # Compute data quality stats
            missing = df.isnull().sum().to_dict()
            dtypes = {col: str(dtype) for col, dtype in df.dtypes.items()}
            
            # Summary statistics
            stats_summary = {}
            for col in df.columns:
                if pd.api.types.is_numeric_dtype(df[col]):
                    stats_summary[col] = {
                        "mean": float(df[col].mean()) if not pd.isna(df[col].mean()) else 0.0,
                        "min": float(df[col].min()) if not pd.isna(df[col].min()) else 0.0,
                        "max": float(df[col].max()) if not pd.isna(df[col].max()) else 0.0,
                        "std": float(df[col].std()) if not pd.isna(df[col].std()) else 0.0,
                    }
                else:
                    stats_summary[col] = {
                        "unique": int(df[col].nunique()),
                        "top": str(df[col].mode().iloc[0]) if len(df[col].mode()) > 0 else "N/A"
                    }
        except Exception as e:
            if os.path.exists(file_path):
                os.remove(file_path)
            raise ValueError(f"Failed to parse CSV file: {str(e)}")

        # Save DatasetVersion record
        db_version = DatasetVersion(
            dataset_id=dataset_id,
            version_num=version_num,
            file_path=file_path,
            row_count=row_count,
            col_count=col_count
        )
        db.add(db_version)
        db.commit()
        db.refresh(db_version)

        # Save DataQualityReport record
        quality_report = DataQualityReport(
            dataset_version_id=db_version.id,
            missing_values_json=missing,
            data_types_json=dtypes,
            summary_stats_json=stats_summary
        )
        db.add(quality_report)
        db.commit()

        return db_version
        
    @staticmethod
    def get_datasets(db: Session):
        return db.query(Dataset).all()
        
    @staticmethod
    def get_versions(db: Session, dataset_id: str):
        return db.query(DatasetVersion).filter(DatasetVersion.dataset_id == dataset_id).all()
        
    @staticmethod
    def get_version(db: Session, version_id: str) -> DatasetVersion:
        return db.query(DatasetVersion).filter(DatasetVersion.id == version_id).first()
