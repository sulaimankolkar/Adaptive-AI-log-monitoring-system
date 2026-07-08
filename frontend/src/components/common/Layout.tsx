import React, { useEffect } from 'react';
import { Box, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Loading from './Loading';
import { useAuth } from '../../hooks/useAuth';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="#0B1220"
      >
        <Loading message="Authenticating session..." />
      </Box>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#0B1220",
      }}
    >
      <Navbar />

      <Sidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,

          width: {
            md: "calc(100% - 260px)",
          },

          ml: {
            md: "260px",
          },

          px: {
            xs: 2,
            sm: 3,
            md: 4,
            lg: 5,
          },

          py: 3,

          maxWidth: "1700px",

          mx: "auto",
        }}
      >
        <Toolbar sx={{ minHeight: 72 }} />

        <Box sx={{ mt: 2 }}>
            {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;