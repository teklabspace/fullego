'use client';
import { useEffect, useRef, useState } from 'react';

// Fully custom themed dropdown (dark + gold, matching the dashboard form
// fields). A native <select> pops an OS-rendered list that can't be styled or
// positioned, so this renders its own option panel — always anchored BELOW the
// trigger (top-full), never flipped above it.
//
// Emits onChange({ target: { name, value } }) so existing handleChange
// handlers written for native inputs keep working unchanged.
//
// With allowCustom, the panel gets a footer input so the user can enter a
// value that isn't in the suggestions — the options act as a starting point,
// not an enum. The trigger renders such a value even though no option matches.
export default function DropdownSelect({
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  disabled = false,
  allowCustom = false,
  customPlaceholder = 'Add your own...',
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const [customText, setCustomText] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = e => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = e => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const selected =
    options.find(opt => opt.value === value) ||
    (allowCustom && value ? { value, label: value } : undefined);

  const handleSelect = optionValue => {
    onChange({ target: { name, value: optionValue } });
    setOpen(false);
  };

  const addCustom = () => {
    const custom = customText.trim();
    if (!custom) return;
    setCustomText('');
    handleSelect(custom);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type='button'
        disabled={disabled}
        onClick={() => setOpen(prev => !prev)}
        className={`w-full px-4 py-3 rounded-lg bg-[#2A2A2D] border text-left flex items-center justify-between gap-2 transition-colors focus:outline-none focus:border-[#F1CB68] disabled:opacity-50 disabled:cursor-not-allowed ${
          open ? 'border-[#F1CB68]' : 'border-[#FFFFFF14]'
        }`}
      >
        <span className={`truncate ${selected ? 'text-white' : 'text-gray-500'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          width='16'
          height='16'
          viewBox='0 0 24 24'
          fill='none'
          stroke='#F1CB68'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className={`flex-shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        >
          <path d='M6 9l6 6 6-6' />
        </svg>
      </button>

      {open && (
        <div className='absolute left-0 right-0 top-full mt-2 z-50 rounded-xl border border-[#FFFFFF14] bg-[#232227] shadow-2xl shadow-black/50 overflow-hidden'>
          <ul className='max-h-60 overflow-y-auto py-1' role='listbox'>
            {options.map(option => {
              const isSelected = option.value === value;
              return (
                <li key={option.value} role='option' aria-selected={isSelected}>
                  <button
                    type='button'
                    onClick={() => handleSelect(option.value)}
                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between gap-2 transition-colors ${
                      isSelected
                        ? 'text-[#F1CB68] bg-[#F1CB68]/10'
                        : 'text-white hover:bg-[#F1CB68]/10 hover:text-[#F1CB68]'
                    }`}
                  >
                    <span className='truncate'>{option.label}</span>
                    {isSelected && (
                      <svg
                        width='14'
                        height='14'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='flex-shrink-0'
                      >
                        <path d='M20 6L9 17l-5-5' />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          {allowCustom && (
            <div className='border-t border-[#FFFFFF14] p-2 flex items-center gap-2'>
              <input
                type='text'
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustom();
                  }
                }}
                placeholder={customPlaceholder}
                className='flex-1 min-w-0 px-3 py-2 rounded-lg bg-[#2A2A2D] border border-[#FFFFFF14] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors'
              />
              <button
                type='button'
                onClick={addCustom}
                disabled={!customText.trim()}
                className='px-3 py-2 rounded-lg bg-[#F1CB68] text-[#111116] text-sm font-semibold hover:bg-[#e6be5a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
              >
                Add
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
