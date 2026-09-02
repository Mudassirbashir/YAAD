import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  alt?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  email,
  avatarUrl,
  size = 'md',
  className = '',
  onClick,
  alt = 'User avatar',
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-7 h-7',
    xl: 'w-10 h-10',
  };

  // Get initials
  const getInitials = (): string => {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    }
    if (email && email.trim()) {
      return email.substring(0, 2).toUpperCase();
    }
    return '';
  };

  const initials = getInitials();

  return (
    <div
      onClick={onClick}
      className={`rounded-full overflow-hidden flex items-center justify-center font-['Plus_Jakarta_Sans'] font-bold select-none shrink-0 ${
        sizeClasses[size]
      } ${
        avatarUrl
          ? 'bg-surface-container border border-surface-dim'
          : 'bg-primary-container text-on-primary border border-primary/20'
      } ${className}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={alt}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Hide broken image and fallback to initials
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      ) : initials ? (
        <span>{initials}</span>
      ) : (
        <User className={iconSizes[size]} />
      )}
    </div>
  );
};

