import React, { useState } from 'react';
import { Paper, Tabs, Tab, Box, Typography, TextField } from '@mui/material';
import type { PromptExecution } from '../../types';

interface TesterProps {
  execution: PromptExecution;
}

export const PromptTester: React.FC<TesterProps> = ({ execution }) => {
  const [tabVal, setTabVal] = useState(0);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Prompt Execution Logs
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabVal} onChange={(_, nv) => setTabVal(nv)}>
          <Tab label="Rendered Prompt (Input)" />
          <Tab label="LLM Response (Output)" />
        </Tabs>
      </Box>

      {tabVal === 0 && (
        <TextField
          value={execution.rendered_prompt}
          multiline
          rows={12}
          fullWidth
          disabled
          sx={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#94a3b8' }}
        />
      )}

      {tabVal === 1 && (
        <TextField
          value={execution.response_text || 'No response returned.'}
          multiline
          rows={12}
          fullWidth
          disabled
          sx={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#4ade80' }}
        />
      )}
      
      <Box sx={{ mt: 2, display: 'flex', gap: 3 }}>
        <Typography variant="caption" color="text.secondary">
          <b>Tokens Used:</b> {execution.tokens_used || 'N/A'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          <b>Latency:</b> {execution.execution_time_seconds !== undefined ? `${execution.execution_time_seconds.toFixed(2)}s` : 'N/A'}
        </Typography>
      </Box>
    </Paper>
  );
};
export default PromptTester;
