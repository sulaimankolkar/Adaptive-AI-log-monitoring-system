import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem, Grid, Alert } from '@mui/material';
import Layout from '../components/common/Layout';
import Loading from '../components/common/Loading';
import TemplateForm from '../components/prompts/TemplateForm';
import PromptTester from '../components/prompts/PromptTester';
import useFetch from '../hooks/useFetch';
import type { PromptTemplate, PromptExecution } from '../types';

export const PromptEngineering: React.FC = () => {
  const { data: templates, loading: loadingTemplates, error: errorTemplates, request: fetchTemplates } = useFetch<PromptTemplate[]>();
  const {
    data: executions,
    loading: loadingExecutions,
    error: errorExecutions,
    request: fetchExecutions,
  } = useFetch<PromptExecution[]>();
  const [selectedId, setSelectedId] = useState<string>('');

  const loadAll = () => {
    fetchTemplates('/prompts/');
  };

  useEffect(() => {
    loadAll();
  }, [fetchTemplates]);

  // Set default selection
  useEffect(() => {
    if (templates && templates.length > 0 && !selectedId) {
      setSelectedId(templates[0].id);
    }
  }, [templates, selectedId]);

  const selectedTemplate = templates?.find((t) => t.id === selectedId);

  useEffect(() => {
    if (!selectedId) {
      return;
    }
    fetchExecutions(`/prompts/${selectedId}/executions`);
  }, [selectedId, fetchExecutions]);

  const latestExecution = executions && executions.length > 0 ? executions[0] : null;

  return (
    <Layout>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700}>
          Adaptive Prompt Control
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Customize templates that dynamically format data stats into structured LLM prompts
        </Typography>
      </Box>

      {errorTemplates && <Alert severity="error" sx={{ mb: 3 }}>{errorTemplates}</Alert>}
      {errorExecutions && <Alert severity="warning" sx={{ mb: 3 }}>{errorExecutions}</Alert>}

      {loadingTemplates ? (
        <Loading message="Fetching templates..." />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <FormControl fullWidth size="small" sx={{ mb: 3 }}>
              <InputLabel>Active Prompt Template</InputLabel>
              <Select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                label="Active Prompt Template"
              >
                {templates?.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedTemplate && (
              <TemplateForm template={selectedTemplate} onUpdate={loadAll} />
            )}
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} mb={1}>
                Variables Injector Sandbox
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                The following variables are calculated by the drift engine and substituted dynamically into prompt placeholders:
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    <code>{'{ref_version}'}</code>: Name and details of baseline version
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    <code>{'{target_version}'}</code>: Name and details of target version
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    <code>{'{drift_metrics}'}</code>: Formatted markdown table of calculated PSI, p-values, and severity
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} mb={1}>
                Validation Guardrails Bound
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Our AI safety middleware automatically scans prompts for prompt injections before querying LLMs, and verifies response JSON schemas and metric factuality matches backend database calculations.
              </Typography>
            </Paper>

            <Box sx={{ mt: 3 }}>
              {loadingExecutions ? (
                <Loading message="Fetching prompt execution history..." />
              ) : latestExecution ? (
                <PromptTester execution={latestExecution} />
              ) : (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} mb={1}>
                    Prompt Execution Logs
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No execution logs found for this template yet. Run a drift analysis job to generate prompt and AI output traces.
                  </Typography>
                </Paper>
              )}
            </Box>
          </Grid>
        </Grid>
      )}
    </Layout>
  );
};
export default PromptEngineering;
