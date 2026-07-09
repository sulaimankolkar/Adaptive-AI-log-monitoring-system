import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import {
  CheckCircle,
  WarningAmber,
  ErrorRounded,
  TrendingUp,
} from '@mui/icons-material';
import type { DriftAnalysis } from '../../types';

interface SummaryProps {
  analysis: DriftAnalysis;
}

const DriftSummary: React.FC<SummaryProps> = ({ analysis }) => {
  const metrics = analysis.metrics || [];

  const totalFeatures = metrics.length;
  const driftedCount = metrics.filter((m) => m.is_drifted).length;

  const driftPercentage = totalFeatures
    ? ((driftedCount / totalFeatures) * 100).toFixed(1)
    : '0';

  const major = metrics.filter((m) => m.severity === 'major').length;
  const moderate = metrics.filter((m) => m.severity === 'moderate').length;
  const minor = metrics.filter((m) => m.severity === 'minor').length;

  const passedGuardrails =
    analysis.prompt_executions
      ?.flatMap((p) => p.guardrail_results)
      ?.filter((g) => g.status === 'pass').length ?? 0;

  const totalGuardrails =
    analysis.prompt_executions
      ?.flatMap((p) => p.guardrail_results).length ?? 0;

  let status = 'Stable';
  let severity = 'Healthy';
  let color = '#22c55e';
  let bg = 'rgba(34,197,94,.12)';
  let icon = <CheckCircle fontSize="medium" />;

  if (major > 0 || Number(driftPercentage) >= 50) {
    status = 'Critical';
    severity = 'Major Risk';
    color = '#ef4444';
    bg = 'rgba(239,68,68,.12)';
    icon = <ErrorRounded fontSize="medium" />;
  } else if (driftedCount > 0) {
    status = 'Warning';
    severity = 'Moderate Risk';
    color = '#f59e0b';
    bg = 'rgba(245,158,11,.12)';
    icon = <WarningAmber fontSize="medium" />;
  }

  const cards = [
    {
      title: 'System Status',
      value: status,
      subtitle: severity,
      icon,
      color,
      bg,
    },
    {
      title: 'Feature Drift',
      value: `${driftPercentage}%`,
      subtitle: `${driftedCount} of ${totalFeatures} Features`,
      icon: <TrendingUp fontSize="medium" />,
      color: '#6366F1',
      bg: 'rgba(99,102,241,.12)',
    },
    {
      title: 'Critical Features',
      value: major,
      subtitle: `${moderate} Moderate • ${minor} Minor`,
      icon: <ErrorRounded fontSize="medium" />,
      color: major > 0 ? '#ef4444' : '#22c55e',
      bg:
        major > 0
          ? 'rgba(239,68,68,.12)'
          : 'rgba(34,197,94,.12)',
    },
    {
      title: 'AI Guardrails',
      value: `${passedGuardrails}/${totalGuardrails}`,
      subtitle: 'Checks Passed',
      icon: <CheckCircle fontSize="medium" />,
      color: '#10b981',
      bg: 'rgba(16,185,129,.12)',
    },
  ];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
      {cards.map((card) => (
        <Box key={card.title}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 4,
              transition: 'all .25s ease',
              border: '1px solid',
              borderColor: 'divider',

              '&:hover': {
                transform: 'translateY(-4px)',
                borderColor: card.color,
                boxShadow: `0 12px 30px ${card.bg}`,
              },
            }}
          >
            <CardContent
              sx={{
                p: 2.75,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2.5,
                    bgcolor: card.bg,
                    color: card.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {card.icon}
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      letterSpacing: '.08em',
                      fontWeight: 700,
                    }}
                  >
                    {card.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {card.subtitle}
                  </Typography>
                </Box>
              </Box>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: card.color,
                  mb: 2,
                }}
              >
                {card.value}
              </Typography>

              <Box sx={{ flexGrow: 1 }} />

              <Chip
                label="Live"
                size="small"
                sx={{
                  alignSelf: 'flex-start',
                  bgcolor: card.bg,
                  color: card.color,
                  fontWeight: 700,
                  border: `1px solid ${card.color}`,
                }}
              />
            </CardContent>
          </Card>
        </Box>
      ))}
    </Box>
  );
};

export default DriftSummary;