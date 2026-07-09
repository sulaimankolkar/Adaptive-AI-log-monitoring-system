import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, useMediaQuery, useTheme } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Storage as DatasetsIcon,
  ShowChart as DriftIcon,
  Psychology as InsightsIcon,
  Edit as PromptsIcon,
  Description as ReportsIcon,
} from '@mui/icons-material';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/datasets', label: 'Datasets', icon: <DatasetsIcon /> },
  { path: '/drift', label: 'Drift Analysis', icon: <DriftIcon /> },
  { path: '/insights', label: 'AI Insights', icon: <InsightsIcon /> },
  { path: '/prompts', label: 'Prompts', icon: <PromptsIcon /> },
  { path: '/reports', label: 'Reports', icon: <ReportsIcon /> },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  if (isMobile) {
    return null;
  }

  return (
    <Box
      sx={{
        width: isTablet ? '72px' : '240px',
        backgroundColor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1100,
      }}
    >
      <Box
        sx={{
          p: isTablet ? 2 : 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            fontSize: isTablet ? '20px' : '24px',
            fontWeight: 700,
            color: 'primary.main',
            textAlign: isTablet ? 'center' : 'left',
          }}
        >
          {isTablet ? 'AI' : 'AI Monitor'}
        </Box>
      </Box>
      <List sx={{ p: isTablet ? 1 : 2, flex: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: '8px',
                  backgroundColor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'white' : 'text.secondary',
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                  },
                  px: isTablet ? 1.5 : 2,
                  py: 1.5,
                  justifyContent: isTablet ? 'center' : 'flex-start',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: 'inherit',
                    minWidth: isTablet ? 'auto' : '40px',
                    justifyContent: isTablet ? 'center' : 'flex-start',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!isTablet && (
                  <ListItemText
                    primary={item.label}
                    sx={{
                      '& .MuiTypography-root': {
                        fontSize: '14px',
                        fontWeight: isActive ? 600 : 500,
                      },
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default Sidebar;
