import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement>;

function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface)] p-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ className, children, ...props }: CardProps) {
  return (
    <div className={cn('mb-3 flex items-center justify-between', className)} {...props}>
      {children}
    </div>
  );
}

function CardTitle({ className, children, ...props }: CardProps) {
  return (
    <h3
      className={cn('text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

function CardContent({ className, children, ...props }: CardProps) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
}

export { Card, CardHeader, CardTitle, CardContent };
