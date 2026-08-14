'use client';

import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import {
  getClientActivity,
  getClientAssets,
  getClientDetail,
  getClientDocuments,
  getClientGoals,
  getClientRequests,
} from '@/utils/advisorApi';

// Query-param route, not /[id]. This app is a static export, so a dynamic
// segment 404s in production unless whitelisted in generateStaticParams —
// same reason assets/detail?id= and strategies/detail?id= exist.

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'assets', label: 'Assets' },
  { key: 'documents', label: 'Documents' },
  { key: 'goals', label: 'Goals' },
  { key: 'requests', label: 'Requests' },
  { key: 'activity', label: 'Activity' },
];

const money = (v) =>
  v === null || v === undefined ? '—' : `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const fmt = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const fmtTime = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const titleCase = (s) => (s ? String(s).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—');

function ClientDetailInner() {
  const { isDarkMode } = useTheme();
  const { isAdvisor, isAdmin, mounted } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const clientId = params.get('id');

  const [tab, setTab] = useState('overview');
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  // Per-tab cache so switching back doesn't refetch (and doesn't re-log access).
  const [tabData, setTabData] = useState({});
  const [tabLoading, setTabLoading] = useState(false);

  const isStaff = isAdvisor || isAdmin;

  useEffect(() => {
    if (mounted && !isStaff) router.replace('/dashboard');
  }, [mounted, isStaff, router]);

  const loadDetail = useCallback(async () => {
    if (!clientId) return;
    try {
      setLoadingDetail(true);
      setDetail(await getClientDetail(clientId));
    } catch (err) {
      // 403 NOT_YOUR_CLIENT is the expected answer for an unassigned advisor.
      toast.error(
        err?.code === 'NOT_YOUR_CLIENT'
          ? 'This investor is not one of your clients.'
          : err?.message || 'Could not load this client.'
      );
    } finally {
      setLoadingDetail(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (mounted && isStaff) loadDetail();
  }, [loadDetail, mounted, isStaff]);

  const openTab = useCallback(async (key) => {
    setTab(key);
    if (key === 'overview' || tabData[key]) return;
    const loaders = {
      assets: getClientAssets,
      documents: getClientDocuments,
      goals: getClientGoals,
      requests: getClientRequests,
      activity: getClientActivity,
    };
    try {
      setTabLoading(true);
      const rows = await loaders[key](clientId);
      setTabData((prev) => ({ ...prev, [key]: rows }));
    } catch (err) {
      toast.error(err?.message || `Could not load ${key}.`);
    } finally {
      setTabLoading(false);
    }
  }, [clientId, tabData]);

  if (!mounted || !isStaff) return null;

  const cardCls = `rounded-2xl border ${isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'}`;
  const textMain = isDarkMode ? 'text-white' : 'text-gray-900';
  const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const divide = isDarkMode ? 'divide-[#FFFFFF14]' : 'divide-gray-100';
  const skel = isDarkMode ? 'bg-white/10' : 'bg-gray-200';

  if (!clientId) {
    return (
      <div className={`p-6 ${textMain}`}>
        <div className={`${cardCls} p-8 text-center`}>
          <p className={`text-sm ${textMuted}`}>No client selected.</p>
          <button
            type="button"
            onClick={() => router.push('/dashboard/advisor/clients')}
            className="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black"
          >
            Back to My Clients
          </button>
        </div>
      </div>
    );
  }

  const rows = tabData[tab] || [];

  const Empty = ({ what }) => (
    <p className={`p-6 text-center text-sm ${textMuted}`}>No {what} for this client.</p>
  );

  return (
    <div className={`space-y-6 p-6 ${textMain}`}>
      <button
        type="button"
        onClick={() => router.push('/dashboard/advisor/clients')}
        className={`text-sm ${textMuted} hover:underline`}
      >
        ← Back to My Clients
      </button>

      <header>
        {loadingDetail ? (
          <div className={`h-8 w-64 animate-pulse rounded ${skel}`} />
        ) : (
          <>
            <h1 className="text-2xl font-semibold">{detail?.client?.name || 'Client'}</h1>
            <p className={`mt-1 text-sm ${textMuted}`}>
              {detail?.client?.email}
              {detail?.client?.phone ? ` · ${detail.client.phone}` : ''}
            </p>
          </>
        )}
      </header>

      {!loadingDetail && detail && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: 'Net worth', value: money(detail.netWorth) },
            { label: 'Assets', value: detail.assetCount ?? 0 },
            { label: 'KYC', value: titleCase(detail.kycStatus) },
            { label: 'Plan', value: detail.plan ? titleCase(detail.plan) : '—' },
          ].map((s) => (
            <div key={s.label} className={`${cardCls} p-4`}>
              <p className={`text-xs uppercase tracking-wide ${textMuted}`}>{s.label}</p>
              <p className="mt-1 text-lg font-semibold">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => openTab(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              tab === t.key
                ? 'bg-amber-500 text-black'
                : isDarkMode
                ? 'border border-[#FFFFFF14] text-gray-200 hover:bg-white/5'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={cardCls}>
        {tab === 'overview' ? (
          loadingDetail ? (
            <div className="p-6 space-y-3">
              {[0, 1, 2].map((i) => <div key={i} className={`h-6 animate-pulse rounded ${skel}`} />)}
            </div>
          ) : !detail?.allocation?.length ? (
            <Empty what="asset allocation" />
          ) : (
            <ul className={`divide-y ${divide}`}>
              {detail.allocation.map((a) => (
                <li key={a.assetType} className="flex items-center justify-between p-4">
                  <span className="text-sm">{titleCase(a.assetType)}</span>
                  <span className="text-sm font-medium">{money(a.value)}</span>
                </li>
              ))}
            </ul>
          )
        ) : tabLoading ? (
          <div className="p-6 space-y-3">
            {[0, 1, 2].map((i) => <div key={i} className={`h-6 animate-pulse rounded ${skel}`} />)}
          </div>
        ) : rows.length === 0 ? (
          <Empty what={tab} />
        ) : (
          <ul className={`divide-y ${divide}`}>
            {rows.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                {tab === 'assets' && (
                  <>
                    <div>
                      <p className="text-sm font-medium">{r.name}</p>
                      <p className={`text-xs ${textMuted}`}>
                        {r.assetCode ? `${r.assetCode} · ` : ''}{titleCase(r.assetType)} · {titleCase(r.status)}
                      </p>
                    </div>
                    <span className="text-sm font-medium">{money(r.currentValue)}</span>
                  </>
                )}
                {tab === 'documents' && (
                  <>
                    <div>
                      <p className="text-sm font-medium">{r.fileName}</p>
                      <p className={`text-xs ${textMuted}`}>
                        {titleCase(r.documentType)} · {fmt(r.createdAt)}
                      </p>
                    </div>
                    <span className={`text-xs ${textMuted}`}>
                      {r.fileSize ? `${Math.round(r.fileSize / 1024)} KB` : ''}
                    </span>
                  </>
                )}
                {tab === 'goals' && (
                  <>
                    <div className="min-w-[200px]">
                      <p className="text-sm font-medium">{r.name}</p>
                      <p className={`text-xs ${textMuted}`}>
                        {money(r.currentValue)} of {money(r.targetAmount)} · {titleCase(r.status)}
                        {r.targetDate ? ` · by ${fmt(r.targetDate)}` : ''}
                      </p>
                    </div>
                    <span className="text-sm font-medium">{r.progressPct ?? 0}%</span>
                  </>
                )}
                {tab === 'requests' && (
                  <>
                    <div>
                      <p className="text-sm font-medium">{r.assetName}</p>
                      <p className={`text-xs ${textMuted}`}>
                        {r.kind === 'appraisal' ? 'Appraisal' : 'Sale request'} · {titleCase(r.status)} · {fmt(r.createdAt)}
                      </p>
                    </div>
                    <span className="text-sm font-medium">
                      {money(r.kind === 'appraisal' ? r.estimatedValue : r.targetPrice)}
                    </span>
                  </>
                )}
                {tab === 'activity' && (
                  <>
                    <div>
                      <p className="text-sm">{r.summary || r.action}</p>
                      <p className={`text-xs ${textMuted}`}>
                        {r.actor?.name || 'System'} · {r.action}
                      </p>
                    </div>
                    <span className={`text-xs ${textMuted}`}>{fmtTime(r.createdAt)}</span>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function AdvisorClientDetailPage() {
  // useSearchParams must sit inside Suspense for the static export to build.
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-400">Loading client…</div>}>
      <ClientDetailInner />
    </Suspense>
  );
}
