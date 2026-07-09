import React from 'react';
import { Box, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

interface EmptyStateProps {
  title: string;
  description?: string;
  illustration?: React.ReactNode;
  sx?: SxProps<Theme>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  illustration,
  sx,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        p: 4,
        textAlign: 'center',
        ...sx,
      }}
    >
      {illustration && (
        <Box sx={{ mb: 3, fontSize: '48px', color: 'text.secondary' }}>
          {illustration}
        </Box>
      )}
      <Typography
        variant="h6"
        sx={{
          color: 'text.primary',
          fontWeight: 600,
          mb: 1,
        }}
      >
        {title}
      </Typography>
      {description && (
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            maxWidth: '400px',
          }}
        >
          {description}
        </Typography>
      )}
    </Box>
  );
};

export default EmptyState;
