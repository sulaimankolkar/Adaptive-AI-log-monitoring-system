import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.models.insight import AIInsight
from app.models.drift import DriftAnalysis
from app.models.guardrail import GuardrailResult
from app.ai.drift.classifier import classify_system_drift
from app.schemas.insight import InsightDetail, InsightListItem, GuardrailValidationResult
from app.services.drift_service import DriftService

router = APIRouter()

def _safe_parse_json(text: str) -> dict:
    if not text:
        return {}
    try:
        return json.loads(text)
    except Exception:
        return {}


def _build_detail(analysis: DriftAnalysis) -> InsightDetail:
    metrics_payload = [
        {
            "feature_name": m.feature_name,
            "statistical_method": m.statistical_method,
            "score": m.score,
            "p_value": m.p_value,
            "is_drifted": m.is_drifted,
            "severity": m.severity,
            "drift_type": m.drift_type,
        }
        for m in (analysis.metrics or [])
    ]
    severity_info = classify_system_drift(metrics_payload)

    insight = analysis.ai_insight
    execution = insight.execution if insight else None
    parsed_response = _safe_parse_json(execution.response_text if execution else "")

    technical_analysis = parsed_response.get("technical_analysis")
    if not technical_analysis:
        technical_analysis = []
        if insight and insight.key_findings_json:
            technical_analysis = [x for x in insight.key_findings_json if isinstance(x, str) and not x.startswith("Business Impact:")]
    if not isinstance(technical_analysis, list):
        technical_analysis = [str(technical_analysis)]

    business_impact = parsed_response.get("business_impact")
    if not business_impact and insight and insight.key_findings_json:
        for entry in insight.key_findings_json:
            if isinstance(entry, str) and entry.startswith("Business Impact:"):
                business_impact = entry.replace("Business Impact:", "", 1).strip()
                break

    guardrail_result = None
    if execution and execution.guardrail_results:
        output_guardrail = next(
            (g for g in execution.guardrail_results if g.check_name == "output_conformity_and_factuality"),
            execution.guardrail_results[-1],
        )
        guardrail_result = GuardrailValidationResult(
            check_name=output_guardrail.check_name,
            status=output_guardrail.status,
            score=output_guardrail.score,
            feedback=output_guardrail.feedback,
        )

    return InsightDetail(
        analysis_id=analysis.id,
        insight_available=insight is not None,
        drift_severity=severity_info.get("overall_severity", "none"),
        executive_summary=(
            parsed_response.get("executive_summary")
            or parsed_response.get("summary")
            or (insight.summary if insight else None)
        ),
        technical_analysis=technical_analysis,
        business_impact=business_impact,
        recommendations=(
            parsed_response.get("recommendations")
            if isinstance(parsed_response.get("recommendations"), list)
            else (insight.recommendations_json if insight and insight.recommendations_json else [])
        ),
        prompt_used=execution.rendered_prompt if execution else None,
        guardrail_validation_result=guardrail_result,
        generation_time=execution.execution_time_seconds if execution else None,
        model_used=parsed_response.get("model_used") if parsed_response else None,
        generated_at=insight.created_at if insight else None,
    )


@router.get("/{analysis_id}", response_model=InsightDetail)
def get_insight_by_analysis(
    analysis_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    analysis = DriftService.get_analysis_details(db, analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Drift analysis not found.")
    return _build_detail(analysis)


@router.get("", response_model=List[InsightListItem])
def list_insights(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    analyses = DriftService.get_analyses(db)
    items: List[InsightListItem] = []

    for analysis in analyses:
        metrics_payload = [
            {
                "feature_name": m.feature_name,
                "statistical_method": m.statistical_method,
                "score": m.score,
                "p_value": m.p_value,
                "is_drifted": m.is_drifted,
                "severity": m.severity,
                "drift_type": m.drift_type,
            }
            for m in (analysis.metrics or [])
        ]
        severity_info = classify_system_drift(metrics_payload)
        items.append(
            InsightListItem(
                analysis_id=analysis.id,
                status=analysis.status,
                created_at=analysis.created_at,
                drift_severity=severity_info.get("overall_severity", "none"),
                insight_available=analysis.ai_insight is not None,
                generated_at=analysis.ai_insight.created_at if analysis.ai_insight else None,
            )
        )

    return items


@router.post("/{analysis_id}/generate", response_model=InsightDetail)
def generate_insight(
    analysis_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    try:
        DriftService.generate_insight_only(db, analysis_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    analysis = DriftService.get_analysis_details(db, analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Drift analysis not found.")
    return _build_detail(analysis)
