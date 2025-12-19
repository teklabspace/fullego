export default function OutlineButton({
  children,
  onClick,
  className = '',
  fullWidth = false,
  variant = 'gold', // 'gold' or 'gray'
}) {
  const variants = {
    gold: 'border-akunuba-gold text-akunuba-gold hover:bg-akunuba-gold hover:text-akunuba-dark',
    gray: 'border-gray-700 hover:border-gray-600 text-white',
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${fullWidth ? 'w-full' : ''}
        bg-transparent border-2 ${variants[variant]}
        font-semibold px-6 md:px-8 py-3 md:py-4 rounded-full 
        transition-all text-base md:text-lg
        ${className}
      `}
    >
      {children}
    </button>
  );
}

