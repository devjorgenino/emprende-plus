export const colors = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  secondary: '#10B981',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  error: '#EF4444',
  border: '#E5E7EB',
} as const;

export const darkColors = {
  primary: '#818CF8',
  primaryDark: '#6366F1',
  secondary: '#34D399',
  background: '#111827',
  surface: '#1F2937',
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  error: '#F87171',
  border: '#374151',
} as const;

export type ColorKey = keyof typeof colors;
