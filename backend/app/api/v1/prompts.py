from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.models.prompt import PromptTemplate, PromptExecution
from app.schemas.prompt import PromptTemplate as PromptTemplateSchema, PromptTemplateCreate, PromptExecution as PromptExecutionSchema

router = APIRouter()

@router.get("/", response_model=List[PromptTemplateSchema])
def get_templates(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    return db.query(PromptTemplate).all()

@router.post("/", response_model=PromptTemplateSchema)
def create_template(
    template_in: PromptTemplateCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    # Verify uniqueness
    existing = db.query(PromptTemplate).filter(PromptTemplate.name == template_in.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="A template with this name already exists.")

    db_template = PromptTemplate(
        name=template_in.name,
        system_prompt=template_in.system_prompt,
        template_body=template_in.template_body,
        variables=template_in.variables,
        created_by=current_user.id
    )
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

@router.put("/{template_id}", response_model=PromptTemplateSchema)
def update_template(
    template_id: str,
    template_in: PromptTemplateCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    template = db.query(PromptTemplate).filter(PromptTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Prompt Template not found.")

    template.name = template_in.name
    template.system_prompt = template_in.system_prompt
    template.template_body = template_in.template_body
    template.variables = template_in.variables
    db.commit()
    db.refresh(template)
    return template

@router.get("/{template_id}/executions", response_model=List[PromptExecutionSchema])
def get_template_executions(
    template_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    template = db.query(PromptTemplate).filter(PromptTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Prompt Template not found.")

    return (
        db.query(PromptExecution)
        .filter(PromptExecution.prompt_template_id == template_id)
        .order_by(PromptExecution.executed_at.desc())
        .all()
    )
