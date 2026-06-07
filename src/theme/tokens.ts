// Design tokens exported as TS constants for the few places that need
// color values in JavaScript (status badges, charts, map markers, etc.).
// These mirror the CSS variables defined in `globals.css`. Prefer Tailwind
// utility classes in components; use these only when a raw value is required.

export const brand = {
  primary: '#4f46e5',
  primaryHover: '#4338ca',
  secondary: '#7c3aed',
  secondaryHover: '#6d28d9',
  accent: '#10b981',
  accentHover: '#059669',
} as const;

export const status = {
  error: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
  info: '#3b82f6',
} as const;

// Maps a meeting-request status to its semantic color + Tailwind classes.
export type RequestStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'COMPLETED'
  | string;

export const statusBadgeClasses: Record<string, string> = {
  PENDING: 'bg-warning/15 text-warning',
  ACCEPTED: 'bg-info/15 text-info',
  DECLINED: 'bg-error/15 text-error',
  COMPLETED: 'bg-success/15 text-success',
};

export function getStatusBadgeClass(s: RequestStatus): string {
  return statusBadgeClasses[s] || 'bg-surface-muted text-muted-foreground';
}

export const radius = {
  sm: '0.375rem',
  md: '0.625rem',
  lg: '0.875rem',
  xl: '1.25rem',
} as const;
