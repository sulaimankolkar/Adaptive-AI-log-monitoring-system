import os
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from app.models.drift import DriftAnalysis
from app.models.report import Report

STORAGE_DIR = "storage"

class ReportService:
    @staticmethod
    def generate_pdf_report(db: Session, analysis_id: str, creator_id: str) -> Report:
        analysis = db.query(DriftAnalysis).filter(DriftAnalysis.id == analysis_id).first()
        if not analysis or analysis.status != "completed":
            raise ValueError("Analysis not found or not completed.")

        # Ensure directory exists
        if not os.path.exists(STORAGE_DIR):
            os.makedirs(STORAGE_DIR)

        filename = f"report_{analysis_id}.pdf"
        file_path = os.path.join(STORAGE_DIR, filename)

        # Initialize PDF Document
        doc = SimpleDocTemplate(
            file_path,
            pagesize=letter,
            rightMargin=54, leftMargin=54,
            topMargin=54, bottomMargin=54
        )

        styles = getSampleStyleSheet()
        
        # Define Custom Styles
        title_style = ParagraphStyle(
            name="TitleStyle",
            parent=styles["Heading1"],
            fontSize=24,
            leading=28,
            textColor=colors.HexColor("#1A365D"),
            spaceAfter=15
        )
        
        subtitle_style = ParagraphStyle(
            name="SubtitleStyle",
            parent=styles["Heading2"],
            fontSize=16,
            leading=20,
            textColor=colors.HexColor("#2B6CB0"),
            spaceBefore=12,
            spaceAfter=8
        )
        
        body_style = ParagraphStyle(
            name="BodyStyle",
            parent=styles["BodyText"],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#2D3748")
        )

        table_header_style = ParagraphStyle(
            name="TableHeaderStyle",
            parent=styles["Normal"],
            fontSize=9,
            leading=12,
            textColor=colors.white,
            fontName="Helvetica-Bold"
        )
        
        table_body_style = ParagraphStyle(
            name="TableBodyStyle",
            parent=styles["Normal"],
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#2D3748")
        )

        story = []

        # --- TITLE SECTION ---
        story.append(Paragraph("Adaptive AI Monitoring Platform", title_style))
        story.append(Paragraph(f"Drift Analysis Report — Job ID: {analysis_id}", subtitle_style))
        story.append(Spacer(1, 15))
        
        # Meta info
        ref_ver = f"v{analysis.reference_version.version_num} (ID: {analysis.reference_version_id[:8]})"
        tar_ver = f"v{analysis.target_version.version_num} (ID: {analysis.target_version_id[:8]})"
        meta_text = (
            f"<b>Reference Dataset:</b> {ref_ver}<br/>"
            f"<b>Target Dataset:</b> {tar_ver}<br/>"
            f"<b>Date Run:</b> {analysis.created_at.strftime('%Y-%m-%d %H:%M:%S')}<br/>"
            f"<b>Status:</b> {analysis.status.upper()}<br/>"
        )
        story.append(Paragraph(meta_text, body_style))
        story.append(Spacer(1, 20))

        # --- EXECUTIVE SUMMARY (AI INSIGHTS) ---
        story.append(Paragraph("AI-Generated Analysis Summary", subtitle_style))
        if analysis.ai_insight:
            story.append(Paragraph(analysis.ai_insight.summary, body_style))
            story.append(Spacer(1, 10))
            
            story.append(Paragraph("<b>Key Findings:</b>", body_style))
            findings = analysis.ai_insight.key_findings_json or []
            for f in findings:
                story.append(Paragraph(f"• {f}", body_style))
            story.append(Spacer(1, 10))

            story.append(Paragraph("<b>Actionable Recommendations:</b>", body_style))
            recs = analysis.ai_insight.recommendations_json or []
            for r in recs:
                story.append(Paragraph(f"• {r}", body_style))
        else:
            story.append(Paragraph("No AI insights generated for this analysis.", body_style))
        
        story.append(Spacer(1, 25))
        story.append(PageBreak())  # Next Page for tabular data

        # --- DETAILED METRICS TABLE ---
        story.append(Paragraph("Feature Drift Details", subtitle_style))
        story.append(Spacer(1, 10))

        # Table Headers
        table_data = [[
            Paragraph("Feature Name", table_header_style),
            Paragraph("Statistical Method", table_header_style),
            Paragraph("PSI Score", table_header_style),
            Paragraph("p-value", table_header_style),
            Paragraph("Drift Status", table_header_style),
            Paragraph("Severity", table_header_style)
        ]]

        # Table Rows
        for m in analysis.metrics:
            p_val = f"{m.p_value:.4f}" if m.p_value is not None else "N/A"
            status_text = "DRIFTED" if m.is_drifted else "Stable"
            
            table_data.append([
                Paragraph(m.feature_name, table_body_style),
                Paragraph(m.statistical_method, table_body_style),
                Paragraph(f"{m.score:.4f}", table_body_style),
                Paragraph(p_val, table_body_style),
                Paragraph(status_text, table_body_style),
                Paragraph(m.severity.upper(), table_body_style)
            ])

        # Style Table
        metric_table = Table(table_data, colWidths=[100, 120, 70, 70, 70, 70])
        metric_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1A365D")),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E0")),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F7FAFC")]),
            ('BOTTOMPADDING', (0,0), (-1,0), 6),
            ('TOPPADDING', (0,0), (-1,0), 6),
        ]))
        
        story.append(metric_table)
        story.append(Spacer(1, 20))

        # --- GUARDRAIL SUMMARY ---
        story.append(Paragraph("AI Safety & Factuality Guardrails Log", subtitle_style))
        story.append(Spacer(1, 8))
        
        guardrail_data = []
        for exec_log in analysis.prompt_executions:
            for g_res in exec_log.guardrail_results:
                guardrail_data.append(
                    f"<b>Check:</b> {g_res.check_name} | <b>Status:</b> {g_res.status.upper()} "
                    f"| <b>Score:</b> {g_res.score:.2f}<br/><b>Audit Feedback:</b> {g_res.feedback}<br/>"
                )

        if guardrail_data:
            for gd in guardrail_data:
                story.append(Paragraph(gd, body_style))
                story.append(Spacer(1, 5))
        else:
            story.append(Paragraph("No guardrail evaluations logged for this session.", body_style))

        # Build Document
        doc.build(story)

        # Save Report metadata to Database
        db_report = Report(
            drift_analysis_id=analysis_id,
            format="pdf",
            file_path=file_path,
            created_by=creator_id
        )
        db.add(db_report)
        db.commit()
        db.refresh(db_report)

        return db_report
