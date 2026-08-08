'use client';
/**
 * Role-specific dashboard charts for staff, using the same two forms as the
 * investor section (donut + Sankey) and the same validated palettes:
 *
 * - Advisor: "book of business" — client AUM by asset class (donut) and a
 *   Book → clients → asset classes flow (Sankey). Data: GET /advisor/book.
 * - Admin: marketplace money story — escrow volume by state (donut) and an
 *   Escrow volume → outcome → commission/proceeds flow (Sankey).
 *   Data: GET /admin/escrow (aggregated client-side).
 */
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { getAdvisorBook } from '@/utils/advisorApi';
import { listEscrows } from '@/utils/adminApi';
import { formatCurrencyCompact } from '@/utils/formatters';
import { useEffect, useMemo, useState } from 'react';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sankey,
  Tooltip,
} from 'recharts';
import {
  DonutTooltip,
  OTHER_DARK,
  OTHER_LIGHT,
  PALETTE_DARK,
  PALETTE_LIGHT,
  SankeyLink,
  SankeyNode,
  SankeyTooltip,
  SURFACE_DARK,
  SURFACE_LIGHT,
  prettyClass,
} from './AllocationCharts';

const MAX_SANKEY_CLIENTS = 5;

// Escrow states are status colors (fixed per state, labeled — never reused as
// plain series colors elsewhere). Steps come from the validated palettes.
const ESCROW_STATUS_META = {
  released: { label: 'Released', dark: '#008300', light: '#008300' },
  funded: { label: 'In Escrow', dark: '#3987e5', light: '#2a78d6' },
  pending: { label: 'Awaiting Payment', dark: '#c98500', light: '#eda100' },
  disputed: { label: 'Disputed', dark: '#e66767', light: '#e34948' },
  refunded: { label: 'Refunded', dark: '#8a8f98', light: '#9ca3af' },
};

export default function StaffDashboardCharts() {
  const { isAdmin, isAdvisor } = useAuth();
  if (isAdmin) return <AdminEscrowCharts />;
  if (isAdvisor) return <AdvisorBookCharts />;
  return null;
}

function useCardStyles() {
  const { isDarkMode } = useTheme();
  return {
    isDarkMode,
    surface: isDarkMode ? SURFACE_DARK : SURFACE_LIGHT,
    palette: isDarkMode ? PALETTE_DARK : PALETTE_LIGHT,
    otherColor: isDarkMode ? OTHER_DARK : OTHER_LIGHT,
    card: `rounded-xl border p-6 ${
      isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
    }`,
    titleCls: `text-lg font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`,
    subCls: `text-xs mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`,
    inkRow: isDarkMode ? 'text-gray-200' : 'text-gray-800',
    inkMuted: isDarkMode ? 'text-gray-400' : 'text-gray-600',
  };
}

