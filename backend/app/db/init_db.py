from sqlalchemy.orm import Session
from app.core.database import Base, engine
from app.models.user import User, Role
from app.models.prompt import PromptTemplate
from app.core.security import get_password_hash

def init_db(db: Session) -> None:
    # Create all tables (useful for development with SQLite)
    Base.metadata.create_all(bind=engine)

    # 1. Create Roles
    admin_role = db.query(Role).filter(Role.name == "Administrator").first()
    if not admin_role:
        admin_role = Role(name="Administrator", description="System administrator with full permissions")
        db.add(admin_role)
        db.commit()
        db.refresh(admin_role)

    analyst_role = db.query(Role).filter(Role.name == "Analyst").first()
    if not analyst_role:
        analyst_role = Role(name="Analyst", description="Data analyst who performs drift analysis and views reports")
        db.add(analyst_role)
        db.commit()
        db.refresh(analyst_role)

    # 2. Create Admin User
    admin_user = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin_user:
        admin_user = User(
            email="admin@example.com",
            hashed_password=get_password_hash("adminpassword"),
            full_name="System Admin",
            role_id=admin_role.id,
            is_active=True
        )
        db.add(admin_user)
        db.commit()

    # 3. Create default Prompt Template
    template = db.query(PromptTemplate).filter(PromptTemplate.name == "Drift Analysis Summary").first()
    if not template:
        body = """
You are an expert AI Data Scientist and Machine Learning engineer. 
Analyze the following data drift metrics from our Credit Card Fraud Detection model:

Reference Dataset Version: {ref_version}
Target Dataset Version: {target_version}

Drift Metrics (Kolmogorov-Smirnov & Chi-Square tests):
{drift_metrics}

Please write an executive summary and explainable insights. Provide:
1. An overall assessment of whether the data drift is significant and how it might impact our model performance.
2. A list of the key drifted features (features with high drift scores or p-values below 0.05) and their severity.
3. Concrete recommendations for the data science team (e.g., retrain, investigate features, collect more labels).

Your response MUST be in JSON format matching the following structure:
{{
  "summary": "High-level summary of the findings...",
  "key_findings": [
    "Finding 1...",
    "Finding 2..."
  ],
  "recommendations": [
    "Recommendation 1...",
    "Recommendation 2..."
  ]
}}
"""
        template = PromptTemplate(
            name="Drift Analysis Summary",
            system_prompt="You are an expert AI Data Scientist. Your outputs must be valid JSON.",
            template_body=body.strip(),
            variables=["ref_version", "target_version", "drift_metrics"]
        )
        db.add(template)
        db.commit()
