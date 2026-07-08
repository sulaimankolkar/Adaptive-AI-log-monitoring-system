from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.schemas.report import Report as ReportSchema
from app.services.report_service import ReportService

router = APIRouter()

@router.post("/analysis/{analysis_id}", response_model=ReportSchema)
def generate_report(
    analysis_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    try:
        report = ReportService.generate_pdf_report(db, analysis_id, creator_id=current_user.id)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")

@router.get("/{report_id}/download")
def download_report(
    report_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    from app.models.report import Report
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
        
    return FileResponse(
        path=report.file_path,
        filename=f"Drift_Report_{report.drift_analysis_id[:8]}.pdf",
        media_type="application/pdf"
    )
