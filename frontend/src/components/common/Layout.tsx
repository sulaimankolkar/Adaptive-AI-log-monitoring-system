import React, { useEffect } from "react";
import { Box, Toolbar, useMediaQuery, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";

import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import LoadingState from "../LoadingState";
import { useAuth } from "../../hooks/useAuth";

export const Layout: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <LoadingState message="Authenticating session..." />
      </Box>
    );
  }

  if (!isAuthenticated) return null;

  const sidebarWidth = isTablet ? 72 : 240;

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: 'background.default',
      }}
    >
      <Navbar />

      <Sidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: isMobile ? 0 : `${sidebarWidth}px`,
          width: isMobile ? '100%' : `calc(100% - ${sidebarWidth}px)`,
          px: {
            xs: 2,
            sm: 3,
            md: 4,
            lg: 5,
          },
          py: 3,
          boxSizing: "border-box",
        }}
      >
        <Toolbar sx={{ minHeight: 64 }} />

        <Box
          sx={{
            mt: 2,
            width: "100%",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;