import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, Typography } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import api from '../../services/api';

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ open, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a CSV file.');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      // 1. Create dataset metadata entry
      const dsRes = await api.post('/datasets/', {
        name,
        description,
      });

      const datasetId = dsRes.data.id;

      // 2. Upload file content to dataset version
      const formData = new FormData();
      formData.append('file', file);

      await api.post(`/datasets/${datasetId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onSuccess();
      onClose();
      // Reset fields
      setName('');
      setDescription('');
      setFile(null);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to upload dataset.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={600}>Upload New Tabular Dataset</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          <TextField
            label="Dataset Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            fullWidth
          />
          <Box
            sx={{
              border: '2px dashed',
              borderColor: file ? 'primary.main' : 'divider',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': { borderColor: 'primary.main' },
              position: 'relative'
            }}
          >
            <input
              type="file"
              accept=".csv"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
              }}
              onChange={handleFileChange}
            />
            <CloudUpload color={file ? 'primary' : 'disabled'} sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="body2" fontWeight={500}>
              {file ? file.name : 'Click or Drag CSV file here to upload'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Only .csv format supported for tabular analyses
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading} startIcon={<CloudUpload />}>
            {loading ? 'Uploading...' : 'Submit Dataset'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
export default UploadModal;
