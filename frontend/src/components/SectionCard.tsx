import React from 'react';
import { Box, Paper } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

interface SectionCardProps {
  title?: string;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, children, sx }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '12px',
        backgroundColor: 'background.paper',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        ...sx,
      }}
    >
      {title && (
        <Box
          sx={{
            mb: 2,
            pb: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            component="h3"
            sx={{
              m: 0,
              fontSize: '18px',
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            {title}
          </Box>
        </Box>
      )}
      {children}
    </Paper>
  );
};

export default SectionCard;
