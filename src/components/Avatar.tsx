import React, { useState } from 'react';
import { User } from 'lucide-react';
import { parseAvatarValue, getAvatarColorOption } from '../data/avatarData';

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
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  const emojiSizes = {
    sm: 'text-sm leading-none',
    md: 'text-lg sm:text-xl leading-none',
    lg: 'text-2xl sm:text-3xl leading-none',
    xl: 'text-4xl sm:text-5xl leading-none',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-7 h-7',
    xl: 'w-10 h-10',
  };

  const parsed = parseAvatarValue(avatarUrl);
  const colorOption = getAvatarColorOption(parsed.bgId);

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

  // If emoji avatar
  if (parsed.isEmoji && parsed.emoji) {
    return (
      <div
        onClick={onClick}
        className={`rounded-full overflow-hidden flex items-center justify-center select-none shrink-0 border transition-transform duration-200 ${
          sizeClasses[size]
        } ${colorOption.bgClass} ${colorOption.borderClass} ${className}`}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={alt}
      >
        <span
          className={`flex items-center justify-center transform hover:scale-110 transition-transform ${emojiSizes[size]}`}
          role="img"
          aria-label={parsed.emoji}
        >
          {parsed.emoji}
        </span>
      </div>
    );
  }

  // If photo URL and no loading error
  if (parsed.isImageUrl && parsed.imageUrl && !imageError) {
    return (
      <div
        onClick={onClick}
        className={`rounded-full overflow-hidden flex items-center justify-center font-['Plus_Jakarta_Sans'] font-bold select-none shrink-0 bg-surface-container border border-surface-dim ${
          sizeClasses[size]
        } ${className}`}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={alt}
      >
        <img
          src={parsed.imageUrl}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Fallback: initials or user icon
  return (
    <div
      onClick={onClick}
      className={`rounded-full overflow-hidden flex items-center justify-center font-['Plus_Jakarta_Sans'] font-bold select-none shrink-0 bg-primary-container text-on-primary border border-primary/20 ${
        sizeClasses[size]
      } ${className}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={alt}
    >
      {initials ? (
        <span>{initials}</span>
      ) : (
        <User className={iconSizes[size]} />
      )}
    </div>
  );
};


