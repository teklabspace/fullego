'use client';
import { useTheme } from '@/context/ThemeContext';

export default function GlassCard({
  children,
  className = '',
  variant = 'default', // 'default', 'dark', 'hover'
}) {
  const { isDarkMode } = useTheme();
  
  const variants = {
    default: isDarkMode ? 'bg-akunuba-card' : 'bg-white',
    dark: isDarkMode ? 'bg-akunuba-cardDark' : 'bg-gray-50',
    hover: isDarkMode ? 'bg-akunuba-cardHover' : 'bg-gray-50',
  };

  return (
    <div
      className={`
        rounded-2xl ${variants[variant]}
        backdrop-blur-md border
        ${isDarkMode ? 'border-akunuba-border' : 'border-gray-200'}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

