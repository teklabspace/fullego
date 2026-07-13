'use client';
import { useState } from 'react';

// Chip-style tags editor (dark + gold, matching the dashboard form fields).
// The user types a tag, clicks "Add Tag" (or presses Enter), and it becomes a
// removable chip. Duplicates are ignored case-insensitively.
//
// Emits onChange({ target: { name, value: string[] } }) so existing
// handleChange handlers written for native inputs keep working unchanged.
export default function TagsInput({
  name,
  value,
  onChange,
  placeholder = 'Type a tag',
  className = '',
}) {
  const [draft, setDraft] = useState('');
  const tags = Array.isArray(value) ? value : value ? [value] : [];

  const addTag = () => {
    const tag = draft.trim();
    if (!tag) return;
    if (tags.some(t => t.toLowerCase() === tag.toLowerCase())) {
      setDraft('');
      return;
    }
    onChange({ target: { name, value: [...tags, tag] } });
    setDraft('');
  };

  const removeTag = tag => {
    onChange({ target: { name, value: tags.filter(t => t !== tag) } });
  };

  return (
    <div className={className}>
      {tags.length > 0 && (
        <div className='flex flex-wrap gap-2 mb-3'>
          {tags.map(tag => (
            <span
              key={tag}
              className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F1CB68]/10 border border-[#F1CB68]/30 text-sm text-[#F1CB68]'
            >
              {tag}
              <button
                type='button'
                onClick={() => removeTag(tag)}
                aria-label={`Remove ${tag}`}
                className='text-[#F1CB68]/70 hover:text-white transition-colors'
              >
                <svg
                  width='12'
                  height='12'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2.5'
                  strokeLinecap='round'
                >
                  <path d='M18 6L6 18M6 6l12 12' />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
      <div className='flex gap-2'>
        <input
          type='text'
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder}
          className='flex-1 min-w-0 px-4 py-3 rounded-lg bg-[#2A2A2D] border border-[#FFFFFF14] text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors'
        />
        <button
          type='button'
          onClick={addTag}
          disabled={!draft.trim()}
          className='px-4 py-3 rounded-lg bg-[#F1CB68] text-[#111116] text-sm font-semibold hover:bg-[#e6be5a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap'
        >
          Add Tag
        </button>
      </div>
    </div>
  );
}