// Shared two-card grid with donut (legend rows below) + sankey.
function ChartsGrid({ donut, sankey, styles }) {
  const { card, titleCls, subCls, surface, isDarkMode, inkRow, inkMuted } = styles;
  return (
    <div className='grid grid-cols-1 xl:grid-cols-5 gap-6 mt-6'>
      <div className={`${card} xl:col-span-2`}>
        <h3 className={titleCls}>{donut.title}</h3>
        <p className={subCls}>{donut.subtitle}</p>
        <div className='relative h-56'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={donut.slices}
                dataKey='value'
                nameKey='type'
                innerRadius='64%'
                outerRadius='96%'
                paddingAngle={1.5}
                stroke={surface}
                strokeWidth={2}
                isAnimationActive={false}
              >
                {donut.slices.map((s) => (
                  <Cell key={s.type} fill={s.color} />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip total={donut.total} isDarkMode={isDarkMode} />} />
            </PieChart>
          </ResponsiveContainer>
          <div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none'>
            <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrencyCompact(donut.total)}
            </p>
            <p className={`text-[11px] ${inkMuted}`}>{donut.centerLabel}</p>
          </div>
        </div>
        <div className='mt-4 space-y-1.5'>
          {donut.slices.map((s) => (
            <div key={s.type} className='flex items-center gap-2 text-xs'>
              <span className='w-2.5 h-2.5 rounded-sm shrink-0' style={{ backgroundColor: s.color }} />
              <span className={`truncate ${inkRow}`}>{s.type}</span>
              <span className={`ml-auto shrink-0 ${inkMuted}`}>
                {donut.total > 0 ? `${((s.value / donut.total) * 100).toFixed(1)}%` : '—'}
              </span>
              <span className={`w-20 text-right shrink-0 font-medium ${inkRow}`}>
                {formatCurrencyCompact(s.value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={`${card} xl:col-span-3`}>
        <h3 className={titleCls}>{sankey.title}</h3>
        <p className={subCls}>{sankey.subtitle}</p>
        <div className='overflow-x-auto'>
          <div className='min-w-[560px] h-[400px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <Sankey
                data={sankey.data}
                nodePadding={26}
                nodeWidth={8}
                margin={{ top: 8, right: 170, bottom: 8, left: 8 }}
                node={<SankeyNode isDarkMode={isDarkMode} />}
                link={<SankeyLink />}
              >
                <Tooltip content={<SankeyTooltip isDarkMode={isDarkMode} />} />
              </Sankey>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Advisor: book of business ────────────────────────────────────────────────
function AdvisorBookCharts() {
  const styles = useCardStyles();
  const { palette, otherColor, isDarkMode } = styles;
  const [book, setBook] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getAdvisorBook()
      .then((res) => {
        if (!cancelled) setBook(res || {});
      })
      .catch((err) => {
        (err?.isNetworkError ? console.warn : console.error)('Failed to fetch advisor book:', err);
        if (!cancelled) setBook({});
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Class hue assignment shared by donut and sankey (fixed order by book value).
  const classColor = useMemo(() => {
    const map = new Map();
    (book?.allocation || []).forEach((a, i) => {
      map.set(prettyClass(a.assetType), palette[i] ?? otherColor);
    });
    return map;
  }, [book, palette, otherColor]);

  const donut = useMemo(() => {
    const slices = (book?.allocation || [])
      .map((a) => ({
        type: prettyClass(a.assetType),
        value: Number(a.value) || 0,
        count: a.count || 0,
      }))
      .filter((a) => a.value > 0)
      .map((a) => ({ ...a, color: classColor.get(a.type) ?? otherColor }));
    return {
      title: 'Client AUM by Asset Class',
      subtitle: `Combined portfolios of your ${book?.clientCount ?? 0} assigned client${(book?.clientCount ?? 0) !== 1 ? 's' : ''}`,
      centerLabel: 'Client AUM',
      slices,
      total: Number(book?.totalValue) || 0,
    };
  }, [book, classColor, otherColor]);

  const sankey = useMemo(() => {
    const clients = (book?.clients || []).filter((c) => (Number(c.totalValue) || 0) > 0);
    const nodes = [{ name: 'My Book', color: isDarkMode ? '#F1CB68' : '#c98500' }];
    const links = [];
    const classNodeIndex = new Map();

    const top = clients.slice(0, MAX_SANKEY_CLIENTS);
    const rest = clients.slice(MAX_SANKEY_CLIENTS);
    const rows = [...top];
    if (rest.length) {
      // Merge the folded clients' class values so the flow stays conserved.
      const merged = {};
      rest.forEach((c) =>
        (c.classes || []).forEach((cl) => {
          merged[cl.assetType] = (merged[cl.assetType] || 0) + (Number(cl.value) || 0);
        })
      );
      rows.push({
        name: `${rest.length} more clients`,
        totalValue: rest.reduce((s, c) => s + (Number(c.totalValue) || 0), 0),
        classes: Object.entries(merged).map(([assetType, value]) => ({ assetType, value })),
      });
    }

    rows.forEach((c) => {
      const clientIndex = nodes.length;
      nodes.push({ name: c.name, color: otherColor });
      links.push({ source: 0, target: clientIndex, value: Number(c.totalValue) || 0, color: otherColor });
      (c.classes || []).forEach((cl) => {
        const type = prettyClass(cl.assetType);
        const value = Number(cl.value) || 0;
        if (value <= 0) return;
        if (!classNodeIndex.has(type)) {
          classNodeIndex.set(type, nodes.length);
          nodes.push({ name: type, color: classColor.get(type) ?? otherColor });
        }
        links.push({
          source: clientIndex,
          target: classNodeIndex.get(type),
          value,
          color: classColor.get(type) ?? otherColor,
        });
      });
    });
    return {
      title: 'Book Allocation Flow',
      subtitle: 'How your clients’ wealth spreads across asset classes',
      data: { nodes, links },
    };
  }, [book, classColor, otherColor, isDarkMode]);

  if (book !== null && (donut.slices.length === 0 || donut.total <= 0)) return null;
  if (book === null) return <ChartsSkeleton styles={styles} />;
  return <ChartsGrid donut={donut} sankey={sankey} styles={styles} />;
}

// ── Admin: escrow money story ────────────────────────────────────────────────
function AdminEscrowCharts() {
  const styles = useCardStyles();
  const { isDarkMode } = styles;
  const [escrows, setEscrows] = useState(null);

  useEffect(() => {
    let cancelled = false;
    listEscrows({ limit: 100 })
      .then((payload) => {
        if (cancelled) return;
        const items = Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(payload)
          ? payload
          : [];
        setEscrows(items);
      })
      .catch((err) => {
        (err?.isNetworkError ? console.warn : console.error)('Failed to fetch escrows:', err);
        if (!cancelled) setEscrows([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const { donut, sankey } = useMemo(() => {
    const byStatus = {};
    let commissionReleased = 0;
    (escrows || []).forEach((e) => {
      const st = (e.status || '').toLowerCase();
      if (!ESCROW_STATUS_META[st]) return;
      const amount = Number(e.amount) || 0;
      byStatus[st] = byStatus[st] || { value: 0, count: 0 };
      byStatus[st].value += amount;
      byStatus[st].count += 1;
      if (st === 'released') commissionReleased += Number(e.commission) || 0;
    });

    const slices = Object.entries(byStatus)
      .map(([st, d]) => ({
        type: ESCROW_STATUS_META[st].label,
        value: d.value,
        count: d.count,
        color: isDarkMode ? ESCROW_STATUS_META[st].dark : ESCROW_STATUS_META[st].light,
        status: st,
      }))
      .sort((a, b) => b.value - a.value);
    const total = slices.reduce((s, x) => s + x.value, 0);

    const nodes = [{ name: 'Escrow Volume', color: isDarkMode ? '#F1CB68' : '#c98500' }];
    const links = [];
    slices.forEach((s) => {
      const idx = nodes.length;
      nodes.push({ name: s.type, color: s.color });
      links.push({ source: 0, target: idx, value: s.value, color: s.color });
      if (s.status === 'released') {
        const proceeds = Math.max(s.value - commissionReleased, 0);
        if (commissionReleased > 0) {
          nodes.push({ name: 'Platform Commission', color: isDarkMode ? '#F1CB68' : '#c98500' });
          links.push({ source: idx, target: nodes.length - 1, value: commissionReleased, color: s.color });
        }
        if (proceeds > 0) {
          nodes.push({ name: 'Seller Proceeds', color: s.color });
          links.push({ source: idx, target: nodes.length - 1, value: proceeds, color: s.color });
        }
      }
      if (s.status === 'refunded') {
        nodes.push({ name: 'Returned to Buyers', color: s.color });
        links.push({ source: idx, target: nodes.length - 1, value: s.value, color: s.color });
      }
    });

    return {
      donut: {
        title: 'Escrow Volume by State',
        subtitle: `${(escrows || []).length} escrow transaction${(escrows || []).length !== 1 ? 's' : ''} across the marketplace`,
        centerLabel: 'Escrow volume',
        slices,
        total,
      },
      sankey: {
        title: 'Marketplace Money Flow',
        subtitle: 'Where escrowed funds stand — and how released deals split into commission and seller proceeds',
        data: { nodes, links },
      },
    };
  }, [escrows, isDarkMode]);

  if (escrows !== null && donut.slices.length === 0) return null;
  if (escrows === null) return <ChartsSkeleton styles={styles} />;
  return <ChartsGrid donut={donut} sankey={sankey} styles={styles} />;
}

function ChartsSkeleton({ styles }) {
  const { card, isDarkMode } = styles;
  return (
    <div className='grid grid-cols-1 xl:grid-cols-5 gap-6 mt-6'>
      {['xl:col-span-2', 'xl:col-span-3'].map((span) => (
        <div key={span} className={`${card} ${span}`}>
          <div className={`h-4 w-40 rounded animate-pulse mb-4 ${isDarkMode ? 'bg-white/5' : 'bg-gray-200'}`} />
          <div className={`h-64 rounded animate-pulse ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`} />
        </div>
      ))}
    </div>
  );
}
