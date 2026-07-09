import React, { useContext } from 'react';
import { Box, Toolbar, IconButton, Typography, Avatar, useMediaQuery, useTheme } from '@mui/material';
import { Brightness4, Brightness7, Logout as LogoutIcon } from '@mui/icons-material';
import { ThemeContext } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';

export const Navbar: React.FC = () => {
  const themeCtx = useContext(ThemeContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const { user, logout } = useAuth();

  if (!themeCtx) return null;

  const handleLogout = () => {
    logout();
  };

  const sidebarWidth = isTablet ? 72 : 240;

  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        px: 3,
        position: 'fixed',
        top: 0,
        right: 0,
        left: isMobile ? 0 : `${sidebarWidth}px`,
        zIndex: 1000,
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '64px',
          px: 0,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontSize: '18px',
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          {isMobile ? 'AI Monitor' : ''}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={themeCtx.toggleTheme}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
            aria-label="Toggle theme"
          >
            {themeCtx.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          {user && (
            <>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    backgroundColor: 'primary.main',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                {!isMobile && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '13px',
                    }}
                  >
                    {user.email}
                  </Typography>
                )}
              </Box>
              <IconButton
                onClick={handleLogout}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'error.main',
                    color: 'white',
                  },
                }}
                aria-label="Logout"
              >
                <LogoutIcon />
              </IconButton>
            </>
          )}
        </Box>
      </Toolbar>
    </Box>
  );
};

export default Navbar;
