from typing import Dict, Any, List

def format_drift_metrics_for_prompt(metrics: List[Dict[str, Any]]) -> str:
    """
    Format statistical drift metrics into a clean text representation for LLM prompts.
    """
    lines = ["Feature Name | Method | PSI/Chi-Sq Score | P-Value | Is Drifted | Severity",
             "---|---|---|---|---|---"]
    for m in metrics:
        p_val_str = f"{m['p_value']:.4f}" if m['p_value'] is not None else "N/A"
        lines.append(
            f"{m['feature_name']} | {m['statistical_method']} | {m['score']:.4f} | {p_val_str} | {m['is_drifted']} | {m['severity'].upper()}"
        )
    return "\n".join(lines)

def adapt_prompt(template_body: str, variables: Dict[str, Any]) -> str:
    """
    Dynamically render system or user prompts using the provided stats variables.
    """
    # Safe substitution in case of missing variables or extra brackets in prompts
    rendered = template_body
    for key, val in variables.items():
        placeholder = "{" + key + "}"
        rendered = rendered.replace(placeholder, str(val))
    return rendered
