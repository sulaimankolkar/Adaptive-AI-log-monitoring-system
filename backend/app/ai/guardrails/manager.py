from typing import Dict, Any, List
from app.ai.guardrails.input_moderator import check_input_safety
from app.ai.guardrails.output_verifier import verify_output_conformity

class GuardrailManager:
    """
    Orchestrates execution of inputs and outputs through verification pipelines.
    """
    
    @staticmethod
    def validate_input(rendered_prompt: str) -> Dict[str, Any]:
        """
        Runs input-level checks.
        """
        return check_input_safety(rendered_prompt)
        
    @staticmethod
    def validate_output(raw_response: str, expected_metrics: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Runs output-level schema and factuality checks.
        """
        return verify_output_conformity(raw_response, expected_metrics)
