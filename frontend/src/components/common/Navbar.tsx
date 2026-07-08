import React, { useContext } from 'react';

import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  Chip,
  Avatar,
} from '@mui/material';

import {
  Brightness4,
  Brightness7,
  Logout,
} from '@mui/icons-material';

import { ThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';

export const Navbar: React.FC = () => {
  const themeCtx = useContext(ThemeContext);
  const { user, logout } = useAuth();

  if (!themeCtx) return null;

  const pageTitle = (() => {
    switch (window.location.pathname) {
      case '/':
        return 'Dashboard';
      case '/datasets':
        return 'Datasets';
      case '/drift':
        return 'Drift Analysis';
      case '/prompts':
        return 'Prompt Engineering';
      case '/insights':
        return 'AI Insights';
      case '/reports':
        return 'Reports';
      default:
        return 'Dashboard';
    }
  })();

  const initials =
    user?.full_name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ||
    user?.email?.charAt(0).toUpperCase() ||
    'A';

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,

        backgroundColor: 'background.paper',

        color: 'text.primary',

        borderBottom: '1px solid',

        borderColor: 'divider',

        backdropFilter: 'blur(10px)',
      }}
    >
      <Toolbar
        sx={{
          minHeight: 72,
          px: 4,
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="h5"
            fontWeight={700}
          >
            {pageTitle}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Adaptive AI Monitoring Platform
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
          }}
        >
          <IconButton
            onClick={themeCtx.toggleTheme}
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.default',
              transition: 'all .2s ease',

              '&:hover': {
                bgcolor: 'primary.main',
                color: '#fff',
                transform: 'translateY(-1px)',
              },
            }}
          >
            {themeCtx.mode === 'dark'
              ? <Brightness7 />
              : <Brightness4 />}
          </IconButton>

          {user && (
            <>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 2,
                  py: 1,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.default',
                }}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: 'primary.main',
                    fontWeight: 700,
                  }}
                >
                  {initials}
                </Avatar>

                <Box>
                  <Typography
                    fontWeight={600}
                    fontSize=".92rem"
                  >
                    {user.full_name || user.email}
                  </Typography>

                  {user.role && (
                    <Chip
                      size="small"
                      label={user.role.name}
                      color={
                        user.role.name === 'Administrator'
                          ? 'secondary'
                          : 'primary'
                      }
                      sx={{
                        mt: .3,
                        height: 22,
                        fontSize: '.72rem',
                      }}
                    />
                  )}
                </Box>
              </Box>

              <Button
                variant="contained"
                color="error"
                startIcon={<Logout />}
                onClick={logout}
                sx={{
                  borderRadius: 3,
                  px: 2.5,
                  py: 1,
                }}
              >
                Sign Out
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;