import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export function Card({ children, className, padding = 'md', hover = false }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-lg shadow animate-fade-in',
        {
          'p-0': padding === 'none',
          'p-3 sm:p-4': padding === 'sm',
          'p-4 sm:p-6': padding === 'md',
          'p-6 sm:p-8': padding === 'lg',
          'hover:shadow-md transition-all duration-200': hover,
        },
        className
      )}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ title, value, icon, color = 'primary', trend }: StatCardProps) {
  const colorClasses = {
    primary: 'text-primary-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    info: 'text-blue-600',
  };

  return (
    <Card hover>
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className={clsx('text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2', colorClasses[color])}>{value}</p>
          {trend && (
            <p
              className={clsx(
                'text-xs sm:text-sm mt-1 sm:mt-2',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && <div className={clsx('text-2xl sm:text-3xl md:text-4xl flex-shrink-0', colorClasses[color])}>{icon}</div>}
      </div>
    </Card>
  );
}
