'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { submitTicketRating } from '@/utils/supportTicketsApi';

/**
 * CSAT rating modal — 1–5 stars + optional comment. Shown for the ticket owner
 * once a ticket is resolved/closed. Feeds the support analytics satisfaction rate.
 */
export default function TicketRatingModal({ isOpen, onClose, ticket, isDarkMode, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isOpen || !ticket) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      toast.info('Please pick a star rating.');
      return;
    }
    setBusy(true);
    try {
      await submitTicketRating(ticket.id, { rating, comment: comment.trim() || undefined });
      toast.success('Thanks for your feedback!');
      onSubmitted?.(ticket.id, rating);
      setRating(0);
      setComment('');
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Failed to submit rating.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className={`rounded-2xl border max-w-md w-full p-6 ${isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'}`}
      >
        <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Rate your support experience
        </h3>
        <p className={`text-xs mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {ticket.subject || 'How did we do?'}
        </p>

        {/* Stars */}
        <div className="flex items-center gap-1 mb-4" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              className="p-1 transition-transform hover:scale-110"
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill={(hover || rating) >= n ? '#F1CB68' : 'none'}
                stroke={(hover || rating) >= n ? '#F1CB68' : isDarkMode ? '#666' : '#bbb'}
                strokeWidth="1.5"
              >
                <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment (optional)…"
          rows={3}
          className={`w-full px-3 py-2 rounded-lg text-sm border resize-none mb-6 focus:outline-none focus:border-[#F1CB68] ${
            isDarkMode
              ? 'bg-white/5 border-[#FFFFFF14] text-white placeholder-gray-500'
              : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
          }`}
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 py-2.5 rounded-lg font-semibold text-sm border transition-colors ${
              isDarkMode ? 'bg-white/5 border-[#FFFFFF14] text-white hover:bg-white/10' : 'bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="flex-1 py-2.5 rounded-lg font-semibold text-sm bg-[#F1CB68] hover:bg-[#BF9B30] text-[#101014] transition-colors disabled:opacity-60"
          >
            {busy ? 'Submitting…' : 'Submit rating'}
          </button>
        </div>
      </form>
    </div>
  );
}
