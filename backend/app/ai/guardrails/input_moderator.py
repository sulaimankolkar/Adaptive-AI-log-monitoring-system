import re
from typing import Dict, Any

def check_input_safety(rendered_prompt: str) -> Dict[str, Any]:
    """
    Scans input prompt for basic prompt injection signatures or malicious content.
    """
    # Simple heuristic checks for prompt injection or system commands
    injection_patterns = [
        r"(?i)ignore previous instructions",
        r"(?i)system prompt",
        r"(?i)bypass rules",
        r"(?i)sql injection",
        r"<\s*script\s*>"
    ]
    
    flagged = []
    for pattern in injection_patterns:
        if re.search(pattern, rendered_prompt):
            flagged.append(pattern)
            
    if flagged:
        return {
            "status": "fail",
            "score": 0.0,
            "feedback": f"Input flagged for suspicious patterns: {', '.join(flagged)}"
        }
        
    return {
        "status": "pass",
        "score": 1.0,
        "feedback": "Input safety guardrail passed."
    }
