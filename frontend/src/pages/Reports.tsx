import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Alert, Chip, IconButton, Paper } from '@mui/material';
import { GetApp, Autorenew, Refresh } from '@mui/icons-material';
import Layout from '../components/common/Layout';
import LoadingState from '../components/LoadingState';
import SectionCard from '../components/SectionCard';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import useFetch from '../hooks/useFetch';
import api from '../services/api';
import type { DriftAnalysis } from '../types';

export const Reports: React.FC = () => {
  const { data: analyses, loading, error, request: fetchAnalyses } = useFetch<DriftAnalysis[]>();
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyses('/drift/');
  }, [fetchAnalyses]);

  const handleGenerate = async (analysisId: string) => {
    setGeneratingId(analysisId);
    try {
      await api.post(`/reports/analysis/${analysisId}`);
      fetchAnalyses('/drift/'); // Refresh list
    } catch (err) {
      console.error('Failed to generate report', err);
      alert('Failed to generate PDF report.');
    } finally {
      setGeneratingId(null);
    }
  };

  const handleDownload = async (reportId: string, analysisId: string) => {
    setDownloadingId(reportId);
    try {
      const response = await api.get(`/reports/${reportId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Drift_Report_${analysisId.substring(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error('Failed to download report', err);
      alert('Failed to download PDF.');
    } finally {
      setDownloadingId(null);
    }
  };

  // Filter completed jobs
  const completedJobs = analyses?.filter((a) => a.status === 'completed') || [];

  return (
    <Layout>
      <PageHeader
        title="Compliance Reports"
        subtitle="Export comprehensive statistical summaries, AI explanations, and safety guardrail outcomes into PDF reports"
        action={
          <IconButton onClick={() => fetchAnalyses('/drift/')} aria-label="Refresh">
            <Refresh />
          </IconButton>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <LoadingState message="Fetching compliance files..." />
      ) : completedJobs.length === 0 ? (
        <EmptyState
          title="No Reports Available"
          description="No completed analyses found. Please run a job first in the Drift Analysis Center."
        />
      ) : (
        <SectionCard title="Available Reports">
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><b>Job ID</b></TableCell>
                  <TableCell><b>Reference</b></TableCell>
                  <TableCell><b>Target</b></TableCell>
                  <TableCell><b>Date Run</b></TableCell>
                  <TableCell><b>Report Status</b></TableCell>
                  <TableCell align="right"><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {completedJobs.map((job) => {
                  // Check if any report relation exists
                  // Since reports can be loaded via relationship
                  const hasReport = job.reports && job.reports.length > 0;
                  const report = hasReport ? job.reports![0] : null;

                  return (
                    <TableRow key={job.id} hover>
                      <TableCell>{job.id.substring(0, 8)}...</TableCell>
                      <TableCell>v{job.reference_version_id.substring(0,4)}</TableCell>
                      <TableCell>v{job.target_version_id.substring(0,4)}</TableCell>
                      <TableCell>{new Date(job.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        {report ? (
                          <Chip label="PDF READY" color="success" size="small" variant="outlined" />
                        ) : (
                          <Chip label="NOT EXPORTED" color="default" size="small" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {report ? (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<GetApp />}
                            disabled={downloadingId === report.id}
                            onClick={() => handleDownload(report.id, job.id)}
                          >
                            {downloadingId === report.id ? 'Downloading...' : 'Download PDF'}
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            startIcon={<Autorenew />}
                            disabled={generatingId === job.id}
                            onClick={() => handleGenerate(job.id)}
                          >
                            {generatingId === job.id ? 'Generating...' : 'Export to PDF'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </SectionCard>
      )}
    </Layout>
  );
};
export default Reports;
