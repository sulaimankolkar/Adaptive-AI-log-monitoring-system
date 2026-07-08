import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { Add } from '@mui/icons-material';
import Layout from '../components/common/Layout';
import DatasetTable from '../components/datasets/DatasetTable';
import UploadModal from '../components/datasets/UploadModal';
import Loading from '../components/common/Loading';
import useFetch from '../hooks/useFetch';
import type { Dataset } from '../types';

export const Datasets: React.FC = () => {
  const { data, loading, error, request } = useFetch<Dataset[]>();
  const [modalOpen, setModalOpen] = useState(false);

  const fetchDatasets = () => {
    request('/datasets/');
  };

  useEffect(() => {
    fetchDatasets();
  }, [request]);

  return (
    <Layout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Dataset Inventory
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Upload baseline references and target production files for statistical analyses
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => setModalOpen(true)}
        >
          Upload Dataset
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Loading message="Fetching datasets..." />
      ) : (
        <DatasetTable datasets={data || []} />
      )}

      <UploadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchDatasets}
      />
    </Layout>
  );
};
export default Datasets;
