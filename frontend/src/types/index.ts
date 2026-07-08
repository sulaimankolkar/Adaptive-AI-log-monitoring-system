export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  role_id?: string;
  created_at: string;
  role?: Role;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface DataQualityReport {
  id: string;
  dataset_version_id: string;
  missing_values_json: Record<string, number>;
  data_types_json: Record<string, string>;
  summary_stats_json: Record<string, any>;
  created_at: string;
}

export interface DatasetVersion {
  id: string;
  dataset_id: string;
  version_num: number;
  file_path: string;
  row_count?: number;
  col_count?: number;
  uploaded_at: string;
  quality_report?: DataQualityReport;
}

export interface Dataset {
  id: string;
  name: string;
  description?: string;
  created_by?: string;
  created_at: string;
  versions: DatasetVersion[];
}

export interface DriftMetrics {
  id: string;
  drift_analysis_id: string;
  feature_name: string;
  statistical_method: string;
  score: number;
  p_value?: number;
  is_drifted: boolean;
  severity: 'none' | 'minor' | 'moderate' | 'major';
  drift_type: 'numerical' | 'categorical';
}

export interface GuardrailResult {
  id: string;
  prompt_execution_id: string;
  check_name: string;
  status: 'pass' | 'fail';
  score?: number;
  feedback?: string;
  verified_at: string;
}

export interface PromptExecution {
  id: string;
  prompt_template_id: string;
  drift_analysis_id: string;
  rendered_prompt: string;
  response_text?: string;
  tokens_used?: number;
  execution_time_seconds?: number;
  executed_at: string;
  guardrail_results: GuardrailResult[];
}

export interface PromptTemplate {
  id: string;
  name: string;
  system_prompt?: string;
  template_body: string;
  variables?: string[];
  created_by?: string;
  updated_at: string;
}

export interface AIInsight {
  id: string;
  drift_analysis_id: string;
  prompt_execution_id: string;
  summary: string;
  key_findings_json?: string[];
  recommendations_json?: string[];
  created_at: string;
}

export interface DriftAnalysis {
  id: string;
  reference_version_id: string;
  target_version_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_by?: string;
  created_at: string;
  metrics: DriftMetrics[];
  prompt_executions: PromptExecution[];
  ai_insight?: AIInsight;
  reports?: Report[];
}

export interface Report {
  id: string;
  drift_analysis_id: string;
  format: string;
  file_path: string;
  created_by?: string;
  created_at: string;
}

export interface InsightGuardrailValidationResult {
  check_name: string;
  status: 'pass' | 'fail' | string;
  score?: number;
  feedback?: string;
}

export interface InsightDetail {
  analysis_id: string;
  insight_available: boolean;
  drift_severity: 'none' | 'minor' | 'moderate' | 'major' | string;
  executive_summary?: string;
  technical_analysis: string[];
  business_impact?: string;
  recommendations: string[];
  prompt_used?: string;
  guardrail_validation_result?: InsightGuardrailValidationResult;
  generation_time?: number;
  model_used?: string;
  generated_at?: string;
}

export interface InsightListItem {
  analysis_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | string;
  created_at: string;
  drift_severity: 'none' | 'minor' | 'moderate' | 'major' | string;
  insight_available: boolean;
  generated_at?: string;
}
