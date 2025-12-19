export default function GradientButton({
  children,
  onClick,
  className = '',
  fullWidth = false,
  disabled = false,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${fullWidth ? 'w-full' : ''}
        text-akunuba-dark cursor-pointer font-semibold 
        px-8 md:px-12 py-3 md:py-4 rounded-full 
        transition-all text-base md:text-lg 
        shadow-lg hover:shadow-xl transform hover:scale-105
        disabled:opacity-50 disabled:cursor-not-allowed
        bg-gradient-gold
        ${className}
      `}
    >
      {children}
    </button>
  );
}

