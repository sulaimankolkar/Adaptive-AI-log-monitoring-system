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
      <Card
        sx={{
          borderRadius: 4,
          bgcolor: '#182235',
          border: '1px solid rgba(255,255,255,.06)',
        }}
      >
        <CardContent sx={{ py: 8 }}>
          <Typography align="center" color="text.secondary">
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

  const drifted = chartData.filter((m) => m.isDrifted).length;

  const major = chartData.filter((m) => m.severity === 'major').length;

  const getColor = (isDrifted: boolean, severity: string) => {
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
    <Card
      sx={{
        height: '100%',
        borderRadius: 4,
        background:
          'linear-gradient(180deg,#1d2638 0%,#182235 100%)',
        border: '1px solid rgba(255,255,255,.06)',
      }}
    >
      <CardContent sx={{ p: 3 }}>

        {/* Header */}

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
            >
              Feature Drift Distribution
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Population Stability Index (PSI)
            </Typography>
          </Box>

          <Box display="flex" gap={1}>
            <Chip
              size="small"
              color="error"
              label={`${major} Major`}
            />

            <Chip
              size="small"
              color="warning"
              label={`${drifted} Drifted`}
            />

            <Chip
              size="small"
              color="primary"
              label={`${chartData.length} Features`}
            />
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <ResponsiveContainer width="100%" height={360}>
          <BarChart
            data={chartData}
            margin={{
              top: 10,
              right: 20,
              left: 0,
              bottom: 60,
            }}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="rgba(255,255,255,.08)"
            />

            <XAxis
              dataKey="name"
              angle={-35}
              interval={0}
              textAnchor="end"
              tick={{
                fill: '#94A3B8',
                fontSize: 12,
              }}
            />

            <YAxis
              tick={{
                fill: '#94A3B8',
                fontSize: 12,
              }}
            />

            <Tooltip
              cursor={{
                fill: 'rgba(255,255,255,.04)',
              }}
              contentStyle={{
                background: '#111827',
                border: '1px solid rgba(255,255,255,.08)',
                borderRadius: 12,
                color: '#fff',
              }}
              formatter={(value: any, name: any, props: any) => [
                Number(value).toFixed(4),
                props.payload.severity.toUpperCase(),
              ]}
            />

            <Bar
              dataKey="score"
              radius={[8, 8, 0, 0]}
            >
              {chartData.map((item, index) => (
                <Cell
                  key={index}
                  fill={getColor(
                    item.isDrifted,
                    item.severity
                  )}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

      </CardContent>
    </Card>
  );
};

export default DriftChart;