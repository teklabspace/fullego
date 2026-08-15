'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import {
  cancelAdvisorRequest,
  getAdvisorDirectory,
  getMyAdvisorRequests,
  listDelegationGrants,
  lockDelegationGrant,
  requestAdvisor,
  revokeDelegationGrant,
} from '@/utils/delegationApi';

// Shared badge palette for both request status and grant status.
const STATUS_STYLES = {
  pending: 'bg-amber-500/10 text-amber-500',
  approved: 'bg-emerald-500/10 text-emerald-500',
  rejected: 'bg-red-500/10 text-red-500',
  cancelled: 'bg-gray-500/10 text-gray-400',
  active: 'bg-emerald-500/10 text-emerald-500',
  consumed: 'bg-blue-500/10 text-blue-400',
  revoked: 'bg-gray-500/10 text-gray-400',
  expired: 'bg-gray-500/10 text-gray-400',
};

const Badge = ({ status }) => (
  <span
    className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
      STATUS_STYLES[status] || STATUS_STYLES.cancelled
    }`}
  >
    {status}
  </span>
);

const fmt = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function MyAdvisorPage() {
  const { isDarkMode } = useTheme();
  const { isInvestor, mounted } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [currentAdvisor, setCurrentAdvisor] = useState(null);
  const [requests, setRequests] = useState([]);
  const [grants, setGrants] = useState([]);
  const [directory, setDirectory] = useState([]);
  const [advisorId, setAdvisorId] = useState('');
  const [note, setNote] = useState('');

  // Assets are investor-owned, so delegation is an investor-only surface.
  useEffect(() => {
    if (mounted && !isInvestor) router.replace('/dashboard');
  }, [mounted, isInvestor, router]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [mine, dir, myGrants] = await Promise.all([
        getMyAdvisorRequests(),
        getAdvisorDirectory().catch(() => []),
        listDelegationGrants('investor').catch(() => []),
      ]);
      setCurrentAdvisor(mine.currentAdvisor);
      setRequests(mine.requests);
      setDirectory(dir);
      setGrants(myGrants);
    } catch (err) {
      toast.error(err?.message || 'Could not load your advisor details.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted && isInvestor) load();
  }, [load, mounted, isInvestor]);

  if (!mounted || !isInvestor) return null;

  const cardCls = `rounded-2xl border p-5 ${
    isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
  }`;
  const textMain = isDarkMode ? 'text-white' : 'text-gray-900';
  const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const divide = isDarkMode ? 'divide-[#FFFFFF14]' : 'divide-gray-100';
  const inputCls = `mt-1 w-full rounded-lg border px-3 py-2 text-sm ${
    isDarkMode
      ? 'bg-transparent border-[#FFFFFF14] text-white'
      : 'bg-white border-gray-300 text-gray-900'
  }`;
  const ghostBtn = `rounded-lg border px-3 py-1.5 text-sm transition-colors ${
    isDarkMode
      ? 'border-[#FFFFFF14] text-gray-200 hover:bg-white/5'
      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
  }`;

  const pending = requests.find((r) => r.status === 'pending');

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await requestAdvisor({ advisorId: advisorId || null, note });
      toast.success('Request sent. An admin will review it shortly.');
      setAdvisorId('');
      setNote('');
      await load();
    } catch (err) {
      toast.error(err?.message || 'Could not send your request.');
    } finally {
      setSubmitting(false);
    }
  };

  const withdrawRequest = async (id) => {
    setBusyId(id);
    try {
      await cancelAdvisorRequest(id);
      toast.success('Request withdrawn.');
      await load();
    } catch (err) {
      toast.error(err?.message || 'Could not withdraw the request.');
    } finally {
      setBusyId(null);
    }
  };

  const revoke = async (id) => {
    setBusyId(id);
    try {
      await revokeDelegationGrant(id);
      toast.success('Authorisation withdrawn.');
      await load();
    } catch (err) {
      toast.error(err?.message || 'Could not withdraw the authorisation.');
    } finally {
      setBusyId(null);
    }
  };

  // Ends the advisor's edit window on the asset they added for you.
  const confirmAndLock = async (id) => {
    setBusyId(id);
    try {
      await lockDelegationGrant(id);
      toast.success('Asset confirmed. Your advisor can no longer edit it.');
      await load();
    } catch (err) {
      toast.error(err?.message || 'Could not confirm the asset.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className={`space-y-6 p-6 ${textMain}`}>
      <header>
        <h1 className="text-2xl font-semibold">My Advisor</h1>
        <p className={`mt-1 text-sm ${textMuted}`}>
          Request an advisor to add assets on your behalf, and control what they can do.
        </p>
      </header>

      <section className={cardCls}>
        <h2 className={`text-sm font-medium uppercase tracking-wide ${textMuted}`}>
          Current advisor
        </h2>
        {loading ? (
          <div className={`mt-3 h-10 w-56 animate-pulse rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
        ) : currentAdvisor ? (
          <div className="mt-3">
            <p className="font-medium">{currentAdvisor.name}</p>
            <p className={`text-sm ${textMuted}`}>{currentAdvisor.email}</p>
          </div>
        ) : (
          <p className={`mt-3 text-sm ${textMuted}`}>
            You don&apos;t have an advisor yet. Request one below.
          </p>
        )}
      </section>

      <section className={cardCls}>
        <h2 className={`text-sm font-medium uppercase tracking-wide ${textMuted}`}>
          Request an advisor
        </h2>
        {loading ? null : pending ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
            <p className={`text-sm ${textMuted}`}>Your request is awaiting admin review.</p>
            <button
              type="button"
              disabled={busyId === pending.id}
              onClick={() => withdrawRequest(pending.id)}
              className={`${ghostBtn} disabled:opacity-50`}
            >
              Withdraw
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-3 space-y-3">
            <label className="block text-sm">
              <span className={textMuted}>Advisor you spoke with (optional)</span>
              <select
                value={advisorId}
                onChange={(e) => setAdvisorId(e.target.value)}
                className={inputCls}
              >
                <option value="">I&apos;m not sure — let the admin decide</option>
                {directory.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className={textMuted}>Anything the admin should know (optional)</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="e.g. Spoke with James on Tuesday about listing the villa."
                className={inputCls}
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#F1CB68] px-4 py-2 text-sm font-semibold text-[#101014] transition-colors hover:bg-[#BF9B30] disabled:opacity-50"
            >
              {submitting ? 'Sending…' : 'Send request'}
            </button>
          </form>
        )}
      </section>

      <section className={cardCls}>
        <h2 className={`text-sm font-medium uppercase tracking-wide ${textMuted}`}>
          Authorisations
        </h2>
        <p className={`mt-1 text-xs ${textMuted}`}>
          Each authorisation lets an advisor add one asset for you. You can withdraw an unused
          authorisation at any time.
        </p>
        {loading ? null : grants.length === 0 ? (
          <p className={`mt-3 text-sm ${textMuted}`}>No authorisations yet.</p>
        ) : (
          <ul className={`mt-3 divide-y ${divide}`}>
            {grants.map((g) => (
              <li key={g.id} className="flex flex-wrap items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-medium">{g.advisor?.name || 'Advisor'}</p>
                  <p className={`text-xs ${textMuted}`}>
                    {g.status === 'active' && g.expiresAt
                      ? `Expires ${fmt(g.expiresAt)}`
                      : g.status === 'consumed'
                      ? 'Asset added — awaiting your confirmation'
                      : `Created ${fmt(g.createdAt)}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge status={g.status} />
                  {g.status === 'consumed' && (
                    <button
                      type="button"
                      disabled={busyId === g.id}
                      onClick={() => confirmAndLock(g.id)}
                      className="rounded-lg bg-[#F1CB68] px-3 py-1.5 text-sm font-semibold text-[#101014] transition-colors hover:bg-[#BF9B30] disabled:opacity-50"
                    >
                      Confirm &amp; lock
                    </button>
                  )}
                  {g.status === 'active' && (
                    <button
                      type="button"
                      disabled={busyId === g.id}
                      onClick={() => revoke(g.id)}
                      className={`${ghostBtn} disabled:opacity-50`}
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={cardCls}>
        <h2 className={`text-sm font-medium uppercase tracking-wide ${textMuted}`}>
          Request history
        </h2>
        {loading ? null : requests.length === 0 ? (
          <p className={`mt-3 text-sm ${textMuted}`}>No requests yet.</p>
        ) : (
          <ul className={`mt-3 divide-y ${divide}`}>
            {requests.map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-4 py-3">
                <div>
                  <p className="text-sm">{r.requestedAdvisor?.name || 'No specific advisor'}</p>
                  {r.note && <p className={`mt-0.5 text-xs ${textMuted}`}>{r.note}</p>}
                  {r.decisionReason && (
                    <p className="mt-0.5 text-xs text-red-400">{r.decisionReason}</p>
                  )}
                  <p className={`mt-0.5 text-xs ${textMuted}`}>{fmt(r.createdAt)}</p>
                </div>
                <Badge status={r.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
