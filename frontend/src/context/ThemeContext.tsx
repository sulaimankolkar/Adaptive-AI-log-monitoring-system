import React, {
  createContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';

import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
  CssBaseline,
  alpha,
} from '@mui/material';

interface ThemeContextType {
  mode: 'light' | 'dark';
  toggleTheme: () => void;
}

export const ThemeContext =
  createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('themeMode');

    if (saved === 'light' || saved === 'dark') {
      setMode(saved);
    }
  }, []);

  const toggleTheme = () => {
    const next = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    localStorage.setItem('themeMode', next);
  };

  const theme = useMemo(() => {
    const isDark = mode === 'dark';

    return createTheme({
      shape: {
        borderRadius: 14,
      },

      spacing: 8,

      palette: {
        mode,

        primary: {
          main: '#6366F1',
          light: '#818CF8',
          dark: '#4F46E5',
          contrastText: '#FFFFFF',
        },

        secondary: {
          main: '#8B5CF6',
          light: '#A78BFA',
          dark: '#7C3AED',
        },

        success: {
          main: '#10B981',
        },

        warning: {
          main: '#F59E0B',
        },

        error: {
          main: '#EF4444',
        },

        info: {
          main: '#3B82F6',
        },

        background: isDark
          ? {
              default: '#0F172A',
              paper: '#1E293B',
            }
          : {
              default: '#F8FAFC',
              paper: '#FFFFFF',
            },

        text: isDark
          ? {
              primary: '#F8FAFC',
              secondary: '#94A3B8',
            }
          : {
              primary: '#0F172A',
              secondary: '#64748B',
            },

        divider: isDark
          ? alpha('#FFFFFF', 0.08)
          : alpha('#0F172A', 0.08),
      },

      typography: {
        fontFamily:
          '"Outfit","Inter","Roboto","Helvetica","Arial",sans-serif',

        h1: {
          fontSize: '2.5rem',
          fontWeight: 700,
          letterSpacing: '-0.04em',
        },

        h2: {
          fontSize: '2rem',
          fontWeight: 700,
          letterSpacing: '-0.03em',
        },

        h3: {
          fontSize: '1.75rem',
          fontWeight: 700,
        },

        h4: {
          fontSize: '1.5rem',
          fontWeight: 600,
        },

        h5: {
          fontSize: '1.25rem',
          fontWeight: 600,
        },

        h6: {
          fontSize: '1rem',
          fontWeight: 600,
        },

        subtitle1: {
          fontWeight: 600,
        },

        subtitle2: {
          fontWeight: 500,
        },

        body1: {
          fontSize: '0.95rem',
          lineHeight: 1.7,
        },

        body2: {
          fontSize: '0.875rem',
          lineHeight: 1.6,
        },

        caption: {
          fontSize: '0.78rem',
          color: isDark ? '#94A3B8' : '#64748B',
        },

        button: {
          fontWeight: 600,
          textTransform: 'none',
          letterSpacing: '.2px',
        },
      },

      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: isDark
                ? '#0F172A'
                : '#F8FAFC',

              transition:
                'background-color .25s ease,color .25s ease',

              scrollbarWidth: 'thin',
            },

            '*::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },

            '*::-webkit-scrollbar-track': {
              background: isDark
                ? '#111827'
                : '#E5E7EB',
            },

            '*::-webkit-scrollbar-thumb': {
              background: isDark
                ? '#475569'
                : '#CBD5E1',

              borderRadius: '999px',
            },

            '*::-webkit-scrollbar-thumb:hover': {
              background: isDark
                ? '#64748B'
                : '#94A3B8',
            },

            '::selection': {
              background: alpha('#6366F1', 0.25),
            },
          },
        },

        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',

              border: `1px solid ${
                isDark
                  ? alpha('#FFFFFF', 0.06)
                  : alpha('#000000', 0.06)
              }`,

              boxShadow: isDark
                ? '0 10px 30px rgba(0,0,0,.28)'
                : '0 8px 24px rgba(15,23,42,.06)',

              transition: 'all .25s ease',
            },
          },
        },

        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 18,

              overflow: 'hidden',

              border: `1px solid ${
                isDark
                  ? alpha('#FFFFFF', 0.06)
                  : alpha('#000000', 0.05)
              }`,

              backgroundImage: 'none',

              transition:
                'transform .22s ease, box-shadow .22s ease',

              '&:hover': {
                transform: 'translateY(-2px)',
              },
            },
          },
        },
        MuiButton: {
          defaultProps: {
            disableElevation: true,
          },
          styleOverrides: {
            root: {
              borderRadius: 12,
              padding: '10px 18px',
              fontWeight: 600,
              fontSize: '0.92rem',
              transition: 'all .2s ease',
              boxShadow: 'none',

              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: isDark
                  ? '0 10px 20px rgba(99,102,241,.25)'
                  : '0 8px 18px rgba(99,102,241,.18)',
              },
            },

            contained: {
              background:
                'linear-gradient(135deg,#6366F1 0%,#4F46E5 100%)',
            },

            outlined: {
              borderWidth: 1.5,

              '&:hover': {
                borderWidth: 1.5,
              },
            },
          },
        },

        MuiIconButton: {
          styleOverrides: {
            root: {
              borderRadius: 12,

              transition: 'all .2s ease',

              '&:hover': {
                backgroundColor: alpha('#6366F1', 0.12),
                transform: 'translateY(-1px)',
              },
            },
          },
        },

        MuiTextField: {
          defaultProps: {
            variant: 'outlined',
            size: 'small',
          },
        },

        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              borderRadius: 12,

              backgroundColor: isDark
                ? alpha('#FFFFFF', 0.03)
                : alpha('#000000', 0.015),

              transition: 'all .2s ease',

              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#6366F1',
              },

              '&.Mui-focused': {
                backgroundColor: isDark
                  ? alpha('#6366F1', 0.05)
                  : alpha('#6366F1', 0.04),
              },
            },

            notchedOutline: {
              borderColor: isDark
                ? alpha('#FFFFFF', 0.08)
                : alpha('#000000', 0.08),
            },

            input: {
              padding: '11px 14px',
            },
          },
        },

        MuiInputLabel: {
          styleOverrides: {
            root: {
              fontWeight: 500,
            },
          },
        },

        MuiSelect: {
          styleOverrides: {
            select: {
              display: 'flex',
              alignItems: 'center',
            },
          },
        },

        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: 999,

              fontWeight: 600,

              height: 30,

              transition: 'all .2s ease',
            },

            filled: {
              backgroundColor: isDark
                ? alpha('#6366F1', 0.16)
                : alpha('#6366F1', 0.10),
            },
          },
        },

        MuiAlert: {
          styleOverrides: {
            root: {
              borderRadius: 14,
              alignItems: 'center',
            },

            standardSuccess: {
              backgroundColor: alpha('#10B981', 0.12),
            },

            standardWarning: {
              backgroundColor: alpha('#F59E0B', 0.12),
            },

            standardError: {
              backgroundColor: alpha('#EF4444', 0.12),
            },

            standardInfo: {
              backgroundColor: alpha('#3B82F6', 0.12),
            },
          },
        },

        MuiSnackbarContent: {
          styleOverrides: {
            root: {
              borderRadius: 12,
            },
          },
        },

        MuiTooltip: {
          styleOverrides: {
            tooltip: {
              borderRadius: 10,

              fontSize: '.82rem',

              backgroundColor: isDark
                ? '#111827'
                : '#1E293B',
            },

            arrow: {
              color: isDark
                ? '#111827'
                : '#1E293B',
            },
          },
        },

        MuiDivider: {
          styleOverrides: {
            root: {
              borderColor: isDark
                ? alpha('#FFFFFF', 0.08)
                : alpha('#000000', 0.08),
            },
          },
        },

        MuiAvatar: {
          styleOverrides: {
            root: {
              fontWeight: 700,
            },
          },
        },

        MuiBadge: {
          styleOverrides: {
            badge: {
              fontWeight: 700,
            },
          },
        },

        MuiSwitch: {
          styleOverrides: {
            root: {
              padding: 8,
            },

            switchBase: {
              '&.Mui-checked': {
                color: '#FFFFFF',

                '& + .MuiSwitch-track': {
                  opacity: 1,
                  backgroundColor: '#6366F1',
                },
              },
            },

            track: {
              borderRadius: 999,
            },

            thumb: {
              boxShadow: 'none',
            },
          },
        },

        MuiCheckbox: {
          styleOverrides: {
            root: {
              borderRadius: 8,
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              borderRight: `1px solid ${
                isDark
                  ? alpha('#FFFFFF', 0.06)
                  : alpha('#000000', 0.06)
              }`,
              backgroundImage: 'none',
              backgroundColor: isDark ? '#111827' : '#FFFFFF',
            },
          },
        },

        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              backgroundColor: isDark
                ? alpha('#111827', 0.88)
                : alpha('#FFFFFF', 0.92),
              backdropFilter: 'blur(12px)',
              boxShadow: 'none',
              borderBottom: `1px solid ${
                isDark
                  ? alpha('#FFFFFF', 0.06)
                  : alpha('#000000', 0.06)
              }`,
            },
          },
        },

        MuiTableContainer: {
          styleOverrides: {
            root: {
              borderRadius: 16,
            },
          },
        },

        MuiTableHead: {
          styleOverrides: {
            root: {
              backgroundColor: isDark
                ? alpha('#FFFFFF', 0.03)
                : alpha('#000000', 0.02),
            },
          },
        },

        MuiTableCell: {
          styleOverrides: {
            head: {
              fontWeight: 700,
              fontSize: '.88rem',
              letterSpacing: '.3px',
              borderBottom: `1px solid ${
                isDark
                  ? alpha('#FFFFFF', 0.08)
                  : alpha('#000000', 0.08)
              }`,
            },

            body: {
              borderBottom: `1px solid ${
                isDark
                  ? alpha('#FFFFFF', 0.05)
                  : alpha('#000000', 0.05)
              }`,
            },
          },
        },

        MuiTableRow: {
          styleOverrides: {
            root: {
              transition: 'background-color .18s ease',

              '&:hover': {
                backgroundColor: isDark
                  ? alpha('#6366F1', 0.05)
                  : alpha('#6366F1', 0.03),
              },
            },
          },
        },

        MuiDialog: {
          styleOverrides: {
            paper: {
              borderRadius: 20,
              overflow: 'hidden',
            },
          },
        },

        MuiDialogTitle: {
          styleOverrides: {
            root: {
              fontWeight: 700,
              padding: '20px 24px',
            },
          },
        },

        MuiDialogContent: {
          styleOverrides: {
            root: {
              padding: '20px 24px',
            },
          },
        },

        MuiDialogActions: {
          styleOverrides: {
            root: {
              padding: '16px 24px 20px',
            },
          },
        },

        MuiMenu: {
          styleOverrides: {
            paper: {
              borderRadius: 14,
              marginTop: 6,
            },
          },
        },

        MuiMenuItem: {
          styleOverrides: {
            root: {
              minHeight: 42,
              borderRadius: 10,
              margin: '4px 8px',
              transition: 'all .18s ease',

              '&:hover': {
                backgroundColor: alpha('#6366F1', 0.08),
              },
            },
          },
        },

        MuiTabs: {
          styleOverrides: {
            indicator: {
              height: 3,
              borderRadius: 999,
            },
          },
        },

        MuiTab: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              fontWeight: 600,
              minHeight: 48,
            },
          },
        },

        MuiAccordion: {
          styleOverrides: {
            root: {
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: 'none',

              '&:before': {
                display: 'none',
              },
            },
          },
        },

        MuiAccordionSummary: {
          styleOverrides: {
            root: {
              minHeight: 56,
              fontWeight: 600,
            },
          },
        },

        MuiLinearProgress: {
          styleOverrides: {
            root: {
              height: 8,
              borderRadius: 999,
            },
          },
        },

        MuiCircularProgress: {
          styleOverrides: {
            root: {
              strokeLinecap: 'round',
            },
          },
        },

        MuiListItemButton: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              margin: '2px 8px',
              transition: 'all .2s ease',

              '&:hover': {
                backgroundColor: alpha('#6366F1', 0.08),
              },

              '&.Mui-selected': {
                backgroundColor: alpha('#6366F1', 0.14),

                '&:hover': {
                  backgroundColor: alpha('#6366F1', 0.18),
                },
              },
            },
          },
        },

        MuiListItemIcon: {
          styleOverrides: {
            root: {
              minWidth: 40,
            },
          },
        },
      },
    });
  }, [mode]);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        toggleTheme,
      }}
    >
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};       