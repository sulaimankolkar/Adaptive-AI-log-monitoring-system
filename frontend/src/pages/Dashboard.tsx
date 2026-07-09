import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from '@mui/material';

import { useSearchParams } from 'react-router-dom';

import Layout from '../components/common/Layout';
import { Loading } from '../components/common/Loading';
import { SectionCard } from '../components/common/SectionCard';


import DriftSummary from '../components/dashboard/DriftSummary';
import DriftChart from '../components/dashboard/DriftChart';
import GuardrailLogs from '../components/dashboard/GuardrailLogs';

import useFetch from '../hooks/useFetch';

import type { DriftAnalysis } from '../types';

export const Dashboard: React.FC = () => {
  const {
    data: analyses,
    loading,
    error,
    request: fetchAnalyses,
  } = useFetch<DriftAnalysis[]>();

  const [searchParams] = useSearchParams();

  const [selectedJobId, setSelectedJobId] =
    useState('');

  useEffect(() => {
    fetchAnalyses('/drift/');
  }, [fetchAnalyses]);

  useEffect(() => {
    const jobParam = searchParams.get('job');

    if (jobParam) {
      setSelectedJobId(jobParam);
      return;
    }

    if (
      analyses &&
      analyses.length > 0 &&
      !selectedJobId
    ) {
      const completed = analyses.find(
        (job) => job.status === 'completed'
      );

      setSelectedJobId(
        completed
          ? completed.id
          : analyses[0].id
      );
    }
  }, [
    analyses,
    searchParams,
    selectedJobId,
  ]);

  const activeJob = analyses?.find(
    (analysis) =>
      analysis.id === selectedJobId
  );

  const guardrailLogs =
    activeJob?.prompt_executions?.flatMap(
      (execution) =>
        execution.guardrail_results
    ) || [];

  return (
    <Layout>
      <Box
        sx={{
          display: 'flex',

          justifyContent: 'space-between',

          alignItems: {
            xs: 'flex-start',
            lg: 'center',
          },

          flexDirection: {
            xs: 'column',
            lg: 'row',
          },

          gap: 3,

          mb: 5,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: .5,
            }}
          >
            AI Analytics Dashboard
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
          >
            Real-time monitoring of model
            health, feature drift,
            guardrails and AI-generated
            insights.
          </Typography>
        </Box>

        {analyses &&
          analyses.length > 0 && (
            <FormControl
              size="small"
              sx={{
                minWidth: 330,
                maxWidth: 420,
              }}
            >
              <InputLabel>
                Select Analysis Job
              </InputLabel>

              <Select
                value={selectedJobId}
                label="Select Analysis Job"
                onChange={(e) =>
                  setSelectedJobId(
                    e.target.value
                  )
                }
              >
                {analyses.map((job) => (
                  <MenuItem
                    key={job.id}
                    value={job.id}
                  >
                    Job{' '}
                    {job.id.substring(
                      0,
                      8
                    )}{' '}
                    •{' '}
                    {new Date(
                      job.created_at
                    ).toLocaleDateString()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 4,
          }}
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Loading message="Loading dashboard..." />
      ) : !activeJob ? (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
          >
            No Analysis Jobs Found
          </Typography>

          <Typography
            color="text.secondary"
          >
            Run a drift analysis from the
            Drift Analysis page to populate
            this dashboard.
          </Typography>
        </Paper>
      ) : activeJob.status !== 'completed' ? (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
          >
            Analysis Still Running
          </Typography>

          <Typography
            color="text.secondary"
          >
            Current status:
            <b>
              {' '}
              {activeJob.status.toUpperCase()}
            </b>

            . Refresh this page after the
            analysis completes.
          </Typography>
        </Paper>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          {/* ============================
                 KPI SUMMARY
          ============================ */}

          <Box sx={{ width: '100%' }}>
            <SectionCard title="Key Performance Indicators">
              <DriftSummary analysis={activeJob} />
            </SectionCard>
          </Box>

          {/* ============================
                 FEATURE DRIFT CHART
          ============================ */}
          <Box
            sx={{
              width: "100%",
              maxWidth: 1500,
              mx: "auto",
            }}
          >
            <DriftChart
              metrics={activeJob.metrics || []}
            />
          </Box>
          {/* ============================
                 AI INSIGHTS
          ============================ */}

          <Box sx={{ width: '100%' }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,

                minHeight: 360,

                maxHeight: 500,

                overflowY: 'auto',
              }}
            >
              <CardContent
                sx={{
                  p: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 3,
                  }}
                >
                  AI Explainable Insights
                </Typography>
                {activeJob.ai_insight ? (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 3,
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        lineHeight: 1.8,
                      }}
                    >
                      {activeJob.ai_insight.summary}
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '.08em',
                        color: 'primary.main',
                      }}
                    >
                      Key Findings
                    </Typography>

                    <Box
                      component="ul"
                      sx={{
                        pl: 2.5,
                        m: 0,

                        '& li': {
                          mb: 1.2,
                        },
                      }}
                    >
                      {activeJob.ai_insight.key_findings_json?.map(
                        (finding, index) => (
                          <Box
                            component="li"
                            key={index}
                          >
                            <Typography variant="body2">
                              {finding}
                            </Typography>
                          </Box>
                        )
                      )}
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '.08em',
                        color: 'primary.main',
                      }}
                    >
                      Actionable Recommendations
                    </Typography>

                    <Box
                      component="ul"
                      sx={{
                        pl: 2.5,
                        m: 0,

                        '& li': {
                          mb: 1.2,
                        },
                      }}
                    >
                      {activeJob.ai_insight.recommendations_json?.map(
                        (recommendation, index) => (
                          <Box
                            component="li"
                            key={index}
                          >
                            <Typography
                              variant="body2"
                              color="secondary.main"
                            >
                              {recommendation}
                            </Typography>
                          </Box>
                        )
                      )}
                    </Box>
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    No AI insights were generated
                    for this analysis.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* ============================
                 GUARDRAIL AUDIT
          ============================ */}

          <Box sx={{ width: '100%' }}>
            <GuardrailLogs
              logs={guardrailLogs}
            />
          </Box>
        </Box>
      )}

    </Layout>
  );
};

export default Dashboard;
