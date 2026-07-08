from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.schemas.dataset import Dataset as DatasetSchema, DatasetCreate, DatasetVersion as VersionSchema
from app.services.dataset_service import DatasetService

router = APIRouter()

@router.get("/", response_model=List[DatasetSchema])
def get_datasets(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return DatasetService.get_datasets(db)

@router.post("/", response_model=DatasetSchema)
def create_dataset(
    dataset_in: DatasetCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return DatasetService.create_dataset(
        db, name=dataset_in.name, description=dataset_in.description, creator_id=current_user.id
    )

@router.post("/{dataset_id}/upload", response_model=VersionSchema)
async def upload_dataset_version(
    dataset_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    try:
        version = await DatasetService.upload_version(db, dataset_id, file)
        return version
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload dataset: {str(e)}")

@router.get("/{dataset_id}/versions", response_model=List[VersionSchema])
def get_dataset_versions(
    dataset_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return DatasetService.get_versions(db, dataset_id)
