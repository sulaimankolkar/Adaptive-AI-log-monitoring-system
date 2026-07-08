import os
import json
import httpx
from typing import Dict, Any, List
from app.core.config import settings

def generate_insights_mock(ref_version: str, target_version: str, metrics: List[Dict[str, Any]]) -> str:
    """
    Fallback mock generator that creates realistic, factually accurate summary JSON
    based on the computed drift metrics.
    """
    drifted_features = [m["feature_name"] for m in metrics if m["is_drifted"]]
    major_drifted = [m["feature_name"] for m in metrics if m["severity"] == "major"]
    
    summary = (
        f"A comparison between Reference Version ({ref_version}) and Target Version ({target_version}) "
        f"revealed that {len(drifted_features)} features show statistically significant drift. "
    )
    if major_drifted:
        summary += f"Particularly, critical features like {', '.join(major_drifted)} exhibit major drift severity, indicating a potential decrease in model performance."
    else:
        summary += "The overall dataset distribution remains relatively stable, with only minor shifts detected."

    findings = []
    for m in metrics:
        if m["is_drifted"]:
            findings.append(
                f"Feature '{m['feature_name']}' exhibits {m['severity']} data drift (PSI/Chi-Sq Score: {m['score']:.4f}, p-value: {m['p_value']:.4f})."
            )
            
    if not findings:
        findings.append("No features exhibit statistically significant drift (all p-values >= 0.05).")
        
    recommendations = []
    if major_drifted:
        recommendations.append(f"Retrain the model using target version dataset to adjust for shifts in {', '.join(major_drifted)}.")
        recommendations.append("Investigate upstream data collection pipelines to verify if data schema or collection mechanisms changed.")
    elif drifted_features:
        recommendations.append("Continue to monitor model performance metrics (precision, recall, ROC-AUC) closely.")
        recommendations.append("Prepare for a scheduled retraining iteration using the target dataset.")
    else:
        recommendations.append("No retraining required. The current model is aligned with the target data distribution.")

    business_impact = (
        "The detected distribution shift may reduce model precision/recall stability in production if left untreated. "
        "Risk increases when major-severity features are drifted."
        if major_drifted or drifted_features
        else "Business impact is currently low because no statistically significant drift was detected."
    )

    output_data = {
        "executive_summary": summary,
        "technical_analysis": findings[:8],
        "business_impact": business_impact,
        "recommendations": recommendations,
        "model_used": "mock",
    }
    
    return json.dumps(output_data)

def generate_insights(system_prompt: str, rendered_prompt: str, ref_version: str, target_version: str, metrics: List[Dict[str, Any]]) -> str:
    """
    Interfaces with OpenAI ChatCompletion endpoint to generate insights.
    Falls back to mock data if key is missing or invalid.
    """
    api_key = settings.OPENAI_API_KEY
    if not api_key or api_key == "mock-key" or os.environ.get("OPENAI_API_KEY") is None:
        return generate_insights_mock(ref_version, target_version, metrics)
        
    try:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        payload = {
            "model": "gpt-4o-mini",  # cost-efficient, fast
            "messages": [
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": (
                        f"{rendered_prompt}\n\n"
                        "Return ONLY valid JSON with keys: executive_summary (string), technical_analysis (array of strings), "
                        "business_impact (string), recommendations (array of strings)."
                    ),
                }
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        }
        
        # Use simple HTTP client call
        response = httpx.post(url, headers=headers, json=payload, timeout=30.0)
        response.raise_for_status()
        res_data = response.json()
        raw_content = res_data["choices"][0]["message"]["content"]
        parsed = json.loads(raw_content)

        normalized = {
            "executive_summary": parsed.get("executive_summary") or parsed.get("summary", ""),
            "technical_analysis": parsed.get("technical_analysis") or parsed.get("key_findings", []),
            "business_impact": parsed.get("business_impact", ""),
            "recommendations": parsed.get("recommendations", []),
            "model_used": "gpt-4o-mini",
        }

        if not isinstance(normalized["technical_analysis"], list):
            normalized["technical_analysis"] = [str(normalized["technical_analysis"])]
        if not isinstance(normalized["recommendations"], list):
            normalized["recommendations"] = [str(normalized["recommendations"])]

        return json.dumps(normalized)
    except Exception as e:
        # Fallback in case of network or auth error
        print(f"OpenAI API call failed: {str(e)}. Falling back to local mock generator.")
        return generate_insights_mock(ref_version, target_version, metrics)
