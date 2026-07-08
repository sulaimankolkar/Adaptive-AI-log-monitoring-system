# Import all the models, so that Base has them before being
# imported by Alembic or used for creating tables.
from app.core.database import Base  # noqa
from app.models.user import User, Role  # noqa
from app.models.dataset import Dataset, DatasetVersion, DataQualityReport  # noqa
from app.models.drift import DriftAnalysis, DriftMetrics  # noqa
from app.models.prompt import PromptTemplate, PromptExecution  # noqa
from app.models.insight import AIInsight  # noqa
from app.models.guardrail import GuardrailResult  # noqa
from app.models.report import Report  # noqa
from app.models.system import SystemSetting, Notification, ActivityLog  # noqa
