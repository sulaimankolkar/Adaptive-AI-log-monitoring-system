from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.models.dataset import DatasetVersion
from app.schemas.drift import DriftAnalysis as DriftAnalysisSchema, DriftAnalysisCreate
from app.services.drift_service import DriftService

router = APIRouter()

@router.get("/", response_model=List[DriftAnalysisSchema])
def get_analyses(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return DriftService.get_analyses(db)

@router.post("/", response_model=DriftAnalysisSchema)
def create_drift_analysis(
    analysis_in: DriftAnalysisCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    # Verify versions exist
    ref = db.query(DatasetVersion).filter(DatasetVersion.id == analysis_in.reference_version_id).first()
    tar = db.query(DatasetVersion).filter(DatasetVersion.id == analysis_in.target_version_id).first()

    if not ref or not tar:
        raise HTTPException(status_code=404, detail="Reference or target dataset version not found.")

    if analysis_in.reference_version_id == analysis_in.target_version_id:
        raise HTTPException(status_code=400, detail="Reference and target versions must be different.")
    
    analysis = DriftService.create_analysis(
        db, 
        reference_version_id=analysis_in.reference_version_id,
        target_version_id=analysis_in.target_version_id,
        creator_id=current_user.id
    )
    
    # Run the drift statistical & AI pipeline in the background
    background_tasks.add_task(DriftService.run_analysis_pipeline_task, analysis.id)
    return analysis

@router.get("/{analysis_id}", response_model=DriftAnalysisSchema)
def get_analysis_details(
    analysis_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    analysis = DriftService.get_analysis_details(db, analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Drift Analysis not found.")
    return analysis
