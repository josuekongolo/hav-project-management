import { ReactNode } from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Badge({ children, variant = 'primary', size = 'md', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        {
          'bg-primary-100 text-primary-700': variant === 'primary',
          'bg-gray-100 text-gray-700': variant === 'secondary',
          'bg-green-100 text-green-700': variant === 'success',
          'bg-yellow-100 text-yellow-700': variant === 'warning',
          'bg-red-100 text-red-700': variant === 'danger',
          'bg-blue-100 text-blue-700': variant === 'info',
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-2.5 py-1 text-sm': size === 'md',
          'px-3 py-1.5 text-base': size === 'lg',
        },
        className
      )}
    >
      {children}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  size?: 'sm' | 'md' | 'lg';
}

export function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
  const config = {
    LOW: { variant: 'success' as const, label: 'Low' },
    MEDIUM: { variant: 'warning' as const, label: 'Medium' },
    HIGH: { variant: 'danger' as const, label: 'High' },
    URGENT: { variant: 'danger' as const, label: 'Urgent' },
  };

  const { variant, label } = config[priority];

  return (
    <Badge variant={variant} size={size}>
      {label}
    </Badge>
  );
}

interface StatusBadgeProps {
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = {
    TODO: { variant: 'secondary' as const, label: 'To Do' },
    IN_PROGRESS: { variant: 'info' as const, label: 'In Progress' },
    IN_REVIEW: { variant: 'warning' as const, label: 'In Review' },
    DONE: { variant: 'success' as const, label: 'Done' },
  };

  const { variant, label } = config[status];

  return (
    <Badge variant={variant} size={size}>
      {label}
    </Badge>
  );
}
