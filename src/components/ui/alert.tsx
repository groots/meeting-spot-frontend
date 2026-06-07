import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

import { cn } from '@/lib/utils';

const alertVariants = cva('relative w-full rounded-lg border p-4 text-sm flex gap-3', {
  variants: {
    variant: {
      info: 'border-info/30 bg-info/10 text-info',
      success: 'border-success/30 bg-success/10 text-success',
      warning: 'border-warning/30 bg-warning/10 text-warning',
      error: 'border-error/30 bg-error/10 text-error',
      neutral: 'border-border bg-surface-muted text-foreground',
    },
  },
  defaultVariants: {
    variant: 'info',
  },
});

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
  neutral: Info,
} as const;

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  onDismiss?: () => void;
  hideIcon?: boolean;
}

function Alert({
  className,
  variant = 'info',
  title,
  onDismiss,
  hideIcon = false,
  children,
  ...props
}: AlertProps) {
  const Icon = icons[variant || 'info'];
  return (
    <div role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      {!hideIcon && <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />}
      <div className="flex-1">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        {children && <div className="text-foreground/80">{children}</div>}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 opacity-70 hover:opacity-100"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export { Alert, alertVariants };
