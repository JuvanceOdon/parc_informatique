import { createTheme, type ThemeOptions } from '@mui/material/styles';

const typography = {
  fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
  h3: { fontWeight: 700, letterSpacing: '-0.03em' },
  h4: { fontWeight: 700, letterSpacing: '-0.02em' },
  h5: { fontWeight: 700, letterSpacing: '-0.02em' },
  h6: { fontWeight: 600, letterSpacing: '-0.01em' },
  button: { textTransform: 'none' as const, fontWeight: 600 },
  overline: { fontWeight: 700, letterSpacing: '0.08em' },
};

const shape = { borderRadius: 20 };

const softShadowLight = '0 8px 30px rgba(26, 54, 93, 0.06), 0 2px 8px rgba(26, 54, 93, 0.04)';
const softShadowDark = '0 8px 30px rgba(0, 0, 0, 0.35)';

const sharedComponents = (mode: 'light' | 'dark'): ThemeOptions['components'] => ({
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        backgroundImage:
          mode === 'light'
            ? 'radial-gradient(ellipse at top left, rgba(201,162,39,0.06), transparent 40%), radial-gradient(ellipse at top right, rgba(26,54,93,0.06), transparent 45%)'
            : 'none',
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 600,
        borderRadius: 14,
        boxShadow: 'none',
        '&:hover': { boxShadow: 'none' },
      },
      contained: { paddingInline: 20, paddingBlock: 10 },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        boxShadow: mode === 'light' ? softShadowLight : softShadowDark,
        border: mode === 'light' ? '1px solid rgba(26,54,93,0.06)' : '1px solid #2a3f5a',
        backgroundImage: 'none',
        borderRadius: 20,
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: { backgroundImage: 'none' },
      elevation1: {
        boxShadow: mode === 'light' ? softShadowLight : softShadowDark,
      },
    },
  },
  MuiTextField: {
    defaultProps: { variant: 'outlined' },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 14,
        backgroundColor: mode === 'light' ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.03)',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: { borderRadius: 999, fontWeight: 600 },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: { borderRadius: 24 },
    },
  },
  MuiDataGrid: {
    styleOverrides: {
      root: {
        border: 'none',
        width: '100%',
        '--DataGrid-rowBorderColor':
          mode === 'light' ? 'rgba(26,54,93,0.06)' : 'rgba(255,255,255,0.06)',
        '& .MuiDataGrid-main': {
          overflow: 'hidden',
        },
        '& .MuiDataGrid-columnHeaders': {
          borderBottom: mode === 'light' ? '1px solid rgba(26,54,93,0.08)' : '1px solid #2a3f5a',
          backgroundColor: 'transparent',
        },
        '& .MuiDataGrid-columnHeaderTitle': {
          fontWeight: 700,
          fontSize: '0.75rem',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: mode === 'light' ? '#64748b' : '#94a3b8',
        },
        '& .MuiDataGrid-row': {
          '&:hover': {
            backgroundColor: mode === 'light' ? 'rgba(26,54,93,0.04)' : 'rgba(173,199,247,0.08)',
          },
        },
        '& .MuiDataGrid-cell': {
          fontSize: '0.9rem',
          borderTop: 'none',
        },
        '& .MuiDataGrid-footerContainer': {
          borderTop: mode === 'light' ? '1px solid rgba(26,54,93,0.08)' : '1px solid #2a3f5a',
          minHeight: 52,
        },
        '& .MuiDataGrid-virtualScroller': {
          overflowX: 'auto',
        },
      },
    },
  },
});

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a365d',
      light: '#2c5282',
      dark: '#002045',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#c9a227',
      light: '#d4b03a',
      dark: '#a6851f',
      contrastText: '#ffffff',
    },
    error: { main: '#e11d48' },
    success: { main: '#059669' },
    background: {
      default: '#eef2f8',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
    divider: 'rgba(26,54,93,0.1)',
  },
  typography,
  shape,
  components: sharedComponents('light'),
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#adc7f7',
      light: '#d6e3ff',
      dark: '#86a0cd',
      contrastText: '#001b3c',
    },
    secondary: {
      main: '#c9a227',
      light: '#f2bc82',
      dark: '#a6851f',
      contrastText: '#2b1700',
    },
    error: { main: '#fb7185' },
    success: { main: '#34d399' },
    background: {
      default: '#0a1220',
      paper: '#121e30',
    },
    text: {
      primary: '#eaf1ff',
      secondary: '#94a3b8',
    },
    divider: '#243247',
  },
  typography,
  shape,
  components: {
    ...sharedComponents('dark'),
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#121e30',
          color: '#eaf1ff',
        },
      },
    },
  },
});

/** Couleurs de marque hors palette MUI (sidebar navy fixe, login, etc.) */
export const brand = {
  navy: '#002045',
  navyMid: '#1a365d',
  steel: '#3b6090',
  gold: '#c9a227',
  goldMuted: '#c6955e',
  sidebarActive: 'rgba(173, 199, 247, 0.16)',
  softShadowLight,
  softShadowDark,
} as const;
