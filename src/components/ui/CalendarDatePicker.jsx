'use client';
import { useEffect, useRef, useState } from 'react';

// Fully custom themed date picker (dark + gold, matching the dashboard form
// fields). The native <input type="date"> calendar is OS-rendered — it can't
// be styled and Chrome may open it above the field — so this renders its own
// calendar panel, always anchored BELOW the trigger (top-full).
//
// Works on YYYY-MM-DD strings throughout (value, min, max) so there is no
// timezone drift. min/max are enforced by disabling out-of-range days and
// bounding month/year navigation.
//
// Emits onChange({ target: { name, value } }) so existing handleChange
// handlers written for native inputs keep working unchanged.

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const pad = n => String(n).padStart(2, '0');
const toISO = (year, monthIndex, day) => `${year}-${pad(monthIndex + 1)}-${pad(day)}`;

export default function CalendarDatePicker({
  name,
  value,
  onChange,
  min = '1900-01-01',
  max = '2100-12-31',
  placeholder = 'Select date',
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('days'); // 'days' | 'years'
  const containerRef = useRef(null);
  const yearListRef = useRef(null);

  const todayISO = new Date().toLocaleDateString('en-CA');
  const minYear = Number(min.slice(0, 4));
  const maxYear = Number(max.slice(0, 4));

  // The month currently shown in the panel, independent of the selected value.
  const [viewYear, setViewYear] = useState(0);
  const [viewMonth, setViewMonth] = useState(0);

  const openPanel = () => {
    // Start on the selected date's month, else today's (clamped into min/max
    // so a past-only field whose max is today never opens on a dead month).
    const source =
      value || (todayISO > max ? max : todayISO < min ? min : todayISO);
    const [y, m] = source.split('-').map(Number);
    setViewYear(y);
    setViewMonth(m - 1);
    setView('days');
    setOpen(true);
  };

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

  // When the year list opens, bring the active year into view.
  useEffect(() => {
    if (view === 'years' && yearListRef.current) {
      const active = yearListRef.current.querySelector('[data-active="true"]');
      if (active) active.scrollIntoView({ block: 'center' });
    }
  }, [view]);

  const selectDate = iso => {
    onChange({ target: { name, value: iso } });
    setOpen(false);
  };

  // Month navigation, bounded so the panel can't scroll past min/max.
  const monthIndexAbs = viewYear * 12 + viewMonth;
  const minMonthAbs = minYear * 12 + Number(min.slice(5, 7)) - 1;
  const maxMonthAbs = maxYear * 12 + Number(max.slice(5, 7)) - 1;
  const goToMonth = abs => {
    setViewYear(Math.floor(abs / 12));
    setViewMonth(abs % 12);
  };

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const displayValue = value
    ? (() => {
        const [y, m, d] = value.split('-').map(Number);
        return `${MONTHS[m - 1].slice(0, 3)} ${d}, ${y}`;
      })()
    : '';

  const years = [];
  for (let y = minYear; y <= maxYear; y++) years.push(y);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type='button'
        onClick={() => (open ? setOpen(false) : openPanel())}
        className={`w-full px-4 py-3 rounded-lg bg-[#2A2A2D] border text-left flex items-center justify-between gap-2 transition-colors focus:outline-none focus:border-[#F1CB68] ${
          open ? 'border-[#F1CB68]' : 'border-[#FFFFFF14]'
        }`}
      >
        <span className={`truncate ${value ? 'text-white' : 'text-gray-500'}`}>
          {displayValue || placeholder}
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
          className='flex-shrink-0'
        >
          <rect x='3' y='4' width='18' height='18' rx='2' />
          <path d='M16 2v4M8 2v4M3 10h18' />
        </svg>
      </button>

      {open && (
        <div className='absolute left-0 top-full mt-2 z-50 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-[#FFFFFF14] bg-[#232227] shadow-2xl shadow-black/50 p-3'>
          {/* Header: month/year label toggles the year list */}
          <div className='flex items-center justify-between mb-2'>
            <button
              type='button'
              onClick={() => goToMonth(monthIndexAbs - 1)}
              disabled={monthIndexAbs <= minMonthAbs}
              className='p-1.5 rounded-lg text-gray-400 hover:text-[#F1CB68] hover:bg-[#F1CB68]/10 transition-colors disabled:opacity-30 disabled:pointer-events-none'
              aria-label='Previous month'
            >
              <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M15 18l-6-6 6-6' />
              </svg>
            </button>
            <button
              type='button'
              onClick={() => setView(view === 'years' ? 'days' : 'years')}
              className='px-3 py-1 rounded-lg text-sm font-semibold text-white hover:text-[#F1CB68] hover:bg-[#F1CB68]/10 transition-colors flex items-center gap-1'
            >
              {MONTHS[viewMonth]} {viewYear}
              <svg
                width='12'
                height='12'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#F1CB68'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className={`transition-transform ${view === 'years' ? 'rotate-180' : ''}`}
              >
                <path d='M6 9l6 6 6-6' />
              </svg>
            </button>
            <button
              type='button'
              onClick={() => goToMonth(monthIndexAbs + 1)}
              disabled={monthIndexAbs >= maxMonthAbs}
              className='p-1.5 rounded-lg text-gray-400 hover:text-[#F1CB68] hover:bg-[#F1CB68]/10 transition-colors disabled:opacity-30 disabled:pointer-events-none'
              aria-label='Next month'
            >
              <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M9 18l6-6-6-6' />
              </svg>
            </button>
          </div>

          {view === 'years' ? (
            <div ref={yearListRef} className='grid grid-cols-4 gap-1 max-h-56 overflow-y-auto pr-1'>
              {years.map(year => {
                const isActive = year === viewYear;
                return (
                  <button
                    key={year}
                    type='button'
                    data-active={isActive}
                    onClick={() => {
                      // Clamp the month so landing on the min/max year can't
                      // show a month entirely outside the allowed range.
                      const abs = Math.min(
                        Math.max(year * 12 + viewMonth, minMonthAbs),
                        maxMonthAbs
                      );
                      goToMonth(abs);
                      setView('days');
                    }}
                    className={`py-1.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-[#F1CB68] text-[#111116] font-semibold'
                        : 'text-white hover:bg-[#F1CB68]/10 hover:text-[#F1CB68]'
                    }`}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          ) : (
            <>
              <div className='grid grid-cols-7 mb-1'>
                {WEEKDAYS.map(day => (
                  <div
                    key={day}
                    className='h-8 flex items-center justify-center text-xs font-medium text-gray-500'
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div className='grid grid-cols-7'>
                {Array.from({ length: firstWeekday }).map((_, i) => (
                  <div key={`blank-${i}`} className='h-9' />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const iso = toISO(viewYear, viewMonth, day);
                  const isDisabled = iso < min || iso > max;
                  const isSelected = iso === value;
                  const isToday = iso === todayISO;
                  return (
                    <button
                      key={iso}
                      type='button'
                      disabled={isDisabled}
                      onClick={() => selectDate(iso)}
                      className={`h-9 w-9 mx-auto rounded-full text-sm flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-[#F1CB68] text-[#111116] font-semibold'
                          : isDisabled
                          ? 'text-gray-600 cursor-not-allowed'
                          : `text-white hover:bg-[#F1CB68]/15 hover:text-[#F1CB68] ${
                              isToday ? 'border border-[#F1CB68]/60 text-[#F1CB68]' : ''
                            }`
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              <div className='flex items-center justify-between mt-2 pt-2 border-t border-[#FFFFFF14]'>
                <button
                  type='button'
                  onClick={() => selectDate('')}
                  className='px-3 py-1 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors'
                >
                  Clear
                </button>
                <button
                  type='button'
                  disabled={todayISO < min || todayISO > max}
                  onClick={() => selectDate(todayISO)}
                  className='px-3 py-1 rounded-lg text-xs font-medium text-[#F1CB68] hover:bg-[#F1CB68]/10 transition-colors disabled:opacity-30 disabled:pointer-events-none'
                >
                  Today
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
