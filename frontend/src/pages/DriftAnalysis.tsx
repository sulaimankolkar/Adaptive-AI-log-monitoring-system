import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, FormControl, InputLabel, Select, MenuItem, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Paper } from '@mui/material';
import { PlayArrow, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import LoadingState from '../components/LoadingState';
import SectionCard from '../components/SectionCard';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
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
      <PageHeader
        title="Drift Analysis Center"
        subtitle="Run statistical drift detection tests and compare dataset distributions"
      />

      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}

      <SectionCard title="Trigger New Drift Comparison">
        <Box component="form" onSubmit={handleRun}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '5fr 2fr 5fr' }, gap: 3, alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>Reference / Baseline Data</Typography>
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
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: 'text.disabled' }}>VS</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>Target / Production Data</Typography>
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
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<PlayArrow />}
              disabled={submitting}
            >
              {submitting ? 'Triggering...' : 'Run Statistical Pipeline'}
            </Button>
          </Box>
        </Box>
      </SectionCard>

      <SectionCard title="Historical Analysis Runs">
        {loadingJobs ? (
          <LoadingState message="Fetching job logs..." />
        ) : !analyses || analyses.length === 0 ? (
          <EmptyState
            title="No Analysis Runs Found"
            description="Run a drift analysis to see historical job data"
          />
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
                {analyses.map((job) => (
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
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </SectionCard>
    </Layout>
  );
};
export default DriftAnalysis;
