import time
import json
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from app.models.drift import DriftAnalysis, DriftMetrics
from app.models.prompt import PromptTemplate, PromptExecution
from app.models.insight import AIInsight
from app.models.guardrail import GuardrailResult
from app.ai.drift.detector import detect_drift
from app.ai.drift.classifier import classify_system_drift
from app.ai.prompts.adapter import adapt_prompt, format_drift_metrics_for_prompt
from app.ai.guardrails.manager import GuardrailManager
from app.ai.insights.generator import generate_insights
from app.db.session import SessionLocal

class DriftService:
    @staticmethod
    def _serialize_metric(metric: DriftMetrics) -> dict:
        return {
            "feature_name": metric.feature_name,
            "statistical_method": metric.statistical_method,
            "score": metric.score,
            "p_value": metric.p_value,
            "is_drifted": metric.is_drifted,
            "severity": metric.severity,
            "drift_type": metric.drift_type,
        }

    @staticmethod
    def _run_ai_insight_generation(
        db: Session,
        analysis: DriftAnalysis,
        metrics_list: list,
    ) -> None:
        ref_ver = analysis.reference_version
        tar_ver = analysis.target_version

        template = db.query(PromptTemplate).filter(PromptTemplate.name == "Drift Analysis Summary").first()
        if not template:
            raise ValueError("Active Prompt Template 'Drift Analysis Summary' not found.")

        formatted_metrics = format_drift_metrics_for_prompt(metrics_list)
        variables = {
            "ref_version": f"v{ref_ver.version_num} ({ref_ver.row_count} rows)",
            "target_version": f"v{tar_ver.version_num} ({tar_ver.row_count} rows)",
            "drift_metrics": formatted_metrics,
        }
        rendered_prompt = adapt_prompt(template.template_body, variables)

        input_guardrail = GuardrailManager.validate_input(rendered_prompt)

        execution = PromptExecution(
            prompt_template_id=template.id,
            drift_analysis_id=analysis.id,
            rendered_prompt=rendered_prompt,
            executed_at=pd.Timestamp.now().to_pydatetime(),
        )
        db.add(execution)
        db.commit()
        db.refresh(execution)

        db.add(
            GuardrailResult(
                prompt_execution_id=execution.id,
                check_name="input_safety",
                status=input_guardrail["status"],
                score=input_guardrail["score"],
                feedback=input_guardrail["feedback"],
            )
        )
        db.commit()

        if input_guardrail["status"] == "fail":
            execution.response_text = json.dumps(
                {
                    "executive_summary": "Insight generation blocked by input guardrail.",
                    "technical_analysis": ["Prompt failed safety checks before LLM execution."],
                    "business_impact": "No AI insight generated due to safety validation failure.",
                    "recommendations": ["Revise template prompt content to pass guardrail checks."],
                    "model_used": "blocked",
                }
            )
            db.commit()
            return

        start_time = time.time()
        raw_response = generate_insights(
            system_prompt=template.system_prompt,
            rendered_prompt=rendered_prompt,
            ref_version=f"v{ref_ver.version_num}",
            target_version=f"v{tar_ver.version_num}",
            metrics=metrics_list,
        )
        execution_time = time.time() - start_time

        execution.response_text = raw_response
        execution.execution_time_seconds = execution_time
        execution.tokens_used = len(rendered_prompt.split()) + len(raw_response.split())
        db.commit()

        output_guardrail = GuardrailManager.validate_output(raw_response, metrics_list)
        db.add(
            GuardrailResult(
                prompt_execution_id=execution.id,
                check_name="output_conformity_and_factuality",
                status=output_guardrail["status"],
                score=output_guardrail["score"],
                feedback=output_guardrail["feedback"],
            )
        )
        db.commit()

        parsed_response = {}
        try:
            parsed_response = json.loads(raw_response)
        except Exception:
            parsed_response = {}

        executive_summary = parsed_response.get("executive_summary") or parsed_response.get("summary")
        technical_analysis = parsed_response.get("technical_analysis") or parsed_response.get("key_findings") or []
        business_impact = parsed_response.get("business_impact", "")
        recommendations = parsed_response.get("recommendations") or []

        if not isinstance(technical_analysis, list):
            technical_analysis = [str(technical_analysis)]
        if not isinstance(recommendations, list):
            recommendations = [str(recommendations)]

        if not executive_summary:
            executive_summary = "Analysis completed, but structured AI summary was unavailable."

        key_findings = list(technical_analysis)
        if business_impact:
            key_findings.insert(0, f"Business Impact: {business_impact}")

        existing_insight = db.query(AIInsight).filter(AIInsight.drift_analysis_id == analysis.id).first()
        if existing_insight:
            existing_insight.prompt_execution_id = execution.id
            existing_insight.summary = executive_summary
            existing_insight.key_findings_json = key_findings
            existing_insight.recommendations_json = recommendations
        else:
            db.add(
                AIInsight(
                    drift_analysis_id=analysis.id,
                    prompt_execution_id=execution.id,
                    summary=executive_summary,
                    key_findings_json=key_findings,
                    recommendations_json=recommendations,
                )
            )

        db.commit()

    @staticmethod
    def run_analysis_pipeline_task(analysis_id: str) -> None:
        """
        Background task entrypoint. Opens an independent DB session so request-scoped
        sessions are not reused after the request lifecycle ends.
        """
        db = SessionLocal()
        try:
            DriftService.run_analysis_pipeline(db, analysis_id)
        finally:
            db.close()

    @staticmethod
    def create_analysis(
        db: Session, 
        reference_version_id: str, 
        target_version_id: str, 
        creator_id: str
    ) -> DriftAnalysis:
        analysis = DriftAnalysis(
            reference_version_id=reference_version_id,
            target_version_id=target_version_id,
            status="pending",
            created_by=creator_id
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        return analysis

    @staticmethod
    def run_analysis_pipeline(db: Session, analysis_id: str) -> DriftAnalysis:
        analysis = db.query(DriftAnalysis).filter(DriftAnalysis.id == analysis_id).first()
        if not analysis:
            return None

        analysis.status = "running"
        db.commit()

        try:
            # 1. Fetch paths
            ref_ver = analysis.reference_version
            tar_ver = analysis.target_version

            # Load DataFrames
            df_ref = pd.read_csv(ref_ver.file_path)
            df_tar = pd.read_csv(tar_ver.file_path)

            # 2. Run statistical drift checks
            metrics_list = detect_drift(df_ref, df_tar)

            # 3. Save drift metrics
            db_metrics = []
            for m in metrics_list:
                metric = DriftMetrics(
                    drift_analysis_id=analysis_id,
                    feature_name=m["feature_name"],
                    statistical_method=m["statistical_method"],
                    score=m["score"],
                    p_value=m["p_value"],
                    is_drifted=m["is_drifted"],
                    severity=m["severity"],
                    drift_type=m["drift_type"]
                )
                db.add(metric)
                db_metrics.append(metric)
            db.commit()

            system_drift = classify_system_drift(metrics_list)

            # 4. Generate insights via prompt template + guardrail + LLM/mock fallback
            DriftService._run_ai_insight_generation(db, analysis, metrics_list)
            analysis.status = "completed"
            db.commit()

        except Exception as e:
            print(f"Exception during drift pipeline: {str(e)}")
            analysis.status = "failed"
            db.commit()

        return analysis

    @staticmethod
    def generate_insight_only(db: Session, analysis_id: str) -> AIInsight:
        analysis = (
            db.query(DriftAnalysis)
            .options(
                joinedload(DriftAnalysis.metrics),
                joinedload(DriftAnalysis.reference_version),
                joinedload(DriftAnalysis.target_version),
            )
            .filter(DriftAnalysis.id == analysis_id)
            .first()
        )
        if not analysis:
            raise ValueError("Drift analysis not found.")
        if analysis.status != "completed":
            raise ValueError("Insights can only be generated for completed analyses.")
        if not analysis.metrics:
            raise ValueError("No drift metrics found for this analysis.")

        metrics_list = [DriftService._serialize_metric(m) for m in analysis.metrics]
        DriftService._run_ai_insight_generation(db, analysis, metrics_list)

        return db.query(AIInsight).filter(AIInsight.drift_analysis_id == analysis_id).first()

    @staticmethod
    def get_analyses(db: Session):
        return (
            db.query(DriftAnalysis)
            .options(
                joinedload(DriftAnalysis.metrics),
                joinedload(DriftAnalysis.ai_insight),
                joinedload(DriftAnalysis.prompt_executions).joinedload(PromptExecution.guardrail_results),
                joinedload(DriftAnalysis.reports),
            )
            .order_by(DriftAnalysis.created_at.desc())
            .all()
        )

    @staticmethod
    def get_analysis_details(db: Session, analysis_id: str) -> DriftAnalysis:
        return (
            db.query(DriftAnalysis)
            .options(
                joinedload(DriftAnalysis.metrics),
                joinedload(DriftAnalysis.ai_insight),
                joinedload(DriftAnalysis.prompt_executions).joinedload(PromptExecution.guardrail_results),
                joinedload(DriftAnalysis.reports),
            )
            .filter(DriftAnalysis.id == analysis_id)
            .first()
        )
