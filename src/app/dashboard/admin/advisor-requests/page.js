'use client';

import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { listAdminUsers } from '@/utils/adminApi';
import {
  approveAdvisorRequest,
  listAdvisorRequests,
  rejectAdvisorRequest,
} from '@/utils/delegationApi';

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'cancelled', label: 'Cancelled' },
];

const fmt = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const advisorLabel = (a) =>
  [a.first_name, a.last_name].filter(Boolean).join(' ').trim() || a.email;

export default function AdminAdvisorRequestsPage() {
  const { isDarkMode } = useTheme();
  const { isAdmin, mounted } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [picked, setPicked] = useState({}); // requestId -> advisorId
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (mounted && !isAdmin) router.replace('/dashboard');
  }, [mounted, isAdmin, router]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { requests: rows } = await listAdvisorRequests({ status: tab });
      setRequests(rows);
    } catch (err) {
      toast.error(err?.message || 'Could not load advisor requests.');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    if (mounted && isAdmin) load();
  }, [load, mounted, isAdmin]);

  // client.js unwraps /admin/users (it carries `status_code`), so the list is
  // res.data. See the envelope note in delegationApi.js.
  useEffect(() => {
    if (!(mounted && isAdmin)) return;
    listAdminUsers({ role: 'advisor', page_size: 200 })
      .then((res) => setAdvisors(res?.data || []))
      .catch(() => setAdvisors([]));
  }, [mounted, isAdmin]);

  if (!mounted || !isAdmin) return null;

  const cardCls = `rounded-2xl border ${
    isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
  }`;
  const textMain = isDarkMode ? 'text-white' : 'text-gray-900';
  const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const divide = isDarkMode ? 'divide-[#FFFFFF14]' : 'divide-gray-100';
  const ghostBtn = `rounded-lg border px-3 py-2 text-sm transition-colors ${
    isDarkMode
      ? 'border-[#FFFFFF14] text-gray-200 hover:bg-white/5'
      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
  }`;
  const selectCls = `rounded-lg border px-3 py-2 text-sm ${
    isDarkMode
      ? 'bg-[#1A1A1D] border-[#FFFFFF14] text-white'
      : 'bg-white border-gray-300 text-gray-900'
  }`;

  const approve = async (req) => {
    const advisorId = picked[req.id] || req.requestedAdvisorId;
    if (!advisorId) {
      toast.error('Pick an advisor to assign first.');
      return;
    }
    setBusyId(req.id);
    try {
      const { grant } = await approveAdvisorRequest(req.id, advisorId);
      toast.success(
        grant ? 'Approved — the advisor can now add one asset.' : 'Request approved.'
      );
      await load();
    } catch (err) {
      toast.error(err?.message || 'Could not approve the request.');
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (req) => {
    const reason = window.prompt('Reason for declining (optional):');
    if (reason === null) return; // cancelled the dialog
    setBusyId(req.id);
    try {
      await rejectAdvisorRequest(req.id, reason);
      toast.success('Request declined.');
      await load();
    } catch (err) {
      toast.error(err?.message || 'Could not decline the request.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className={`space-y-6 p-6 ${textMain}`}>
      <header>
        <h1 className="text-2xl font-semibold">Advisor Requests</h1>
        <p className={`mt-1 text-sm ${textMuted}`}>
          Approving assigns the advisor and authorises them to add one asset for that investor.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              tab === t.key
                ? 'bg-[#F1CB68] text-[#101014]'
                : isDarkMode
                ? 'border border-[#FFFFFF14] text-gray-200 hover:bg-white/5'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={`${cardCls} p-4`}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`mb-3 h-12 animate-pulse rounded ${
                isDarkMode ? 'bg-white/10' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className={`${cardCls} p-8 text-center`}>
          <p className={`text-sm ${textMuted}`}>
            No {tab} requests.
          </p>
        </div>
      ) : (
        <ul className={`divide-y ${divide} ${cardCls}`}>
          {requests.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="min-w-[240px]">
                <p className="font-medium">{r.investor?.name || 'Investor'}</p>
                <p className={`text-xs ${textMuted}`}>{r.investor?.email}</p>
                {r.requestedAdvisor && (
                  <p className={`mt-1 text-xs ${textMuted}`}>
                    Asked for: {r.requestedAdvisor.name}
                  </p>
                )}
                {r.note && <p className={`mt-1 text-xs ${textMuted}`}>{r.note}</p>}
                <p className={`mt-1 text-xs ${textMuted}`}>{fmt(r.createdAt)}</p>
              </div>

              {tab === 'pending' ? (
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={picked[r.id] || r.requestedAdvisorId || ''}
                    onChange={(e) => setPicked((p) => ({ ...p, [r.id]: e.target.value }))}
                    className={selectCls}
                  >
                    <option value="">Select advisor…</option>
                    {advisors.map((a) => (
                      <option key={a.id} value={a.id}>
                        {advisorLabel(a)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={busyId === r.id}
                    onClick={() => approve(r)}
                    className="rounded-lg bg-[#F1CB68] px-3 py-2 text-sm font-semibold text-[#101014] transition-colors hover:bg-[#BF9B30] disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={busyId === r.id}
                    onClick={() => reject(r)}
                    className={`${ghostBtn} disabled:opacity-50`}
                  >
                    Decline
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`text-xs capitalize ${textMuted}`}>
                    {r.status}
                    {r.decisionReason ? ` — ${r.decisionReason}` : ''}
                  </span>
                  {/* Jump straight to the investor this request was about. Only
                      offered once decided — a pending request has no client
                      relationship to open yet. */}
                  {(r.investor?.id || r.investorId) && (
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/dashboard/advisor/clients/detail?id=${r.investor?.id || r.investorId}`
                        )
                      }
                      className={ghostBtn}
                    >
                      View
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
