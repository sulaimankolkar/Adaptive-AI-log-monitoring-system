import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';

import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Chip,
} from '@mui/material';

import type { DriftMetrics } from '../../types';

interface ChartProps {
  metrics: DriftMetrics[];
}

const DriftChart: React.FC<ChartProps> = ({ metrics }) => {
  if (!metrics || metrics.length === 0) {
    return (
      <Card>
        <CardContent sx={{ py: 10 }}>
          <Typography
            align="center"
            color="text.secondary"
          >
            No drift metrics available.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const chartData = metrics.map((m) => ({
    name: m.feature_name,
    score: m.score,
    severity: m.severity,
    isDrifted: m.is_drifted,
  }));

  const drifted = chartData.filter(
    (m) => m.isDrifted
  ).length;

  const major = chartData.filter(
    (m) => m.severity === 'major'
  ).length;

  const getColor = (
    isDrifted: boolean,
    severity: string
  ) => {
    if (!isDrifted) return '#3B82F6';

    switch (severity) {
      case 'major':
        return '#EF4444';

      case 'moderate':
        return '#F59E0B';

      default:
        return '#FACC15';
    }
  };

  return (
    <Card>
      <CardContent sx={{ p: 3.5 }}>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: {
              xs: 'flex-start',
              md: 'center',
            },
            flexDirection: {
              xs: 'column',
              md: 'row',
            },
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700 }}
            >
              Feature Drift Distribution
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: .5 }}
            >
              Population Stability Index (PSI)
              across monitored features.
            </Typography>
          </Box>

          <Box
            sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}
          >
            <Chip
              label={`${major} Major`}
              color="error"
              size="small"
            />

            <Chip
              label={`${drifted} Drifted`}
              color="warning"
              size="small"
            />

            <Chip
              label={`${chartData.length} Features`}
              color="primary"
              size="small"
            />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <ResponsiveContainer
          width="100%"
          height={520}
        >
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 20,
              left: 10,
              bottom: 110,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148,163,184,.15)"
              vertical={false}
            />

            <XAxis
              dataKey="name"
              angle={-45}
              interval={0}
              height={95}
              textAnchor="end"
              tick={{
                fill: '#94A3B8',
                fontSize: 12,
              }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{
                fill: '#94A3B8',
                fontSize: 12,
              }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              cursor={{
                fill: 'rgba(99,102,241,.08)',
              }}
              contentStyle={{
                background: '#111827',
                border: '1px solid rgba(255,255,255,.08)',
                borderRadius: 12,
                color: '#fff',
                boxShadow:
                  '0 12px 30px rgba(0,0,0,.35)',
              }}
              formatter={(
                value: any,
                _: any,
                props: any
              ) => [
                Number(value).toFixed(4),
                props.payload.severity.toUpperCase(),
              ]}
            />

            <Bar
              dataKey="score"
              radius={[8, 8, 0, 0]}
              maxBarSize={16}
            >
              {chartData.map(
                (item, index) => (
                  <Cell
                    key={index}
                    fill={getColor(
                      item.isDrifted,
                      item.severity
                    )}
                  />
                )
              )}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

      </CardContent>
    </Card>
  );
};

export default DriftChart;