import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { AutoAwesome, Refresh } from '@mui/icons-material';
import Layout from '../components/common/Layout';
import LoadingState from '../components/LoadingState';
import SectionCard from '../components/SectionCard';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
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
      <PageHeader
        title="AI Insights"
        subtitle="Generated intelligence from drift analysis using prompt templates and guardrails"
        action={
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadList}
            disabled={loadingList}
          >
            Refresh
          </Button>
        }
      />

      {listError && <Alert severity="error" sx={{ mb: 2 }}>{listError}</Alert>}
      {detailError && <Alert severity="error" sx={{ mb: 2 }}>{detailError}</Alert>}
      {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}

      {loadingList ? (
        <LoadingState message="Loading insights index..." />
      ) : (
        <SectionCard title="Select Drift Analysis">
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
        </SectionCard>
      )}

      {!selectedAnalysisId ? null : loadingDetail ? (
        <LoadingState message="Loading insight details..." />
      ) : !insightDetail ? (
        <EmptyState
          title="No Insight Details Available"
          description="Select a drift analysis to view AI-generated insights"
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <SectionCard title="Insight Metadata">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
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
              <Box sx={{ mt: 2 }}>
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
          </SectionCard>

          <SectionCard title="Executive Summary">
            <Typography variant="body2" color="text.secondary">
              {insightDetail.executive_summary || 'Not available.'}
            </Typography>
          </SectionCard>

          <SectionCard title="Technical Analysis">
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
          </SectionCard>

          <SectionCard title="Business Impact">
            <Typography variant="body2" color="text.secondary">
              {insightDetail.business_impact || 'Not available.'}
            </Typography>
          </SectionCard>

          <SectionCard title="Recommendations">
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
          </SectionCard>

          <SectionCard title="Prompt Used">
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
              {insightDetail.prompt_used || 'Not available.'}
            </Typography>
          </SectionCard>

          <SectionCard title="Guardrail Validation Result">
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
          </SectionCard>
        </Box>
      )}
    </Layout>
  );
};

export default AIInsights;
