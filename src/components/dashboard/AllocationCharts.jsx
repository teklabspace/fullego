'use client';
/**
 * Investor-only dashboard section: asset allocation as a two-level Sankey flow
 * (Portfolio → asset class → largest holdings) next to a donut of the asset
 * class distribution. Data: GET /portfolio/allocation via getAssetAllocation().
 *
 * Color system: one fixed categorical order per theme, assigned to classes by
 * descending value and never re-cycled — classes beyond the palette fold into
 * a neutral "Other". Both palettes were validated (lightness band, chroma
 * floor, CVD separation, normal-vision floor, surface contrast) against the
 * app's dark (#1A1A1D) and light (#FFFFFF) card surfaces; the light-mode
 * contrast WARN on yellow/pink is relieved by the always-visible legend and
 * direct labels (identity is never color-alone).
 */
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { getAssetAllocation } from '@/utils/portfolioApi';
import {
  formatCurrency,
  formatCurrencyCompact,
} from '@/utils/formatters';
import { useEffect, useMemo, useState } from 'react';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sankey,
  Sector,
  Tooltip,
} from 'recharts';

// Validated categorical slots (fixed order — index follows the class's value
// rank at load, which is stable for this single-view, unfiltered section).
export const PALETTE_DARK = ['#c98500', '#d55181', '#008300', '#9085e9', '#e66767', '#3987e5'];
export const PALETTE_LIGHT = ['#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948', '#2a78d6'];
export const OTHER_DARK = '#8a8f98';
export const OTHER_LIGHT = '#9ca3af';
export const SURFACE_DARK = '#1A1A1D';
export const SURFACE_LIGHT = '#FFFFFF';

const MAX_CLASSES = 5; // palette slots used for classes; the tail folds into "Other"
// Only the largest classes fan out into holdings, and only a couple each —
// more than that and the right column's labels collide into an unreadable
// stack (the full holdings list lives on the Portfolio page).
const MAX_CLASSES_WITH_HOLDINGS = 3;
const MAX_HOLDINGS_PER_CLASS = 2;

// "real_estate" → "Real Estate"
export const prettyClass = (s) =>
  (s || 'Other')
    .toString()
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

