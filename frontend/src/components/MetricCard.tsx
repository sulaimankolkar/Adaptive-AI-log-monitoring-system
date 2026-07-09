import React from 'react';
import { Box, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

interface MetricCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  status?: 'success' | 'warning' | 'error' | 'default';
  sx?: SxProps<Theme>;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  value,
  label,
  status = 'default',
  sx,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'success.main';
      case 'warning':
        return 'warning.main';
      case 'error':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: '12px',
        backgroundColor: 'background.paper',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        minHeight: '140px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ color: 'primary.main', fontSize: '24px' }}>{icon}</Box>
        {status !== 'default' && (
          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: '6px',
              backgroundColor: (theme) => theme.palette.mode === 'dark' ? `${getStatusColor()}20` : `${getStatusColor()}15`,
              color: getStatusColor(),
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            {status}
          </Box>
        )}
      </Box>
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'text.primary',
            mb: 0.5,
          }}
        >
          {value}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontSize: '13px',
            color: 'text.secondary',
            fontWeight: 500,
          }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  );
};

export default MetricCard;
