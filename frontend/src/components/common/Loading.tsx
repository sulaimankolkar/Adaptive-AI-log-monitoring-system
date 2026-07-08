import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export const Loading: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="300px"
      gap={2}
    >
      <CircularProgress color="primary" />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};
export default Loading;
