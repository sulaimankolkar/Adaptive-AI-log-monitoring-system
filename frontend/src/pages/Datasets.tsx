import React, { useEffect, useState } from 'react';
import { Button, Alert } from '@mui/material';
import { Add } from '@mui/icons-material';
import Layout from '../components/common/Layout';
import DatasetTable from '../components/datasets/DatasetTable';
import UploadModal from '../components/datasets/UploadModal';
import LoadingState from '../components/LoadingState';
import SectionCard from '../components/SectionCard';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
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
      <PageHeader
        title="Dataset Inventory"
        subtitle="Upload baseline references and target production files for statistical analyses"
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => setModalOpen(true)}
          >
            Upload Dataset
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <LoadingState message="Fetching datasets..." />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title="No Datasets Found"
          description="Upload your first dataset to begin drift analysis"
        />
      ) : (
        <SectionCard title="All Datasets">
          <DatasetTable datasets={data} />
        </SectionCard>
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
