'use client';
import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { clearTokens } from '@/utils/authApi';
import { useAuth } from '@/hooks/useAuth';

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { role, isAdmin, isAdvisor } = useAuth();

  // Optimistic navigation highlight: when a link is clicked we mark its href as
  // pending so the tab lights up *immediately*, instead of waiting for the route
  // to finish loading (which in dev can take a couple seconds while the route
  // compiles). Cleared once the real pathname catches up.
  const [pendingPath, setPendingPath] = useState(null);
  useEffect(() => {
    setPendingPath(null);
  }, [pathname]);

  const handleNavClick = (href) => {
    setPendingPath(href);
    onClose();
  };

  const handleLogout = (e) => {
    e.preventDefault();
    clearTokens();
    router.push('/login');
  };

  // Roles that exist in the system. Each section/item below declares the roles
  // allowed to see it; the menu is then filtered by the current user's role so
  // every account only sees what its role permits.
  const ALL_ROLES = ['admin', 'advisor', 'investor'];

  // Build the full, role-tagged menu. Filtering by role happens at the end so
  // gating is declarative and lives in one place (no scattered if-branches).
  const getMenuSections = () => {
    // Support link: admin/advisor manage all tickets, investor sees own only.
    const supportHref = (isAdmin || isAdvisor) ? '/dashboard/support-dashboard' : '/dashboard/support';
    const supportLabel = (isAdmin || isAdvisor) ? 'Support Dashboard' : 'Support Ticket';

    // CRM Dashboard — shown to admin (under "Administration") and advisor (under
    // "Reports & Documents"). Investors lack `view:analytics`, so it's excluded.
    const crmDashboardItem = {
      id: 'crm-dashboard',
      label: 'CRM Dashboard',
      icon: 'BarChart',
      href: '/dashboard/reports/crm',
      roles: ['admin', 'advisor'],
      hasSubmenu: true,
      submenu: [
        { id: 'crm-report', label: 'Report', href: '/dashboard/reports/crm', roles: ['admin', 'advisor'] },
        { id: 'crm-documents', label: 'Documents', href: '/dashboard/documents', roles: ['admin', 'advisor'] },
        { id: 'crm-support', label: supportLabel, href: supportHref, roles: ['admin', 'advisor'] },
        { id: 'crm-concierge', label: 'Concierge Service', href: '/dashboard/concierge', roles: ['admin', 'advisor'] },
      ],
    };

    const sections = [
      {
        title: 'Wealth Assets',
        roles: ALL_ROLES,
        items: [
          { id: 'assets', label: 'Assets', icon: 'Grid', href: '/dashboard/assets', roles: ALL_ROLES },
          {
            id: 'portfolio',
            label: 'Portfolio',
            icon: 'PieChart',
            href: '/dashboard/portfolio/Overview',
            roles: ALL_ROLES,
            hasSubmenu: true,
            submenu: [
              { id: 'Overview', label: 'Overview', href: '/dashboard/portfolio/Overview', roles: ALL_ROLES },
              { id: 'crypto', label: 'Crypto', href: '/dashboard/portfolio/crypto', roles: ALL_ROLES },
              { id: 'cash-flow', label: 'Cash Flow', href: '/dashboard/portfolio/cash-flow', roles: ALL_ROLES },
              { id: 'trade-engine', label: 'Trade Engine', href: '/dashboard/portfolio/trade-engine', roles: ALL_ROLES },
            ],
          },
          {
            id: 'investment',
            label: 'Investment',
            icon: 'TrendingUp',
            href: '/dashboard/investment',
            roles: ALL_ROLES,
            hasSubmenu: true,
            submenu: [
              { id: 'overview', label: 'Overview', href: '/dashboard/investment/overview', roles: ALL_ROLES },
              { id: 'goals-tracker', label: 'Goals Tracker', href: '/dashboard/investment/goals-tracker', roles: ALL_ROLES },
              { id: 'strategies', label: 'Strategies', href: '/dashboard/investment/strategies', roles: ALL_ROLES },
            ],
          },
        ],
      },
      {
        title: 'Opportunities',
        roles: ALL_ROLES,
        items: [
          {
            id: 'marketplace',
            label: 'Marketplace',
            icon: 'ShoppingBag',
            href: '/dashboard/marketplace',
            roles: ALL_ROLES,
            hasSubmenu: true,
            submenu: [
              { id: 'active-offers', label: 'Active Offers', href: '/dashboard/marketplace/active-offers', roles: ALL_ROLES },
              // Approving listings requires `approve:marketplace_listings` (admin + advisor).
              { id: 'approve-listings', label: 'Approve Listings', href: '/dashboard/marketplace/approve', roles: ['admin', 'advisor'] },
            ],
          },
        ],
      },
      // Advisor-only: their assigned investor clients + chat.
      {
        title: 'Clients',
        roles: ['advisor'],
        items: [
          { id: 'my-clients', label: 'My Clients', icon: 'Grid', href: '/dashboard/advisor/clients', roles: ['advisor'] },
        ],
      },
      // Advisors get analytics/CRM in their own section. Admins see the same CRM
      // tabs folded into "Administration" below, so this section excludes admin.
      {
        title: 'Reports & Documents',
        roles: ['advisor'],
        items: [crmDashboardItem],
      },
      // Investors have no `view:analytics`: a simplified documents/support section.
      {
        title: 'Documents & Support',
        roles: ['investor'],
        items: [
          { id: 'documents', label: 'Documents', icon: 'FileText', href: '/dashboard/documents', roles: ['investor'] },
          { id: 'support', label: 'Support Ticket', icon: 'HelpCircle', href: '/dashboard/support', roles: ['investor'] },
          { id: 'concierge', label: 'Concierge Service', icon: 'Shield', href: '/dashboard/concierge', roles: ['investor'] },
        ],
      },
      {
        title: 'Wealth Structure',
        roles: ALL_ROLES,
        items: [
          { id: 'entity-structure', label: 'Entity Structure', icon: 'Network', href: '/dashboard/entity-structure', roles: ALL_ROLES },
          { id: 'compliance', label: 'Compliance', icon: 'Shield', href: '/dashboard/compliance', roles: ALL_ROLES },
        ],
      },
      // Admin-only tools (`write:users`, `manage:subscriptions`, KYC/dispute review)
      // plus the CRM tabs, all under one "Administration" heading.
      {
        title: 'Administration',
        roles: ['admin'],
        items: [
          { id: 'admin-users', label: 'Manage Users', icon: 'Grid', href: '/dashboard/admin/users', roles: ['admin'] },
          { id: 'admin-subscriptions', label: 'Subscriptions', icon: 'BarChart', href: '/dashboard/admin/subscriptions', roles: ['admin'] },
          { id: 'admin-verifications', label: 'Verifications', icon: 'Shield', href: '/dashboard/admin/verifications', roles: ['admin'] },
          { id: 'admin-disputes', label: 'Escrow Disputes', icon: 'Shield', href: '/dashboard/admin/disputes', roles: ['admin'] },
          crmDashboardItem,
        ],
      },
      {
        title: 'Settings',
        roles: ALL_ROLES,
        items: [
          { id: 'preferences', label: 'Preferences', icon: 'Settings', href: '/dashboard/settings', roles: ALL_ROLES },
          { id: 'logout', label: 'Logout', icon: 'LogOut', href: '/login', isLogout: true, roles: ALL_ROLES },
          { id: 'help-center', label: 'Help Center', icon: 'HelpCircle', href: '/dashboard/support', roles: ALL_ROLES },
        ],
      },
    ];

    // Filter everything by the current role. Until the role resolves (first paint
    // before useAuth reads localStorage / fetches /users/me), only show entries
    // shared by every role — never flash items a user may not be allowed to see.
    const isAllowed = (entry) => {
      if (!entry.roles) return true;
      if (!role) return entry.roles.length === ALL_ROLES.length; // common-to-all only
      return entry.roles.includes(role);
    };

    return sections
      .filter(isAllowed)
      .map((section) => ({
        ...section,
        items: section.items.filter(isAllowed).map((item) => ({
          ...item,
          submenu: item.submenu ? item.submenu.filter(isAllowed) : item.submenu,
        })),
      }))
      .filter((section) => section.items.length > 0);
  };

  const menuSections = getMenuSections();

  // Initialize openSubmenu based on current pathname
  const getInitialOpenSubmenu = () => {
    const currentPath =
      pathname ||
      (typeof window !== 'undefined' ? window.location.pathname : '');
    if (currentPath.startsWith('/dashboard/investment')) return 'investment';
    if (currentPath.startsWith('/dashboard/portfolio')) return 'portfolio';
    if (currentPath.startsWith('/dashboard/marketplace')) return 'marketplace';
    if (currentPath.startsWith('/dashboard/reports/crm')) return 'crm-dashboard';
    if (currentPath.startsWith('/dashboard/documents')) return 'crm-dashboard';
    if (currentPath.startsWith('/dashboard/support')) return 'crm-dashboard';
    if (currentPath.startsWith('/dashboard/concierge')) return 'crm-dashboard';
    return null;
  };

  const [openSubmenu, setOpenSubmenu] = useState(getInitialOpenSubmenu());

  const prevPathnameRef = useRef(pathname);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      forceUpdate(prev => prev + 1);
    }

    const handleRouteChange = () => {
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
        const prevPath = (prevPathnameRef.current || '').replace(/\/$/, '') || '/';
        if (currentPath !== prevPath) {
          prevPathnameRef.current = window.location.pathname;
          forceUpdate(prev => prev + 1);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handleRouteChange);
      return () => window.removeEventListener('popstate', handleRouteChange);
    }
  }, [pathname]);

  const toggleSubmenu = itemId => {
    setOpenSubmenu(openSubmenu === itemId ? null : itemId);
  };

  const getCurrentPath = () => {
    // A pending (just-clicked) path wins so the highlight is instant.
    if (pendingPath) return pendingPath.replace(/\/$/, '') || '/';
    let currentPath = pathname;
    if (typeof window !== 'undefined' && (!currentPath || currentPath === window.location.pathname)) {
      currentPath = window.location.pathname;
    }
    return currentPath ? currentPath.replace(/\/$/, '') || '/' : '/';
  };

  const isActive = href => getCurrentPath() === (href.replace(/\/$/, '') || '/');

  const isActiveParent = href => {
    const currentPath = getCurrentPath();
    const normalizedHref = href.replace(/\/$/, '') || '/';
    return currentPath.startsWith(normalizedHref) && currentPath !== normalizedHref;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className='fixed inset-0 bg-black/50 z-40 lg:hidden' onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64
          transition-all duration-300 lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isDarkMode ? 'bg-[#101014] border-r border-[#FFFFFF14]' : 'bg-white border-r border-gray-200'}
        `}
      >
        <div className='flex flex-col h-full'>
          {/* Logo */}
          <div className='flex items-center justify-between px-6 py-5'>
            <div className='h-12 relative'>
              <img
                src={isDarkMode ? '/darkmode_logo.svg' : '/lightmode_logo.svg'}
                alt='Akunuba'
                className='h-12 w-auto object-contain transition-all'
              />
            </div>
            <button
              onClick={onClose}
              className={`lg:hidden transition-colors ${isDarkMode ? 'text-white hover:text-gray-300' : 'text-[#101014] hover:text-[#101014]/70'}`}
            >
              <Icon name='X' size={40} />
            </button>
          </div>

          {/* Navigation */}
          <nav
            className='flex-1 overflow-y-auto px-4 py-4 space-y-6 [&::-webkit-scrollbar]:hidden'
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Dashboard home link */}
            <div>
              <Link
                href='/dashboard'
                onClick={() => handleNavClick('/dashboard')}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-[24px] w-[222px] h-[48px]
                  transition-all duration-200
                  ${isActive('/dashboard')
                    ? isDarkMode ? 'text-white border border-[#FFFFFF1A]' : 'text-[#101014] border border-[#F1CB68]'
                    : isDarkMode ? 'text-gray-400 hover:bg-[#2B2B30]/50 hover:text-white' : 'text-[#101014]/70 hover:bg-gray-100 hover:text-[#101014]'
                  }
                `}
                style={isActive('/dashboard')
                  ? isDarkMode
                    ? { background: 'linear-gradient(94.02deg, #222126 0%, #111116 100%)' }
                    : { background: '#FFFFFF', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }
                  : {}}
              >
                <Icon
                  name='Home'
                  size={20}
                  className={isActive('/dashboard') && isDarkMode ? 'brightness-0 invert' : ''}
                  style={!isActive('/dashboard')
                    ? { filter: isDarkMode ? 'brightness(0) saturate(100%) invert(64%) sepia(6%) saturate(449%) hue-rotate(178deg) brightness(95%) contrast(88%)' : 'brightness(0.5)' }
                    : isActive('/dashboard') && !isDarkMode ? { filter: 'none' } : {}}
                />
                <span className='font-medium'>Dashboard</span>
              </Link>
            </div>

            {/* Dynamic menu sections */}
            {menuSections.map((section, index) => (
              <div key={index}>
                <h3 className={`text-xs font-medium uppercase tracking-wider mb-3 px-4 ${isDarkMode ? 'text-[#57575A]' : 'text-[#101014]/50'}`}>
                  {section.title}
                </h3>
                <div className='space-y-1'>
                  {section.items.map(item => (
                    <div key={item.id}>
                      {item.hasSubmenu ? (
                        <>
                          <div className='flex items-center gap-1 w-[222px]'>
                            <Link
                              href={item.href}
                              onClick={() => {
                                setPendingPath(item.href);
                                onClose();
                                if (openSubmenu !== item.id) setOpenSubmenu(item.id);
                              }}
                              className={`
                                flex items-center gap-3 px-4 py-2.5 rounded-[24px] flex-1 h-[48px]
                                transition-all duration-200
                                ${isActiveParent(item.href) || isActive(item.href)
                                  ? isDarkMode ? 'text-white border border-[#FFFFFF1A]' : 'text-[#101014] border border-[#F1CB68]'
                                  : isDarkMode ? 'text-gray-400 hover:text-white hover:bg-[#2B2B30]/50' : 'text-[#101014]/70 hover:text-[#101014] hover:bg-gray-100'
                                }
                              `}
                              style={isActiveParent(item.href) || isActive(item.href)
                                ? isDarkMode
                                  ? { background: 'linear-gradient(94.02deg, #222126 0%, #111116 100%)' }
                                  : { background: '#FFFFFF', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }
                                : {}}
                            >
                              <Icon
                                name={item.icon}
                                size={20}
                                className={(isActiveParent(item.href) || isActive(item.href)) && isDarkMode ? 'brightness-0 invert' : ''}
                                style={!isActiveParent(item.href) && !isActive(item.href)
                                  ? { filter: isDarkMode ? 'brightness(0) saturate(100%) invert(64%) sepia(6%) saturate(449%) hue-rotate(178deg) brightness(95%) contrast(88%)' : 'brightness(0) saturate(100%) invert(0.45)', opacity: isDarkMode ? 1 : 0.7 }
                                  : (isActiveParent(item.href) || isActive(item.href)) && !isDarkMode
                                    ? { filter: 'none', opacity: 1 }
                                    : (isActiveParent(item.href) || isActive(item.href)) && isDarkMode
                                      ? { filter: 'brightness(0) invert(1)', opacity: 1 }
                                      : {}}
                              />
                              <span className='font-medium'>{item.label}</span>
                            </Link>
                            <button
                              onClick={(e) => { e.preventDefault(); toggleSubmenu(item.id); }}
                              className={`p-2 rounded-lg transition-all ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                              <Icon
                                name='ChevronDown'
                                size={16}
                                className={`transition-transform ${openSubmenu === item.id ? 'rotate-180' : ''}`}
                                style={{ filter: isDarkMode ? 'brightness(0) invert(1)' : 'brightness(0.5)' }}
                              />
                            </button>
                          </div>
                          {openSubmenu === item.id && (
                            <div className='mt-1 ml-9 space-y-1'>
                              {item.submenu.map(subItem => (
                                <Link
                                  key={subItem.id}
                                  href={subItem.href}
                                  onClick={() => handleNavClick(subItem.href)}
                                  className={`
                                    flex items-center px-4 py-2 text-sm rounded-[24px] w-[190px] h-[40px] transition-colors
                                    ${isActive(subItem.href)
                                      ? isDarkMode ? 'text-white border border-[#FFFFFF1A]' : 'text-[#101014] border border-[#F1CB68]'
                                      : isDarkMode ? 'text-gray-400 hover:text-white hover:bg-[#2B2B30]/50' : 'text-[#101014]/70 hover:text-[#101014] hover:bg-gray-100'
                                    }
                                  `}
                                  style={isActive(subItem.href)
                                    ? isDarkMode
                                      ? { background: 'linear-gradient(94.02deg, #222126 0%, #111116 100%)' }
                                      : { background: '#FFFFFF', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }
                                    : {}}
                                >
                                  {subItem.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </>
                      ) : item.isLogout ? (
                        <button
                          onClick={(e) => { handleLogout(e); onClose(); }}
                          className='flex items-center gap-3 px-4 py-2.5 rounded-[24px] w-[222px] h-[48px] transition-all duration-200 text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer'
                        >
                          <Icon
                            name={item.icon}
                            size={20}
                            style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(89%) saturate(6449%) hue-rotate(351deg) brightness(95%) contrast(94%)' }}
                          />
                          <span className='font-medium'>{item.label}</span>
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => handleNavClick(item.href)}
                          className={`
                            flex items-center gap-3 px-4 py-2.5 rounded-[24px] w-[222px] h-[48px]
                            transition-all duration-200
                            ${isActive(item.href)
                              ? isDarkMode ? 'text-white border border-[#FFFFFF1A]' : 'text-[#101014] border border-[#F1CB68]'
                              : isDarkMode ? 'text-gray-400 hover:text-white hover:bg-[#2B2B30]/50' : 'text-[#101014]/70 hover:text-[#101014] hover:bg-gray-100'
                            }
                          `}
                          style={isActive(item.href)
                            ? isDarkMode
                              ? { background: 'linear-gradient(94.02deg, #222126 0%, #111116 100%)' }
                              : { background: '#FFFFFF', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }
                            : {}}
                        >
                          <Icon
                            name={item.icon}
                            size={20}
                            className={isActive(item.href) && isDarkMode ? 'brightness-0 invert' : ''}
                            style={!isActive(item.href)
                              ? { filter: isDarkMode ? 'brightness(0) saturate(100%) invert(64%) sepia(6%) saturate(449%) hue-rotate(178deg) brightness(95%) contrast(88%)' : 'brightness(0.5)' }
                              : isActive(item.href) && !isDarkMode ? { filter: 'none' } : {}}
                          />
                          <span className='font-medium'>{item.label}</span>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}

function Icon({ name, size = 24, className = '', style = {} }) {
  const iconPaths = {
    Home: '/icons/home.svg',
    Grid: '/icons/grid.svg',
    FileText: '/icons/file-text.svg',
    Folder: '/icons/folder.svg',
    Network: '/icons/network.svg',
    Shield: '/icons/shield.svg',
    ChevronDown: '/icons/chevron-down.svg',
    PieChart: '/icons/pie-chart.svg',
    TrendingUp: '/icons/trending-up.svg',
    BarChart: '/icons/bar-chart.svg',
    ShoppingBag: '/icons/shopping-bag.svg',
    Settings: '/icons/settings.svg',
    HelpCircle: '/icons/help-circle.svg',
    LogOut: '/icons/logout.svg',
    X: '/icons/x.svg',
  };

  return iconPaths[name] ? (
    <img src={iconPaths[name]} alt={name} width={size} height={size} className={className} style={style} />
  ) : null;
}
