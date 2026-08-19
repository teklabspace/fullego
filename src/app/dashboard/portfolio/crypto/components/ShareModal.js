'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  createCryptoShare,
  listCryptoShares,
  revokeCryptoShare,
} from '@/utils/portfolioApi';

const EXPIRY_OPTIONS = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
  { label: '1 year', value: 365 },
  { label: 'Never', value: null },
];

/**
 * Create and manage read-only share links for the crypto portfolio.
 *
 * The link resolves anonymously — the access code embedded in it is the only
 * credential — so revoking is the only way to take access back. That makes the
 * existing-links list part of the feature, not a nice-to-have.
 */
export default function ShareModal({ isDarkMode, timeRange, customRange, onClose }) {
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [email, setEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(null);
  const [shares, setShares] = useState([]);
  const [loadingShares, setLoadingShares] = useState(true);

  const loadShares = async () => {
    try {
      const res = await listCryptoShares();
      setShares(Array.isArray(res) ? res : res?.data || res?.shares || []);
    } catch (err) {
      console.error('Error loading share links:', err);
    } finally {
      setLoadingShares(false);
    }
  };

  useEffect(() => {
    loadShares();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const result = await createCryptoShare({
        expiresInDays,
        email: email.trim() || null,
        // Share whatever window the page is currently showing.
        ...(customRange
          ? { startDate: customRange.startDate, endDate: customRange.endDate }
          : { timeRange }),
      });
      setCreated(result);
      toast.success(
        email.trim()
          ? `Share link created and sent to ${email.trim()}.`
          : 'Share link created.'
      );
      loadShares();
    } catch (err) {
      console.error('Error creating share link:', err);
      toast.error(err.data?.detail || err.message || 'Could not create a share link');
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Could not copy — select the link and copy it manually.');
    }
  };

  const handleRevoke = async (shareId) => {
    try {
      await revokeCryptoShare(shareId);
      toast.success('Share link revoked');
      if (created?.id === shareId) setCreated(null);
      loadShares();
    } catch (err) {
      console.error('Error revoking share link:', err);
      toast.error(err.data?.detail || err.message || 'Could not revoke that link');
    }
  };

  const fieldClass = `w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
    isDarkMode
      ? 'bg-[#1A1A1D] border-[#FFFFFF1A] text-white focus:border-[#F1CB68]'
      : 'bg-white border-gray-300 text-gray-900 focus:border-[#F1CB68]'
  }`;
  const mutedClass = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div
      className='fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60'
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border p-6 ${
          isDarkMode ? 'bg-[#18181B] border-[#FFFFFF1A]' : 'bg-white border-gray-200'
        }`}
      >
        <h2
          className={`text-lg font-bold mb-1 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          Share Portfolio
        </h2>
        <p className={`text-sm mb-5 ${mutedClass}`}>
          Creates a read-only link. Anyone who has it can view this snapshot —
          no Akunuba account needed.
        </p>

        {created?.shareLink ? (
          <div className='mb-6'>
            <label
              className={`block text-sm font-medium mb-1.5 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Your share link
            </label>
            <div className='flex gap-2'>
              <input
                readOnly
                value={created.shareLink}
                onFocus={(e) => e.target.select()}
                className={fieldClass}
              />
              <button
                onClick={() => handleCopy(created.shareLink)}
                className='px-4 py-2.5 rounded-lg bg-[#F1CB68] text-[#101014] text-sm font-semibold hover:bg-[#d4b55a] transition-colors flex-shrink-0'
              >
                Copy
              </button>
            </div>
            <button
              onClick={() => setCreated(null)}
              className={`mt-3 text-sm underline ${mutedClass}`}
            >
              Create another link
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className='mb-6'>
            <label
              className={`block text-sm font-medium mb-1.5 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Expires after
            </label>
            <select
              value={String(expiresInDays)}
              onChange={(e) =>
                setExpiresInDays(
                  e.target.value === 'null' ? null : Number(e.target.value)
                )
              }
              className={`${fieldClass} mb-4`}
            >
              {EXPIRY_OPTIONS.map((o) => (
                <option key={String(o.value)} value={String(o.value)}>
                  {o.label}
                </option>
              ))}
            </select>

            <label
              className={`block text-sm font-medium mb-1.5 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Email it to someone{' '}
              <span className={`font-normal ${mutedClass}`}>(optional)</span>
            </label>
            <input
              type='email'
              placeholder='name@example.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
            />

            <button
              type='submit'
              disabled={creating}
              className='w-full mt-5 px-4 py-2.5 rounded-lg bg-[#F1CB68] text-[#101014] text-sm font-semibold hover:bg-[#d4b55a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {creating ? 'Generating…' : 'Generate link'}
            </button>
          </form>
        )}

        {/* Existing links — revoking is the only way to withdraw access */}
        <div className={`pt-5 border-t ${isDarkMode ? 'border-[#FFFFFF1A]' : 'border-gray-200'}`}>
          <p
            className={`text-xs font-medium uppercase tracking-wide mb-3 ${mutedClass}`}
          >
            Active links
          </p>
          {loadingShares ? (
            <p className={`text-sm ${mutedClass}`}>Loading…</p>
          ) : shares.length === 0 ? (
            <p className={`text-sm ${mutedClass}`}>
              You haven’t shared this portfolio yet.
            </p>
          ) : (
            <ul className='space-y-2'>
              {shares.map((s) => (
                <li
                  key={s.id}
                  className='flex items-center justify-between gap-3 text-sm'
                >
                  <div className='min-w-0'>
                    <p
                      className={`truncate ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {s.email || s.sharedWith || 'Link only'}
                    </p>
                    <p className={`text-xs ${mutedClass}`}>
                      {s.expiresAt
                        ? `Expires ${new Date(s.expiresAt).toLocaleDateString()}`
                        : 'Never expires'}
                    </p>
                  </div>
                  <div className='flex items-center gap-2 flex-shrink-0'>
                    {s.shareLink && (
                      <button
                        onClick={() => handleCopy(s.shareLink)}
                        className={`px-2.5 py-1 rounded text-xs ${
                          isDarkMode
                            ? 'bg-[#2C2C2E] text-gray-300 hover:bg-[#3C3C3E]'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Copy
                      </button>
                    )}
                    <button
                      onClick={() => handleRevoke(s.id)}
                      className='px-2.5 py-1 rounded text-xs text-red-500 hover:bg-red-500/10'
                    >
                      Revoke
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={onClose}
          className={`w-full mt-6 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isDarkMode
              ? 'bg-[#2C2C2E] text-gray-300 hover:bg-[#3C3C3E]'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Close
        </button>
      </div>
    </div>
  );
}
