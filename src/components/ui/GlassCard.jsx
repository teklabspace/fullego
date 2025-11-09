'use client';
import { useTheme } from '@/context/ThemeContext';

export default function GlassCard({
  children,
  className = '',
  variant = 'default', // 'default', 'dark', 'hover'
}) {
  const { isDarkMode } = useTheme();
  
  const variants = {
    default: isDarkMode ? 'bg-fullego-card' : 'bg-white',
    dark: isDarkMode ? 'bg-fullego-cardDark' : 'bg-gray-50',
    hover: isDarkMode ? 'bg-fullego-cardHover' : 'bg-gray-50',
  };

  return (
    <div
      className={`
        rounded-2xl ${variants[variant]}
        backdrop-blur-md border
        ${isDarkMode ? 'border-fullego-border' : 'border-gray-200'}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

