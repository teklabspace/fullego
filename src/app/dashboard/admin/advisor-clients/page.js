'use client';

import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { listAdvisorClientRoster, listUnassignedInvestors } from '@/utils/adminApi';

// The admin's equivalent of an advisor's "My Clients": every pairing on the
// platform, how alive each relationship is, and who still has nobody.

const TABS = [
  { key: 'pairings', label: 'Assigned' },
  { key: 'unassigned', label: 'Needs an advisor' },
];

const fmt = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const sinceLabel = (d) => {
  if (!d) return 'No messages yet';
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (Number.isNaN(days)) return '—';
  if (days <= 0) return 'Active today';
  if (days === 1) return 'Active yesterday';
  return `Quiet for ${days} days`;
};

export default function AdminAdvisorClientsPage() {
  const { isDarkMode } = useTheme();
  const { isAdmin, mounted } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState('pairings');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [pairings, setPairings] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (mounted && !isAdmin) router.replace('/dashboard');
  }, [mounted, isAdmin, router]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      if (tab === 'pairings') {
        const { pairings: rows, total: t } = await listAdvisorClientRoster({
          search: search || undefined,
        });
        setPairings(rows);
        setTotal(t);
      } else {
        const rows = await listUnassignedInvestors({ search: search || undefined });
        setUnassigned(rows);
        setTotal(rows.length);
      }
    } catch (err) {
      toast.error(err?.message || 'Could not load advisor relationships.');
    } finally {
      setLoading(false);
    }
  }, [tab, search]);

  // Debounced so typing in the search box doesn't fire a request per keystroke.
  useEffect(() => {
    if (!(mounted && isAdmin)) return undefined;
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load, mounted, isAdmin]);

  if (!mounted || !isAdmin) return null;

  const cardCls = `rounded-2xl border ${isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'}`;
  const textMain = isDarkMode ? 'text-white' : 'text-gray-900';
  const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const divide = isDarkMode ? 'divide-[#FFFFFF14]' : 'divide-gray-100';
  const skel = isDarkMode ? 'bg-white/10' : 'bg-gray-200';
  const ghostBtn = `rounded-lg border px-3 py-2 text-sm transition-colors ${
    isDarkMode
      ? 'border-[#FFFFFF14] text-gray-200 hover:bg-white/5'
      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
  }`;

  return (
    <div className={`space-y-6 p-6 ${textMain}`}>
      <header>
        <h1 className="text-2xl font-semibold">Advisor Relationships</h1>
        <p className={`mt-1 text-sm ${textMuted}`}>
          Every advisor and the investors they look after — open one to review their portfolio,
          activity, and chat.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
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
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by advisor or investor…"
          className={`min-w-[240px] flex-1 rounded-lg border px-3 py-2 text-sm ${
            isDarkMode
              ? 'bg-transparent border-[#FFFFFF14] text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        {!loading && <span className={`text-xs ${textMuted}`}>{total} result(s)</span>}
      </div>

      {loading ? (
        <div className={`${cardCls} p-4`}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={`mb-3 h-12 animate-pulse rounded ${skel}`} />
          ))}
        </div>
      ) : tab === 'pairings' ? (
        pairings.length === 0 ? (
          <div className={`${cardCls} p-8 text-center`}>
            <p className={`text-sm ${textMuted}`}>No advisor relationships found.</p>
          </div>
        ) : (
          <ul className={`divide-y ${divide} ${cardCls}`}>
            {pairings.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="min-w-[220px]">
                  <p className={`text-xs uppercase tracking-wide ${textMuted}`}>Advisor</p>
                  <p className="text-sm font-medium">{p.advisor?.name}</p>
                  <p className={`text-xs ${textMuted}`}>{p.advisor?.email}</p>
                </div>
                <div className="min-w-[220px]">
                  <p className={`text-xs uppercase tracking-wide ${textMuted}`}>Investor</p>
                  <p className="text-sm font-medium">{p.investor?.name}</p>
                  <p className={`text-xs ${textMuted}`}>{p.investor?.email}</p>
                </div>
                <div className="min-w-[160px]">
                  <p className="text-sm">{p.messageCount} message(s)</p>
                  <p className={`text-xs ${textMuted}`}>{sinceLabel(p.lastMessageAt)}</p>
                  <p className={`text-xs ${textMuted}`}>Assigned {fmt(p.assignedAt)}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/dashboard/advisor/clients/detail?id=${p.investor.id}`)
                  }
                  className={ghostBtn}
                >
                  View details
                </button>
              </li>
            ))}
          </ul>
        )
      ) : unassigned.length === 0 ? (
        <div className={`${cardCls} p-8 text-center`}>
          <p className={`text-sm ${textMuted}`}>Every investor has an advisor.</p>
        </div>
      ) : (
        <ul className={`divide-y ${divide} ${cardCls}`}>
          {unassigned.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-medium">{u.name}</p>
                <p className={`text-xs ${textMuted}`}>{u.email} · joined {fmt(u.createdAt)}</p>
              </div>
              <button
                type="button"
                onClick={() => router.push('/dashboard/admin/users?role=advisor')}
                className={ghostBtn}
              >
                Assign an advisor
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