// Shared interactive donut: rounded slice ends, hovered slice grows outward,
// and the center readout switches from the total to the hovered slice's
// name · value · share. Slices carry {type, value, color, count?}.
export function VizDonut({ slices, total, centerLabel, isDarkMode, surface }) {
  const [active, setActive] = useState(null);
  const activeSlice = active != null ? slices[active] : null;
  const share =
    activeSlice && total > 0 ? ((activeSlice.value / total) * 100).toFixed(1) : null;
  return (
    <div className='relative h-56'>
      <ResponsiveContainer width='100%' height='100%'>
        <PieChart>
          <Pie
            data={slices}
            dataKey='value'
            nameKey='type'
            innerRadius='66%'
            outerRadius='90%'
            paddingAngle={1.5}
            cornerRadius={5}
            stroke={surface}
            strokeWidth={2}
            isAnimationActive={false}
            activeIndex={active ?? undefined}
            activeShape={(p) => (
              <Sector {...p} outerRadius={p.outerRadius + 7} cornerRadius={5} />
            )}
            onMouseEnter={(_, i) => setActive(i)}
            onMouseLeave={() => setActive(null)}
          >
            {slices.map((s) => (
              <Cell key={s.type} fill={s.color} style={{ cursor: 'pointer', outline: 'none' }} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {/* Center readout — hovered slice details, else the total. */}
      <div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-10'>
        {activeSlice ? (
          <>
            <p className={`text-[11px] font-semibold truncate max-w-full ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {activeSlice.type}
            </p>
            <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrencyCompact(activeSlice.value)}
            </p>
            <p className='text-[11px] font-medium' style={{ color: activeSlice.color }}>
              {share}% of total
            </p>
          </>
        ) : (
          <>
            <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatCurrencyCompact(total)}
            </p>
            <p className={`text-[11px] ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {centerLabel}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AllocationCharts() {
  const { isDarkMode } = useTheme();
  const { isInvestor } = useAuth();
  const [allocation, setAllocation] = useState(null); // null = loading

  useEffect(() => {
    if (!isInvestor) return;
    let cancelled = false;
    getAssetAllocation()
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res?.data) ? res.data : [];
        setAllocation(list);
      })
      .catch((err) => {
        // Allocation is decorative on the dashboard — fail silent, hide section.
        (err?.isNetworkError ? console.warn : console.error)(
          'Failed to fetch asset allocation:',
          err
        );
        if (!cancelled) setAllocation([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isInvestor]);

  const palette = isDarkMode ? PALETTE_DARK : PALETTE_LIGHT;
  const otherColor = isDarkMode ? OTHER_DARK : OTHER_LIGHT;
  const surface = isDarkMode ? SURFACE_DARK : SURFACE_LIGHT;

  // Classes sorted by value desc, colored in fixed palette order; the tail
  // beyond the palette folds into a single neutral "Other" class.
  const { classes, totalValue } = useMemo(() => {
    const items = (allocation || [])
      .map((a) => ({
        type: prettyClass(a.assetType || a.asset_type),
        value: Number(a.value) || 0,
        count: a.count || 0,
        assets: Array.isArray(a.assets) ? a.assets : [],
      }))
      .filter((a) => a.value > 0)
      .sort((a, b) => b.value - a.value);

    const total = items.reduce((s, a) => s + a.value, 0);
    // All classes fit the palette → no fold; otherwise keep the top
    // MAX_CLASSES and fold the tail (which is then always ≥ 2 classes).
    const cap = items.length <= palette.length ? palette.length : MAX_CLASSES;
    const head = items.slice(0, cap).map((a, i) => ({
      ...a,
      color: palette[i],
    }));
    const tail = items.slice(cap);
    if (tail.length) {
      head.push({
        // Not plain "Other" — a real asset class named "other" can exist, and
        // two identical legend labels would be indistinguishable.
        type: `${tail.length} more classes`,
        value: tail.reduce((s, a) => s + a.value, 0),
        count: tail.reduce((s, a) => s + a.count, 0),
        assets: tail.flatMap((a) => a.assets),
        color: otherColor,
      });
    }
    return { classes: head, totalValue: total };
  }, [allocation, palette, otherColor]);

  // Sankey graph: Portfolio → class → top holdings (per-class tail folds into
  // an "Other <class>" leaf so every flow is conserved).
  const sankeyData = useMemo(() => {
    const nodes = [{ name: 'Portfolio', color: isDarkMode ? '#F1CB68' : '#c98500' }];
    const links = [];
    classes.forEach((cls, i) => {
      const clsIndex = nodes.length;
      nodes.push({ name: cls.type, color: cls.color });
      links.push({ source: 0, target: clsIndex, value: cls.value, color: cls.color });

      // Smaller classes stay terminal — their bar ends the flow.
      if (i >= MAX_CLASSES_WITH_HOLDINGS) return;

      const holdings = [...cls.assets]
        .map((h) => ({ name: h.name || h.symbol || 'Asset', value: Number(h.value) || 0 }))
        .filter((h) => h.value > 0)
        .sort((a, b) => b.value - a.value);
      const top = holdings.slice(0, MAX_HOLDINGS_PER_CLASS);
      const rest = holdings.slice(MAX_HOLDINGS_PER_CLASS);
      top.forEach((h) => {
        nodes.push({ name: h.name, color: cls.color, leaf: true });
        links.push({ source: clsIndex, target: nodes.length - 1, value: h.value, color: cls.color });
      });
      if (rest.length) {
        nodes.push({ name: `${rest.length} more`, color: cls.color, leaf: true });
        links.push({
          source: clsIndex,
          target: nodes.length - 1,
          value: rest.reduce((s, h) => s + h.value, 0),
          color: cls.color,
        });
      }
    });
    return { nodes, links };
  }, [classes, isDarkMode]);

  if (!isInvestor) return null;
  if (allocation !== null && classes.length === 0) return null; // nothing to show

  const card = `rounded-xl border p-6 ${
    isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
  }`;
  const titleCls = `text-lg font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`;
  const subCls = `text-xs mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`;

  // Loading skeletons keep the layout stable.
  if (allocation === null) {
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

  return (
    <div className='grid grid-cols-1 xl:grid-cols-5 gap-6 mt-6'>
      {/* ── Donut: asset class distribution ─────────────────────────────── */}
      <div className={`${card} xl:col-span-2`}>
        <h3 className={titleCls}>Asset Class Distribution</h3>
        <p className={subCls}>Share of gross owned assets by class</p>

        <VizDonut
          slices={classes}
          total={totalValue}
          centerLabel='Total assets'
          isDarkMode={isDarkMode}
          surface={surface}
        />

        {/* Legend doubles as the accessible table: swatch + name + share + value */}
        <div className='mt-4 space-y-1.5'>
          {classes.map((cls) => (
            <div key={cls.type} className='flex items-center gap-2 text-xs'>
              <span
                className='w-2.5 h-2.5 rounded-sm shrink-0'
                style={{ backgroundColor: cls.color }}
              />
              <span className={`truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {cls.type}
              </span>
              <span className={`ml-auto shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {totalValue > 0 ? `${((cls.value / totalValue) * 100).toFixed(1)}%` : '—'}
              </span>
              <span className={`w-20 text-right shrink-0 font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {formatCurrencyCompact(cls.value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Sankey: allocation flow ─────────────────────────────────────── */}
      <div className={`${card} xl:col-span-3`}>
        <h3 className={titleCls}>Asset Allocation Flow</h3>
        <p className={subCls}>
          How your portfolio splits into classes and their largest holdings
        </p>
        {/* Full-width and responsive — no horizontal scrolling. */}
        <div className='h-[400px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <Sankey
              data={sankeyData}
              nodePadding={26}
              nodeWidth={10}
              margin={{ top: 8, right: 150, bottom: 8, left: 8 }}
              node={<SankeyNode isDarkMode={isDarkMode} />}
              link={<SankeyLink />}
            >
              <Tooltip content={<SankeyTooltip isDarkMode={isDarkMode} />} />
            </Sankey>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// Node: thin rounded bar + a single-line "Name · $value" label. The label
// wears a halo in the surface color (paint-order stroke) so it stays legible
// on top of crossing ribbons, and its y is clamped inside the plot so labels
// of tiny bottom nodes don't clip. Single-line keeps adjacent small nodes'
// labels from stacking into each other.
export function SankeyNode({ x, y, width, height, payload, containerWidth, isDarkMode }) {
  if (Number.isNaN(x) || Number.isNaN(y)) return null;
  const isRight = x > containerWidth / 2;
  const label = payload.name;
  const ink = isDarkMode ? '#E5E7EB' : '#1F2937';
  const inkMuted = isDarkMode ? '#9CA3AF' : '#6B7280';
  const halo = isDarkMode ? SURFACE_DARK : SURFACE_LIGHT;
  const barHeight = Math.max(height, 2);
  // Keep the baseline at least 10px from the top and 6px above the bottom of
  // the 400px plot area.
  const textY = Math.min(Math.max(y + barHeight / 2 + 4, 12), 392);
  return (
    <g>
      <rect x={x} y={y} width={width} height={barHeight} rx={3} fill={payload.color} />
      <text
        x={isRight ? x - 8 : x + width + 8}
        y={textY}
        textAnchor={isRight ? 'end' : 'start'}
        fontSize={11}
        stroke={halo}
        strokeWidth={3}
        strokeLinejoin='round'
        paintOrder='stroke'
      >
        <tspan fontWeight={600} fill={ink}>
          {label.length > 18 ? `${label.slice(0, 17)}…` : label}
        </tspan>
        <tspan dx={6} fontSize={10} fill={inkMuted}>
          {formatCurrencyCompact(payload.value)}
        </tspan>
      </text>
    </g>
  );
}

// Link: bezier ribbon with a source→target color gradient, translucent so
// crossings read. Gradient ids are namespaced by geometry so several Sankeys
// can coexist on one page.
export function SankeyLink({
  sourceX,
  sourceY,
  sourceControlX,
  targetX,
  targetY,
  targetControlX,
  linkWidth,
  index,
  payload,
}) {
  const from = payload?.source?.color || payload?.color || '#999';
  const to = payload?.target?.color || payload?.color || from;
  const gradId = `sankey-grad-${index}-${Math.round(sourceX)}-${Math.round(targetY)}`;
  return (
    <g>
      <defs>
        <linearGradient
          id={gradId}
          gradientUnits='userSpaceOnUse'
          x1={sourceX}
          x2={targetX}
          y1={0}
          y2={0}
        >
          <stop offset='0%' stopColor={from} stopOpacity={0.5} />
          <stop offset='100%' stopColor={to} stopOpacity={0.5} />
        </linearGradient>
      </defs>
      <path
        d={`M${sourceX},${sourceY} C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`}
        fill='none'
        stroke={`url(#${gradId})`}
        strokeWidth={Math.max(linkWidth, 2)}
      />
    </g>
  );
}

export function tooltipBox(isDarkMode) {
  return {
    background: isDarkMode ? '#26262A' : '#FFFFFF',
    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.12)' : '#E5E7EB'}`,
    borderRadius: 8,
    padding: '8px 10px',
    fontSize: 12,
    color: isDarkMode ? '#E5E7EB' : '#1F2937',
    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
  };
}

export function DonutTooltip({ active, payload, total, isDarkMode }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  const share = total > 0 ? ((d.value / total) * 100).toFixed(1) : null;
  return (
    <div style={tooltipBox(isDarkMode)}>
      <div className='flex items-center gap-1.5 font-semibold'>
        <span
          className='w-2 h-2 rounded-sm inline-block'
          style={{ backgroundColor: d.payload.color }}
        />
        {d.name}
      </div>
      <div>{formatCurrency(d.value)}{share ? ` · ${share}%` : ''}</div>
      {d.payload.count ? (
        <div style={{ opacity: 0.7 }}>
          {d.payload.count} asset{d.payload.count !== 1 ? 's' : ''}
        </div>
      ) : null}
    </div>
  );
}

export function SankeyTooltip({ active, payload, isDarkMode }) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload || {};
  // Links carry source/target node objects; nodes carry their own name/value.
  const isLink = p.source && p.target;
  const title = isLink ? `${p.source.name} → ${p.target.name}` : p.name;
  const value = isLink ? p.value : p.value;
  return (
    <div style={tooltipBox(isDarkMode)}>
      <div className='font-semibold'>{title}</div>
      <div>{formatCurrency(value)}</div>
    </div>
  );
}
