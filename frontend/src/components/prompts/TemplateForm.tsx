import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Alert, Paper } from '@mui/material';
import { Save } from '@mui/icons-material';
import api from '../../services/api';
import type { PromptTemplate } from '../../types';

interface FormProps {
  template: PromptTemplate;
  onUpdate: () => void;
}

export const TemplateForm: React.FC<FormProps> = ({ template, onUpdate }) => {
  const [systemPrompt, setSystemPrompt] = useState(template.system_prompt || '');
  const [templateBody, setTemplateBody] = useState(template.template_body || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSystemPrompt(template.system_prompt || '');
    setTemplateBody(template.template_body || '');
    setSuccess(false);
    setError(null);
  }, [template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      await api.put(`/prompts/${template.id}`, {
        name: template.name,
        system_prompt: systemPrompt,
        template_body: templateBody,
        variables: template.variables || [],
      });
      setSuccess(true);
      onUpdate();
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to save changes.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h6" fontWeight={600}>
        Configure Prompt Template: {template.name}
      </Typography>

      {success && <Alert severity="success">Prompt template successfully updated!</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        label="System Instruction (Behavior Control)"
        value={systemPrompt}
        onChange={(e) => setSystemPrompt(e.target.value)}
        multiline
        rows={3}
        fullWidth
        helperText="Instructions governing LLM safety and formatting boundaries."
      />

      <TextField
        label="Prompt Structure body"
        value={templateBody}
        onChange={(e) => setTemplateBody(e.target.value)}
        multiline
        rows={12}
        fullWidth
        required
        helperText="Use placeholders {ref_version}, {target_version}, and {drift_metrics} to inject runtime drift stats."
        inputProps={{ style: { fontFamily: 'monospace', fontSize: '0.875rem' } }}
      />

      <Box display="flex" justifyContent="flex-end">
        <Button
          type="submit"
          variant="contained"
          color="primary"
          startIcon={<Save />}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Configuration'}
        </Button>
      </Box>
    </Paper>
  );
};
export default TemplateForm;
