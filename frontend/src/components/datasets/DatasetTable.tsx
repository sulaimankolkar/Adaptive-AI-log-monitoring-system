import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, Chip } from '@mui/material';
import type { Dataset } from '../../types';

interface TableProps {
  datasets: Dataset[];
}

export const DatasetTable: React.FC<TableProps> = ({ datasets }) => {
  if (!datasets || datasets.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No datasets uploaded yet.</Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><b>Dataset Name</b></TableCell>
            <TableCell><b>Description</b></TableCell>
            <TableCell><b>Active Versions</b></TableCell>
            <TableCell><b>Row Count</b></TableCell>
            <TableCell><b>Col Count</b></TableCell>
            <TableCell><b>Created At</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {datasets.map((dataset) => {
            const latestVersion = dataset.versions[dataset.versions.length - 1];
            return (
              <TableRow key={dataset.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {dataset.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {dataset.description || 'No description provided.'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={0.5} flexWrap="wrap">
                    {dataset.versions.map((v) => (
                      <Chip
                        key={v.id}
                        label={`v${v.version_num}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  {latestVersion?.row_count !== undefined ? latestVersion.row_count.toLocaleString() : 'N/A'}
                </TableCell>
                <TableCell>
                  {latestVersion?.col_count || 'N/A'}
                </TableCell>
                <TableCell>
                  {new Date(dataset.created_at).toLocaleString()}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
export default DatasetTable;
