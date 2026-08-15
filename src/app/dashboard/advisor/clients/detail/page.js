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
import { getAdminConversationMessages } from '@/utils/supportAdminApi';
import { listDelegationGrants } from '@/utils/delegationApi';

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
  // Admin-only: the read-only advisor↔investor transcript. Advisors already
  // have the live chat via "Open chat", and the endpoint behind this is
  // admin-gated anyway, so showing it to an advisor would only ever 403.
  { key: 'chat', label: 'Chat', adminOnly: true },
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

// Activity-log actions are machine slugs (e.g. "client.requests.viewed"). Never
// render them raw — this maps the known ones and humanises anything new, so a
// future action added server-side degrades to "Viewed something" rather than
// leaking a dotted identifier into the client's audit history.
const ACTION_LABELS = {
  'client.viewed': 'Viewed client overview',
  'client.assets.viewed': 'Viewed assets',
  'client.documents.viewed': 'Viewed documents',
  'client.goals.viewed': 'Viewed goals',
  'client.requests.viewed': 'Viewed requests',
  'client.activity.viewed': 'Viewed activity',
  'asset.created_on_behalf': 'Created an asset on behalf',
  'asset.confirmed_locked': 'Asset confirmed and locked',
};

const actionLabel = (action) => {
  if (!action) return 'Activity';
  if (ACTION_LABELS[action]) return ACTION_LABELS[action];
  // Fallback: "client.requests.viewed" -> "Viewed requests";
  //           "asset.some_new_thing"   -> "Some new thing".
  const parts = String(action).split('.').filter(Boolean);
  const verb = parts.length > 1 ? parts[parts.length - 1] : parts[0];
  const subject = parts.length > 2 ? parts[parts.length - 2] : '';
  const words = (v) => v.replace(/_/g, ' ').trim();
  const phrase = subject ? `${words(verb)} ${words(subject)}` : words(verb);
  return phrase.charAt(0).toUpperCase() + phrase.slice(1);
};

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

  // An advisor may add ONE asset for this client, and only while they hold an
  // ACTIVE grant. The server enforces it; this just decides whether to offer it.
  const [creationGrant, setCreationGrant] = useState(null);
  useEffect(() => {
    if (!(mounted && isAdvisor && clientId)) return;
    listDelegationGrants('advisor')
      .then((gs) =>
        setCreationGrant(
          gs.find((g) => g.investorId === clientId && g.status === 'active' && g.isUsable) || null
        )
      )
      .catch(() => setCreationGrant(null));
  }, [mounted, isAdvisor, clientId]);

  const openTab = useCallback(async (key) => {
    setTab(key);
    if (key === 'overview' || tabData[key]) return;

    if (key === 'chat') {
      const conversationId = detail?.conversationId;
      if (!conversationId) {
        setTabData((prev) => ({ ...prev, chat: [] }));
        return;
      }
      try {
        setTabLoading(true);
        const res = await getAdminConversationMessages(conversationId, 200);
        setTabData((prev) => ({ ...prev, chat: res?.data || [] }));
      } catch (err) {
        toast.error(err?.message || 'Could not load the conversation.');
      } finally {
        setTabLoading(false);
      }
      return;
    }

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
  }, [clientId, tabData, detail]);

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
            className="mt-4 rounded-lg bg-[#F1CB68] px-4 py-2 text-sm font-semibold text-[#101014] transition-colors hover:bg-[#BF9B30]"
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

      {creationGrant && (
        <div
          className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 ${
            isDarkMode ? 'border-[#F1CB68]/30 bg-[#F1CB68]/5' : 'border-[#F1CB68] bg-[#F1CB68]/10'
          }`}
        >
          <p className="text-sm">
            You&apos;re authorised to add <strong>one</strong> asset for this client.
            {creationGrant.expiresAt
              ? ` Expires ${fmt(creationGrant.expiresAt)}.`
              : ''}
          </p>
          <button
            type="button"
            onClick={() => router.push(`/dashboard/assets/add?forClient=${clientId}`)}
            className="rounded-lg bg-[#F1CB68] px-4 py-2 text-sm font-semibold text-[#101014] transition-colors hover:bg-[#BF9B30]"
          >
            Add asset for this client
          </button>
        </div>
      )}

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
        {TABS.filter((t) => !t.adminOnly || isAdmin).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => openTab(t.key)}
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
        ) : tab === 'chat' ? (
          !detail?.conversationId ? (
            <p className={`p-6 text-center text-sm ${textMuted}`}>
              No advisor chat exists for this investor yet.
            </p>
          ) : rows.length === 0 ? (
            <p className={`p-6 text-center text-sm ${textMuted}`}>
              The advisor and investor haven&apos;t exchanged any messages yet.
            </p>
          ) : (
            <ul className={`divide-y ${divide}`}>
              {rows.map((m) => (
                <li key={m.id} className="p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-medium">
                      {m.sender_name || 'Unknown'}
                      <span className={`ml-2 text-xs font-normal ${textMuted}`}>
                        {titleCase(m.sender_role)}
                      </span>
                    </p>
                    <span className={`text-xs ${textMuted}`}>{fmtTime(m.timestamp)}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{m.content}</p>
                </li>
              ))}
            </ul>
          )
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
                      <p className="text-sm">{r.summary || actionLabel(r.action)}</p>
                      <p className={`text-xs ${textMuted}`}>
                        {r.actor?.name || 'System'} · {actionLabel(r.action)}
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
