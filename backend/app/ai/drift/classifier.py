from typing import List, Dict, Any

def classify_system_drift(feature_metrics: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Given a list of feature drift metrics, determine the system-level drift status and severity.
    """
    total_features = len(feature_metrics)
    if total_features == 0:
        return {
            "overall_status": "stable",
            "overall_severity": "none",
            "drifted_count": 0,
            "drift_percentage": 0.0
        }
        
    drifted_count = sum(1 for m in feature_metrics if m["is_drifted"])
    drift_percentage = (drifted_count / total_features) * 100.0
    
    # Severity breakdown
    severity_counts = {"none": 0, "minor": 0, "moderate": 0, "major": 0}
    for m in feature_metrics:
        sev = m.get("severity", "none").lower()
        if sev in severity_counts:
            severity_counts[sev] += 1
            
    # System severity logic:
    # - stable: 0% drifted
    # - minor: < 20% drifted or mostly minor severity
    # - moderate: 20-50% drifted or some moderate severity
    # - critical: > 50% drifted or any major severity
    if severity_counts["major"] > 0 or drift_percentage >= 50.0:
        overall_status = "critical"
        overall_severity = "major"
    elif severity_counts["moderate"] > 0 or drift_percentage >= 20.0:
        overall_status = "warning"
        overall_severity = "moderate"
    elif drifted_count > 0:
        overall_status = "warning"
        overall_severity = "minor"
    else:
        overall_status = "stable"
        overall_severity = "none"
        
    return {
        "overall_status": overall_status,
        "overall_severity": overall_severity,
        "drifted_count": drifted_count,
        "drift_percentage": round(drift_percentage, 2),
        "severity_breakdown": severity_counts
    }
