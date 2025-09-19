import type { FC, HTMLAttributes } from 'react';

import { cn } from '@lib/utils/cn';

type Variant = 'default' | 'success' | 'warning' | 'secondary';

const variantStyles: Record<Variant, string> = {
  default: 'bg-slate-900 text-white',
  success: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  warning: 'bg-amber-100 text-amber-700 border border-amber-200',
  secondary: 'bg-slate-100 text-slate-700 border border-slate-200',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export const Badge: FC<BadgeProps> = ({ className, variant = 'default', ...props }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
      variantStyles[variant],
      className,
    )}
    {...props}
  />
);
