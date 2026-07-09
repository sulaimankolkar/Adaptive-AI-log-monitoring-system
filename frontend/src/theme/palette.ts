export const palette = {
  // Background colors
  background: '#0B1220',
  surface: '#182235',
  surfaceHover: '#1E2A45',
  
  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  
  // Primary brand color
  primary: '#6366F1',
  primaryHover: '#818CF8',
  primaryLight: '#4F46E5',
  
  // Semantic colors
  success: '#10B981',
  successLight: '#34D399',
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  error: '#EF4444',
  errorLight: '#F87171',
  
  // Border colors
  border: '#2D3748',
  borderLight: '#4A5568',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.6)',
  
  // Shadow
  shadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  shadowLg: '0 4px 8px rgba(0, 0, 0, 0.15)',
} as const;

export type Palette = typeof palette;
