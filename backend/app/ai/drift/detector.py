import numpy as np
import pandas as pd
from scipy import stats
from typing import List, Dict, Any

def calculate_psi(ref_col: pd.Series, target_col: pd.Series, num_bins: int = 10) -> float:
    """
    Calculate the Population Stability Index (PSI) for two data vectors.
    """
    # Remove nulls
    ref_col = ref_col.dropna()
    target_col = target_col.dropna()
    
    if len(ref_col) == 0 or len(target_col) == 0:
        return 0.0

    try:
        # Determine bin boundaries using reference dataset quantiles
        percentiles = np.linspace(0, 100, num_bins + 1)
        bin_boundaries = np.percentile(ref_col, percentiles)
        # Ensure bin boundaries are unique
        bin_boundaries = np.unique(bin_boundaries)
        if len(bin_boundaries) < 2:
            # If values are constant, return 0
            return 0.0
            
        # Add epsilon to boundaries to include outer values
        bin_boundaries[0] -= 1e-5
        bin_boundaries[-1] += 1e-5
        
        # Calculate counts in each bin
        ref_counts, _ = np.histogram(ref_col, bins=bin_boundaries)
        target_counts, _ = np.histogram(target_col, bins=bin_boundaries)
        
        # Convert to percentages
        ref_pcts = ref_counts / len(ref_col)
        target_pcts = target_counts / len(target_col)
        
        # Handle zero divisions with a small epsilon
        ref_pcts = np.where(ref_pcts == 0, 1e-4, ref_pcts)
        target_pcts = np.where(target_pcts == 0, 1e-4, target_pcts)
        
        # Re-normalize to sum to 1
        ref_pcts /= sum(ref_pcts)
        target_pcts /= sum(target_pcts)
        
        # Calculate PSI
        psi_value = np.sum((target_pcts - ref_pcts) * np.log(target_pcts / ref_pcts))
        return float(psi_value)
    except Exception:
        return 0.0

def detect_drift(df_ref: pd.DataFrame, df_target: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Run data drift detection algorithms across all features.
    """
    metrics = []
    
    # Get columns present in both
    common_cols = [c for c in df_ref.columns if c in df_target.columns]
    
    for col in common_cols:
        # Determine variable type
        if pd.api.types.is_numeric_dtype(df_ref[col]):
            # 1. Kolmogorov-Smirnov Test
            ref_clean = df_ref[col].dropna()
            target_clean = df_target[col].dropna()
            
            if len(ref_clean) < 10 or len(target_clean) < 10:
                continue
                
            ks_result = stats.ks_2samp(ref_clean, target_clean)
            ks_stat = float(ks_result.statistic)
            p_val = float(ks_result.pvalue)
            
            # Calculate PSI
            psi_val = calculate_psi(df_ref[col], df_target[col])
            
            # Severity classification based on p-value and PSI
            # PSI standard rules: PSI < 0.1: No change, PSI < 0.25: Moderate change, PSI >= 0.25: Significant change
            is_drifted = p_val < 0.05
            
            if psi_val < 0.1:
                severity = "none"
            elif psi_val < 0.25:
                severity = "minor" if p_val >= 0.01 else "moderate"
            else:
                severity = "major"
                
            metrics.append({
                "feature_name": col,
                "statistical_method": "Kolmogorov-Smirnov & PSI",
                "score": psi_val, # We'll return PSI as the primary score, KS as extra info
                "p_value": p_val,
                "is_drifted": is_drifted,
                "severity": severity,
                "drift_type": "numerical"
            })
            
        else:
            # Categorical Drift detection (using Value Counts as bins for PSI)
            ref_vc = df_ref[col].value_counts(normalize=True).to_dict()
            target_vc = df_target[col].value_counts(normalize=True).to_dict()
            
            # Gather all unique categories
            all_categories = set(ref_vc.keys()).union(set(target_vc.keys()))
            if not all_categories:
                continue
                
            ref_pcts = []
            target_pcts = []
            for cat in all_categories:
                ref_pcts.append(ref_vc.get(cat, 1e-4))
                target_pcts.append(target_vc.get(cat, 1e-4))
                
            ref_pcts = np.array(ref_pcts)
            target_pcts = np.array(target_pcts)
            
            # Normalize
            ref_pcts /= sum(ref_pcts)
            target_pcts /= sum(target_pcts)
            
            # Calculate PSI
            psi_val = float(np.sum((target_pcts - ref_pcts) * np.log(target_pcts / ref_pcts)))
            
            # Chi-square test on frequency counts
            ref_counts = []
            target_counts = []
            ref_total = len(df_ref[col].dropna())
            target_total = len(df_target[col].dropna())
            
            for cat in all_categories:
                # Expected count in target if it matches reference distribution
                expected = ref_vc.get(cat, 1e-4) * target_total
                actual = df_target[col].dropna().eq(cat).sum()
                ref_counts.append(expected)
                target_counts.append(max(actual, 1e-4))
            
            try:
                chisq, p_val = stats.chisquare(f_obs=target_counts, f_exp=ref_counts)
                p_val = float(p_val)
            except Exception:
                p_val = 1.0 # fallback
                
            is_drifted = p_val < 0.05
            
            if psi_val < 0.1:
                severity = "none"
            elif psi_val < 0.25:
                severity = "minor" if p_val >= 0.01 else "moderate"
            else:
                severity = "major"
                
            metrics.append({
                "feature_name": col,
                "statistical_method": "Chi-Square & PSI",
                "score": psi_val,
                "p_value": p_val,
                "is_drifted": is_drifted,
                "severity": severity,
                "drift_type": "categorical"
            })
            
    return metrics
