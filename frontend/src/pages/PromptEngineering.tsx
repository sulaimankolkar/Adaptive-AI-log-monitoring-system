import React, { useEffect, useState } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material';
import Layout from '../components/common/Layout';
import LoadingState from '../components/LoadingState';
import SectionCard from '../components/SectionCard';
import PageHeader from '../components/PageHeader';
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
      <PageHeader
        title="Adaptive Prompt Control"
        subtitle="Customize templates that dynamically format data stats into structured LLM prompts"
      />

      {errorTemplates && <Alert severity="error" sx={{ mb: 3 }}>{errorTemplates}</Alert>}
      {errorExecutions && <Alert severity="warning" sx={{ mb: 3 }}>{errorExecutions}</Alert>}

      {loadingTemplates ? (
        <LoadingState message="Fetching templates..." />
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { md: '7fr 5fr' }, gap: 3 }}>
          <Box>
            <SectionCard title="Select Template">
              <FormControl fullWidth size="small">
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
            </SectionCard>

            {selectedTemplate && (
              <TemplateForm template={selectedTemplate} onUpdate={loadAll} />
            )}
          </Box>

          <Box>
            <SectionCard title="Variables Injector Sandbox">
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
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
            </SectionCard>

            <SectionCard title="Validation Guardrails Bound">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Our AI safety middleware automatically scans prompts for prompt injections before querying LLMs, and verifies response JSON schemas and metric factuality matches backend database calculations.
              </Typography>
            </SectionCard>

            <Box sx={{ mt: 3 }}>
              {loadingExecutions ? (
                <LoadingState message="Fetching prompt execution history..." />
              ) : latestExecution ? (
                <PromptTester execution={latestExecution} />
              ) : (
                <SectionCard title="Prompt Execution Logs">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    No execution logs found for this template yet. Run a drift analysis job to generate prompt and AI output traces.
                  </Typography>
                </SectionCard>
              )}
            </Box>
          </Box>
        </Box>
      )}
    </Layout>
  );
};
export default PromptEngineering;
