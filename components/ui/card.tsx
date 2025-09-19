import { forwardRef, type FC, type HTMLAttributes } from 'react';

import { cn } from '@lib/utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm',
      className,
    )}
    {...props}
  />
));
Card.displayName = 'Card';

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}
export const CardHeader: FC<CardHeaderProps> = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
);

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}
export const CardTitle: FC<CardTitleProps> = ({ className, ...props }) => (
  <h3 className={cn('text-xl font-semibold leading-none tracking-tight', className)} {...props} />
);

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}
export const CardDescription: FC<CardDescriptionProps> = ({ className, ...props }) => (
  <p className={cn('text-sm text-slate-500', className)} {...props} />
);

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}
export const CardContent: FC<CardContentProps> = ({ className, ...props }) => (
  <div className={cn('p-6 pt-0', className)} {...props} />
);
