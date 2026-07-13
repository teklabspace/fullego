'use client';

// Circular user avatar. Shows the profile image when a URL exists, otherwise
// the user's initials on the gold brand background, otherwise the generic
// placeholder icon. Plain <img> — image optimization is disabled anyway
// (static export), and remote avatar URLs come from the backend.
export default function UserAvatar({ src, name = '', size = 40, className = '' }) {
  const initials = String(name)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');

  return (
    <div
      className={`rounded-full overflow-hidden bg-[#F1CB68] flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img
          src={src}
          alt={name || 'User'}
          className='w-full h-full object-cover'
        />
      ) : initials ? (
        <span
          className='font-semibold text-[#111116] select-none'
          style={{ fontSize: Math.round(size * 0.38) }}
        >
          {initials}
        </span>
      ) : (
        <img
          src='/icons/user-avatar.svg'
          alt='User'
          className='w-full h-full object-cover'
        />
      )}
    </div>
  );
}
