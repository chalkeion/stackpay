'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'accent' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg-base)] disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
      default:
        'bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--bg-border)] hover:border-[var(--accent)] hover:bg-[var(--bg-elevated)]',
      accent:
        'bg-[var(--accent)] text-white hover:shadow-[0_0_20px_var(--accent-glow),0_0_40px_var(--accent-glow)] hover:brightness-110',
      ghost:
        'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]',
      outline:
        'border border-[var(--bg-border)] text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)]',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className={cn(base, variants[variant], sizes[size], className)}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';

export { Button };
