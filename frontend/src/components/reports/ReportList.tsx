import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography } from '@mui/material';
import { GetApp } from '@mui/icons-material';
import api from '../../services/api';
import type { Report } from '../../types';

interface ListProps {
  reports: Report[];
}

export const ReportList: React.FC<ListProps> = ({ reports }) => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (reportId: string, analysisId: string) => {
    setDownloading(reportId);
    try {
      const response = await api.get(`/reports/${reportId}/download`, {
        responseType: 'blob',
      });
      // Create download link for Blob response
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Drift_Report_${analysisId.substring(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Failed to download report', error);
      alert('Failed to download report PDF. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  if (!reports || reports.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No reports generated yet.</Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><b>Report ID</b></TableCell>
            <TableCell><b>Analysis Job ID</b></TableCell>
            <TableCell><b>File Type</b></TableCell>
            <TableCell><b>Date Created</b></TableCell>
            <TableCell align="right"><b>Actions</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id} hover>
              <TableCell>{report.id.substring(0, 8)}...</TableCell>
              <TableCell>{report.drift_analysis_id.substring(0, 8)}...</TableCell>
              <TableCell style={{ textTransform: 'uppercase' }}>{report.format}</TableCell>
              <TableCell>{new Date(report.created_at).toLocaleString()}</TableCell>
              <TableCell align="right">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<GetApp />}
                  disabled={downloading === report.id}
                  onClick={() => handleDownload(report.id, report.drift_analysis_id)}
                >
                  {downloading === report.id ? 'Downloading...' : 'Download PDF'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
export default ReportList;
