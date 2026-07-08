import json
import re
from typing import Dict, Any, List

def verify_output_conformity(raw_response: str, expected_metrics: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Validates output formatting (JSON schema) and verifies statistical factuality.
    Checks if features mentioned in LLM text actually exist in computed metrics.
    """
    feedback_msgs = []
    status = "pass"
    score = 1.0

    # 1. Check JSON Schema Conformity
    try:
        data = json.loads(raw_response)
        if not isinstance(data, dict):
            return {"status": "fail", "score": 0.0, "feedback": "Response is not a valid JSON object."}

        summary_text = data.get("executive_summary") or data.get("summary")
        technical_analysis = data.get("technical_analysis") or data.get("key_findings")
        business_impact = data.get("business_impact")
        recommendations = data.get("recommendations")

        if not summary_text:
            return {"status": "fail", "score": 0.2, "feedback": "Missing summary section in JSON response."}
        if technical_analysis is None:
            return {"status": "fail", "score": 0.2, "feedback": "Missing technical analysis section in JSON response."}
        if business_impact is None:
            return {"status": "fail", "score": 0.2, "feedback": "Missing business impact section in JSON response."}
        if recommendations is None:
            return {"status": "fail", "score": 0.2, "feedback": "Missing recommendations section in JSON response."}

        if not isinstance(technical_analysis, list) or not isinstance(recommendations, list):
            return {"status": "fail", "score": 0.3, "feedback": "Findings and recommendations must be arrays."}
            
    except json.JSONDecodeError as e:
        return {
            "status": "fail",
            "score": 0.0,
            "feedback": f"Failed to parse LLM output as JSON: {str(e)}"
        }

    # 2. Factuality and Hallucination Checks (Feature Names Validation)
    known_features = {m["feature_name"] for m in expected_metrics}
    
    # Extract uppercase alphanumeric codes (e.g. V1, V2, Amount) mentioned in text
    all_text = f"{summary_text} {' '.join(technical_analysis)} {business_impact}"
    mentioned_features = re.findall(r'\b[A-Za-z0-9_]+\b', all_text)
    
    hallucinated_features = []
    for feat in mentioned_features:
        # If it looks like credit card features e.g. V1, V2... or Amount, and not in known
        if (feat.startswith("V") and feat[1:].isdigit()) or feat.lower() == "amount":
            if feat not in known_features:
                hallucinated_features.append(feat)
                
    if hallucinated_features:
        status = "fail"
        score -= 0.4
        feedback_msgs.append(f"Output mentions hallucinated features not present in dataset: {list(set(hallucinated_features))}")

    # 3. Numeric factuality (optional - check if drift percentage mentioned matches)
    # Let's count how many drifted features exist
    actual_drifted = sum(1 for m in expected_metrics if m["is_drifted"])
    actual_pct = (actual_drifted / len(expected_metrics)) * 100 if expected_metrics else 0
    
    # Search for numbers followed by '%' in text and see if they deviate significantly
    pct_mentions = re.findall(r'(\d+(?:\.\d+)?)\s*%', all_text)
    for pct in pct_mentions:
        val = float(pct)
        if 20.0 < val < 80.0 and abs(val - actual_pct) > 25.0:
            # Let's not fail outright but lower score and add a note
            score -= 0.1
            feedback_msgs.append(f"Mentioned drift percentage ({val}%) differs from computed percentage ({actual_pct:.2f}%)")

    if not feedback_msgs:
        feedback_msgs.append("All output schema and statistical checks passed.")
        
    return {
        "status": status,
        "score": max(round(score, 2), 0.0),
        "feedback": " | ".join(feedback_msgs)
    }
