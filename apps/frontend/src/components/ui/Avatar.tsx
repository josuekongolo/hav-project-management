import { User } from 'lucide-react';
import clsx from 'clsx';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, alt, name, size = 'md', className }: AvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
  };

  const iconSizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8',
  };

  return (
    <div
      className={clsx(
        'rounded-full flex items-center justify-center overflow-hidden',
        sizeClasses[size],
        !src && 'bg-primary-100',
        className
      )}
    >
      {src ? (
        <img src={src} alt={alt || name || 'Avatar'} className="h-full w-full object-cover" />
      ) : name ? (
        <span className="font-medium text-primary-700">{getInitials(name)}</span>
      ) : (
        <User className={clsx('text-primary-700', iconSizes[size])} />
      )}
    </div>
  );
}

interface AvatarGroupProps {
  users: Array<{
    id: string;
    name: string;
    avatar?: string | null;
  }>;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function AvatarGroup({ users, max = 3, size = 'md' }: AvatarGroupProps) {
  const displayUsers = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <div className="flex -space-x-2">
      {displayUsers.map((user) => (
        <Avatar
          key={user.id}
          src={user.avatar}
          name={user.name}
          size={size}
          className="ring-2 ring-white"
        />
      ))}
      {remaining > 0 && (
        <div
          className={clsx(
            'rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-white',
            size === 'xs' && 'h-6 w-6 text-xs',
            size === 'sm' && 'h-8 w-8 text-sm',
            size === 'md' && 'h-10 w-10 text-base',
            size === 'lg' && 'h-12 w-12 text-lg',
            size === 'xl' && 'h-16 w-16 text-xl'
          )}
        >
          <span className="font-medium text-gray-600">+{remaining}</span>
        </div>
      )}
    </div>
  );
}
