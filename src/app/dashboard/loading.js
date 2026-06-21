'use client';

// Minimal fallback shown ONLY during the brief navigation/compile gap, before the
// target page mounts. The Sidebar/Navbar persist (layout.js) and each page renders
// its own shell + section skeletons, so this stays intentionally light — just a
// soft placeholder for the content area, not a full fake layout.
export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8 h-9 w-56 rounded-lg bg-white/5" />
      <div className="rounded-2xl bg-white/5 border border-white/10 h-64" />
    </div>
  );
}
