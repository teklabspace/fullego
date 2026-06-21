import DashboardLayout from '@/components/dashboard/DashboardLayout';

// Shared layout for every /dashboard/* route. Rendering DashboardLayout here —
// instead of inside each page — means the Sidebar, Navbar and SecureRoute mount
// ONCE and persist across navigation; only the page content (children) swaps.
// This removes the per-click layout re-mount (the sidebar "glitch") and the
// repeated auth check, so navigation is faster and smoother.
export default function DashboardSectionLayout({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
