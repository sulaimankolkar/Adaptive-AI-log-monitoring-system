import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, FormControl, InputLabel, Select, MenuItem, Grid, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { PlayArrow, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import Loading from '../components/common/Loading';
import useFetch from '../hooks/useFetch';
import api from '../services/api';
import type { Dataset, DriftAnalysis as DriftType } from '../types';

export const DriftAnalysis: React.FC = () => {
  const { data: datasets, request: fetchDatasets } = useFetch<Dataset[]>();
  const { data: analyses, loading: loadingJobs, request: fetchAnalyses } = useFetch<DriftType[]>();
  
  const [refDs, setRefDs] = useState('');
  const [refVer, setRefVer] = useState('');
  const [tarDs, setTarDs] = useState('');
  const [tarVer, setTarVer] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDatasets('/datasets/');
    fetchAnalyses('/drift/');
  }, [fetchDatasets, fetchAnalyses]);

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refVer || !tarVer) {
      setError('Please select both reference and target versions.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post('/drift/', {
        reference_version_id: refVer,
        target_version_id: tarVer,
      });
      setSuccess('Drift analysis job triggered in the background successfully!');
      fetchAnalyses('/drift/');
      
      // Clear inputs
      setRefDs('');
      setRefVer('');
      setTarDs('');
      setTarVer('');
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to start drift analysis.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const getRefVersions = () => {
    const ds = datasets?.find((d) => d.id === refDs);
    return ds?.versions || [];
  };

  const getTarVersions = () => {
    const ds = datasets?.find((d) => d.id === tarDs);
    return ds?.versions || [];
  };

  return (
    <Layout>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700}>
          Drift Analysis Center
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Run statistical drift detection tests and compare dataset distributions
        </Typography>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}

      <Grid container spacing={3} mb={5}>
        <Grid item xs={12} md={10}>
          <Paper component="form" onSubmit={handleRun} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Trigger New Drift Comparison
            </Typography>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={5}>
                <Typography variant="subtitle2" mb={1} color="text.secondary">Reference / Baseline Data</Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Select Dataset</InputLabel>
                  <Select value={refDs} onChange={(e) => { setRefDs(e.target.value); setRefVer(''); }} label="Select Dataset">
                    {datasets?.map((d) => (
                      <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small" disabled={!refDs}>
                  <InputLabel>Select Version</InputLabel>
                  <Select value={refVer} onChange={(e) => setRefVer(e.target.value)} label="Select Version">
                    {getRefVersions().map((v) => (
                      <MenuItem key={v.id} value={v.id}>v{v.version_num} ({v.row_count} rows)</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={2} textAlign="center">
                <Typography variant="h6" color="text.disabled">VS</Typography>
              </Grid>

              <Grid item xs={12} sm={5}>
                <Typography variant="subtitle2" mb={1} color="text.secondary">Target / Production Data</Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Select Dataset</InputLabel>
                  <Select value={tarDs} onChange={(e) => { setTarDs(e.target.value); setTarVer(''); }} label="Select Dataset">
                    {datasets?.map((d) => (
                      <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small" disabled={!tarDs}>
                  <InputLabel>Select Version</InputLabel>
                  <Select value={tarVer} onChange={(e) => setTarVer(e.target.value)} label="Select Version">
                    {getTarVersions().map((v) => (
                      <MenuItem key={v.id} value={v.id}>v{v.version_num} ({v.row_count} rows)</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<PlayArrow />}
                  disabled={submitting}
                >
                  {submitting ? 'Triggering...' : 'Run Statistical Pipeline'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight={600} mb={2}>
        Historical Analysis Runs
      </Typography>

      {loadingJobs ? (
        <Loading message="Fetching job logs..." />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Job ID</b></TableCell>
                <TableCell><b>Reference</b></TableCell>
                <TableCell><b>Target</b></TableCell>
                <TableCell><b>Status</b></TableCell>
                <TableCell><b>Execution Date</b></TableCell>
                <TableCell align="right"><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {analyses?.map((job) => (
                <TableRow key={job.id} hover>
                  <TableCell>{job.id.substring(0, 8)}...</TableCell>
                  <TableCell>
                    {job.reference_version_id ? `v${job.reference_version_id.substring(0,4)}` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {job.target_version_id ? `v${job.target_version_id.substring(0,4)}` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={job.status.toUpperCase()}
                      size="small"
                      color={
                        job.status === 'completed'
                          ? 'success'
                          : job.status === 'failed'
                          ? 'error'
                          : 'warning'
                      }
                    />
                  </TableCell>
                  <TableCell>{new Date(job.created_at).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => navigate(`/?job=${job.id}`)}
                      disabled={job.status !== 'completed'}
                    >
                      View Report
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!analyses || analyses.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary" p={2}>No analysis runs found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Layout>
  );
};
export default DriftAnalysis;
