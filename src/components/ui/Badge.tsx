import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'emerald' | 'blue' | 'purple' | 'red' | 'zinc';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'gold', className }) => {
  const styles = {
    gold: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    red: 'bg-red-500/10 text-red-400 border-red-500/30',
    zinc: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
