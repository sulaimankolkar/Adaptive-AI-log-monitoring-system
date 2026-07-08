import React from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
} from '@mui/material';

import {
  Dashboard as DashIcon,
  Storage as DbIcon,
  Speed as DriftIcon,
  TextFields as PromptIcon,
  Psychology as InsightIcon,
  Description as ReportIcon,
  AutoAwesome,
} from '@mui/icons-material';

import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 260;

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <DashIcon />, path: '/' },
    { text: 'Datasets', icon: <DbIcon />, path: '/datasets' },
    { text: 'Drift Analysis', icon: <DriftIcon />, path: '/drift' },
    { text: 'Prompt Engineering', icon: <PromptIcon />, path: '/prompts' },
    { text: 'AI Insights', icon: <InsightIcon />, path: '/insights' },
    { text: 'Reports', icon: <ReportIcon />, path: '/reports' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,

        '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',

            top: 72,

            height: 'calc(100% - 72px)',

            borderRight: '1px solid',

            borderColor: 'divider',

            background:
              'linear-gradient(180deg,#0F172A 0%,#111827 100%)',
        },
      }}
    >
      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 2,
        }}
      >
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background:
              'linear-gradient(135deg,#6366F1,#8B5CF6)',
            mb: 2,
            boxShadow:
              '0 10px 30px rgba(99,102,241,.35)',
          }}
        >
          <AutoAwesome sx={{ color: '#fff' }} />
        </Box>

        <Typography
          variant="h6"
          fontWeight={700}
        >
          Adaptive AI
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Monitoring Platform
        </Typography>

        <Typography
          variant="caption"
          sx={{
            mt: 1,
            display: 'block',
            color: 'primary.main',
            fontWeight: 600,
            letterSpacing: '.4px',
          }}
        >
          ENTERPRISE DASHBOARD
        </Typography>
      </Box>

      <Divider />

      <Box
        sx={{
          mt: 2,
          px: 1.5,
          overflowY: 'auto',
          flexGrow: 1,
        }}
      >
        <List disablePadding>
          {menuItems.map((item) => {
            const isSelected = location.pathname === item.path;

            return (
              <ListItemButton
                key={item.text}
                onClick={() => navigate(item.path)}
                selected={isSelected}
                sx={{
                  position: 'relative',

                  mx: 1,
                  mb: 0.75,

                  minHeight: 52,

                  borderRadius: 3,

                  px: 2,

                  color: isSelected
                    ? 'primary.main'
                    : 'text.secondary',

                  transition: 'all .22s ease',

                  '&::before': isSelected
                    ? {
                        content: '""',
                        position: 'absolute',
                        left: -6,
                        top: 10,
                        bottom: 10,
                        width: 4,
                        borderRadius: 999,
                        backgroundColor: 'primary.main',
                      }
                    : {},

                  '&.Mui-selected': {
                    background:
                      'linear-gradient(90deg, rgba(99,102,241,.18) 0%, rgba(99,102,241,.05) 100%)',

                    color: 'primary.main',

                    '&:hover': {
                      background:
                        'linear-gradient(90deg, rgba(99,102,241,.24) 0%, rgba(99,102,241,.08) 100%)',
                    },
                  },

                  '&:hover': {
                    transform: 'translateX(4px)',

                    backgroundColor:
                      'rgba(255,255,255,.04)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 42,

                    color: isSelected
                      ? 'primary.main'
                      : 'text.secondary',

                    transition: '.2s',

                    '& svg': {
                      fontSize: 22,
                    },
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '.93rem',

                    fontWeight: isSelected
                      ? 700
                      : 500,

                    letterSpacing: '.2px',
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      <Divider />

      <Box
        sx={{
          px: 3,
          py: 2.5,
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
        >
          Adaptive AI Monitoring
        </Typography>

        <Typography
          variant="caption"
          display="block"
          color="primary.main"
          fontWeight={600}
        >
          Version 1.0
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;