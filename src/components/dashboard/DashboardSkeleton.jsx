'use client';

/**
 * Loading skeleton for dashboard pages.
 * Matches DashboardLayout structure (navbar + content area) with shimmer placeholders.
 */
export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#101014] animate-pulse">
      {/* Top bar / navbar placeholder */}
      <div className="h-16 md:h-20 border-b border-white/10 bg-[#101014]" />
      <div className="lg:pl-64">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Page title */}
          <div className="mb-8 flex items-center justify-between">
            <div className="h-9 w-48 rounded-lg bg-white/10" />
            <div className="flex gap-2">
              <div className="h-10 w-10 rounded-lg bg-white/10" />
              <div className="h-10 w-10 rounded-lg bg-white/10" />
              <div className="h-10 w-24 rounded-lg bg-white/10" />
            </div>
          </div>
          {/* Cards row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-white/5 border border-white/10 p-6 h-40"
              />
            ))}
          </div>
          {/* Chart + side cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 rounded-2xl bg-white/5 border border-white/10 h-80" />
            <div className="space-y-4">
              <div className="rounded-2xl bg-white/5 border border-white/10 h-36" />
              <div className="rounded-2xl bg-white/5 border border-white/10 h-36" />
            </div>
          </div>
          {/* Table / list placeholder */}
          <div className="rounded-2xl bg-white/5 border border-white/10 h-64" />
        </div>
      </div>
    </div>
  );
}
