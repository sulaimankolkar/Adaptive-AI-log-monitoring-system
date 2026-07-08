import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from '@mui/material';
import { AutoAwesome, Refresh } from '@mui/icons-material';
import Layout from '../components/common/Layout';
import Loading from '../components/common/Loading';
import useFetch from '../hooks/useFetch';
import type { InsightDetail, InsightListItem } from '../types';

export const AIInsights: React.FC = () => {
  const {
    data: insightList,
    loading: loadingList,
    error: listError,
    request: fetchInsightList,
  } = useFetch<InsightListItem[]>();

  const {
    data: insightDetail,
    loading: loadingDetail,
    error: detailError,
    request: fetchInsightDetail,
  } = useFetch<InsightDetail>();

  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadList = async () => {
    await fetchInsightList('/insights');
  };

  useEffect(() => {
    loadList();
  }, [fetchInsightList]);

  useEffect(() => {
    if (!selectedAnalysisId && insightList && insightList.length > 0) {
      const preferred = insightList.find((x) => x.insight_available) || insightList[0];
      setSelectedAnalysisId(preferred.analysis_id);
    }
  }, [insightList, selectedAnalysisId]);

  useEffect(() => {
    if (selectedAnalysisId) {
      fetchInsightDetail(`/insights/${selectedAnalysisId}`);
    }
  }, [selectedAnalysisId, fetchInsightDetail]);

  const selectedItem = useMemo(
    () => insightList?.find((x) => x.analysis_id === selectedAnalysisId),
    [insightList, selectedAnalysisId]
  );

  const canGenerate =
    !!selectedItem && selectedItem.status === 'completed' && !insightDetail?.insight_available;

  const generateInsights = async () => {
    if (!selectedAnalysisId) return;
    setGenerating(true);
    setActionError(null);
    try {
      await fetchInsightDetail(`/insights/${selectedAnalysisId}/generate`, 'POST');
      await loadList();
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to generate insights.';
      setActionError(msg);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Layout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            AI Insights
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Generated intelligence from drift analysis using prompt templates and guardrails
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadList}
          disabled={loadingList}
        >
          Refresh
        </Button>
      </Box>

      {listError && <Alert severity="error" sx={{ mb: 2 }}>{listError}</Alert>}
      {detailError && <Alert severity="error" sx={{ mb: 2 }}>{detailError}</Alert>}
      {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}

      {loadingList ? (
        <Loading message="Loading insights index..." />
      ) : (
        <Paper sx={{ p: 3, mb: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Drift Analysis</InputLabel>
            <Select
              value={selectedAnalysisId}
              label="Drift Analysis"
              onChange={(e) => setSelectedAnalysisId(e.target.value)}
            >
              {(insightList || []).map((item) => (
                <MenuItem key={item.analysis_id} value={item.analysis_id}>
                  {item.analysis_id.substring(0, 8)} - {item.status.toUpperCase()} - Severity: {item.drift_severity.toUpperCase()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>
      )}

      {!selectedAnalysisId ? null : loadingDetail ? (
        <Loading message="Loading insight details..." />
      ) : !insightDetail ? (
        <Paper sx={{ p: 3 }}>
          <Typography color="text.secondary">No insight details available.</Typography>
        </Paper>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={600}>Insight Metadata</Typography>
              <Box display="flex" gap={1}>
                <Chip label={`Severity: ${insightDetail.drift_severity.toUpperCase()}`} color="warning" variant="outlined" />
                <Chip label={`Model: ${(insightDetail.model_used || 'N/A').toUpperCase()}`} color="primary" variant="outlined" />
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Generation Time: {insightDetail.generation_time !== undefined ? `${insightDetail.generation_time.toFixed(2)}s` : 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Guardrail: {insightDetail.guardrail_validation_result ? `${insightDetail.guardrail_validation_result.status.toUpperCase()} (${insightDetail.guardrail_validation_result.score ?? 'N/A'})` : 'N/A'}
            </Typography>
            {canGenerate && (
              <Box mt={2}>
                <Button
                  variant="contained"
                  startIcon={<AutoAwesome />}
                  onClick={generateInsights}
                  disabled={generating}
                >
                  {generating ? 'Generating...' : 'Generate Insights'}
                </Button>
              </Box>
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={1}>Executive Summary</Typography>
            <Typography variant="body2" color="text.secondary">
              {insightDetail.executive_summary || 'Not available.'}
            </Typography>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={1}>Technical Analysis</Typography>
            {(insightDetail.technical_analysis || []).length === 0 ? (
              <Typography variant="body2" color="text.secondary">Not available.</Typography>
            ) : (
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {insightDetail.technical_analysis.map((item, idx) => (
                  <Box component="li" key={idx} sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">{item}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={1}>Business Impact</Typography>
            <Typography variant="body2" color="text.secondary">
              {insightDetail.business_impact || 'Not available.'}
            </Typography>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={1}>Recommendations</Typography>
            {(insightDetail.recommendations || []).length === 0 ? (
              <Typography variant="body2" color="text.secondary">Not available.</Typography>
            ) : (
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {insightDetail.recommendations.map((item, idx) => (
                  <Box component="li" key={idx} sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">{item}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={1}>Prompt Used</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
              {insightDetail.prompt_used || 'Not available.'}
            </Typography>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={1}>Guardrail Validation Result</Typography>
            {insightDetail.guardrail_validation_result ? (
              <>
                <Typography variant="body2" color="text.secondary">
                  Check: {insightDetail.guardrail_validation_result.check_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {insightDetail.guardrail_validation_result.status.toUpperCase()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Score: {insightDetail.guardrail_validation_result.score ?? 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Feedback: {insightDetail.guardrail_validation_result.feedback || 'N/A'}
                </Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">Not available.</Typography>
            )}
          </Paper>
        </Box>
      )}
    </Layout>
  );
};

export default AIInsights;
