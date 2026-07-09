import React from 'react';
import { Chip } from '@mui/material';
import type { ChipProps } from '@mui/material';

interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status: 'success' | 'warning' | 'error' | 'info' | 'default';
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, ...props }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Chip
      size="small"
      color={getStatusColor() as any}
      variant="outlined"
      sx={{
        fontWeight: 500,
        fontSize: '12px',
        borderRadius: '6px',
      }}
      {...props}
    />
  );
};

export default StatusChip;
