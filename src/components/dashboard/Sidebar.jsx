'use client';
import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const menuSections = [
  {
    title: 'Wealth Assets',
    items: [
      {
        id: 'assets',
        label: 'Assets',
        icon: 'Grid',
        href: '/dashboard/assets',
      },
      {
        id: 'portfolio',
        label: 'Portfolio',
        icon: 'PieChart',
        href: '/dashboard/portfolio',
        hasSubmenu: true,
        submenu: [
          {
            id: 'Overview',
            label: 'Overview',
            href: '/dashboard/portfolio/Overview',
          },
          {
            id: 'crypto',
            label: 'Crypto',
            href: '/dashboard/portfolio/crypto',
          },
          {
            id: 'cash-flow',
            label: 'Cash Flow',
            href: '/dashboard/portfolio/cash-flow',
          },
          {
            id: 'trade-engine',
            label: 'Trade Engine',
            href: '/dashboard/portfolio/trade-engine',
          },
        ],
      },
    ],
  },
  {
    title: 'Opportunities',
    items: [
      {
        id: 'marketplace',
        label: 'Marketplace',
        icon: 'ShoppingBag',
        href: '/dashboard/marketplace',
      },
    ],
  },
  {
    title: 'Reports & Documents',
    items: [
      {
        id: 'reports',
        label: 'Reports',
        icon: 'FileText',
        href: '/dashboard/reports',
      },
      {
        id: 'documents',
        label: 'Documents',
        icon: 'Folder',
        href: '/dashboard/documents',
      },
    ],
  },
  {
    title: 'Wealth Structure',
    items: [
      {
        id: 'entity-structure',
        label: 'Entity Structure',
        icon: 'Network',
        href: '/dashboard/entity-structure',
      },
      {
        id: 'compliance',
        label: 'Compliance',
        icon: 'Shield',
        href: '/dashboard/compliance',
      },
    ],
  },
  {
    title: 'Settings',
    items: [
      {
        id: 'preferences',
        label: 'Preferences',
        icon: 'Settings',
        href: '/dashboard/settings',
      },
      {
        id: 'logout',
        label: 'Logout',
        icon: 'LogOut',
        href: '/login',
        isLogout: true,
      },
      {
        id: 'help-center',
        label: 'Help Center',
        icon: 'HelpCircle',
        href: '/dashboard/Support',
      },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState('null');
  const { isDarkMode } = useTheme();

  // Track previous pathname to detect changes
  const prevPathnameRef = useRef(pathname);
  const [, forceUpdate] = useState(0);
  
  // Listen for route changes and force re-render
  useEffect(() => {
    // Check if pathname actually changed
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      forceUpdate(prev => prev + 1);
    }
    
    const handleRouteChange = () => {
      // Check window.location as fallback
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
      // Listen for popstate (browser back/forward)
      window.addEventListener('popstate', handleRouteChange);
      
      return () => {
        window.removeEventListener('popstate', handleRouteChange);
      };
    }
  }, [pathname]);

  const toggleSubmenu = itemId => {
    setOpenSubmenu(openSubmenu === itemId ? null : itemId);
  };

  // Helper function to get current normalized pathname (always reads fresh)
  const getCurrentPath = () => {
    // Always read from the latest pathname or window.location
    let currentPath = pathname;
    if (typeof window !== 'undefined' && (!currentPath || currentPath === window.location.pathname)) {
      currentPath = window.location.pathname;
    }
    
    if (currentPath) {
      return currentPath.replace(/\/$/, '') || '/';
    }
    return '/';
  };

  // Helper function to check if pathname matches href
  const isActive = (href) => {
    const currentPath = getCurrentPath();
    const normalizedHref = href.replace(/\/$/, '') || '/';
    return currentPath === normalizedHref;
  };

  // Helper function to check if pathname starts with href (for submenu parents)
  const isActiveParent = (href) => {
    const currentPath = getCurrentPath();
    const normalizedHref = href.replace(/\/$/, '') || '/';
    return currentPath.startsWith(normalizedHref) && currentPath !== normalizedHref;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className='fixed inset-0 bg-black/50 z-40 lg:hidden'
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 
          transition-all duration-300 lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${
            isDarkMode
              ? 'bg-[#101014] border-r border-[#FFFFFF14]'
              : 'bg-white border-r border-gray-200'
          }
        `}
      >
        <div className='flex flex-col h-full'>
          {/* Logo - Fixed at top */}
          <div className='flex items-center justify-between px-6 py-5 '>
            <img src='/Dashboardlogo.svg' alt='Fullego' className='h-8' />
            <button
              onClick={onClose}
              className={`lg:hidden transition-colors ${
                isDarkMode
                  ? 'text-white hover:text-gray-300'
                  : 'text-[#101014] hover:text-[#101014]/70'
              }`}
            >
              <Icon name='X' size={40} />
            </button>
          </div>

          {/* Navigation Sections - Scrollable */}
          <nav
            className='flex-1 overflow-y-auto px-4 py-4 space-y-6 [&::-webkit-scrollbar]:hidden'
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {/* Dashboard Button - Now inside scrollable area */}
            <div>
              <Link
                href='/dashboard'
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-[24px] w-[222px] h-[48px]
                  transition-all duration-200
                  ${
                    isActive('/dashboard')
                      ? isDarkMode
                        ? 'text-white border border-[#FFFFFF1A]'
                        : 'text-[#101014] border border-[#F1CB68]'
                      : isDarkMode
                      ? 'text-gray-400 hover:bg-[#2B2B30]/50 hover:text-white'
                      : 'text-[#101014]/70 hover:bg-gray-100 hover:text-[#101014]'
                  }
                `}
                style={
                  isActive('/dashboard')
                    ? isDarkMode
                      ? {
                          background:
                            'linear-gradient(94.02deg, #222126 0%, #111116 100%)',
                        }
                      : {
                          background: '#FFFFFF',
                          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                        }
                    : {}
                }
              >
                <Icon
                  name='Home'
                  size={20}
                  className={
                    isActive('/dashboard') && isDarkMode
                      ? 'brightness-0 invert'
                      : ''
                  }
                  style={
                    !isActive('/dashboard')
                      ? {
                          filter: isDarkMode
                            ? 'brightness(0) saturate(100%) invert(64%) sepia(6%) saturate(449%) hue-rotate(178deg) brightness(95%) contrast(88%)'
                            : 'brightness(0.5)',
                        }
                      : isActive('/dashboard') && !isDarkMode
                      ? { filter: 'none' }
                      : {}
                  }
                />
                <span className='font-medium'>Dashboard</span>
              </Link>
            </div>
            {menuSections.map((section, index) => (
              <div key={index}>
                <h3
                  className={`text-xs font-medium uppercase tracking-wider mb-3 px-4 ${
                    isDarkMode ? 'text-[#57575A]' : 'text-[#101014]/50'
                  }`}
                >
                  {section.title}
                </h3>
                <div className='space-y-1'>
                  {section.items.map(item => (
                    <div key={item.id}>
                      {item.hasSubmenu ? (
                        <>
                          <button
                            onClick={() => toggleSubmenu(item.id)}
                            className={`
                              flex items-center justify-between px-4 py-2.5 rounded-[24px] w-[222px] h-[48px]
                              transition-all duration-200
                              ${
                                isActiveParent(item.href) || isActive(item.href)
                                  ? isDarkMode
                                    ? 'text-white border border-[#FFFFFF1A]'
                                    : 'text-[#101014] border border-[#F1CB68]'
                                  : isDarkMode
                                  ? 'text-gray-400 hover:text-white hover:bg-[#2B2B30]/50'
                                  : 'text-[#101014]/70 hover:text-[#101014] hover:bg-gray-100'
                              }
                            `}
                            style={
                              isActiveParent(item.href) || isActive(item.href)
                                ? isDarkMode
                                  ? {
                                      background:
                                        'linear-gradient(94.02deg, #222126 0%, #111116 100%)',
                                    }
                                  : {
                                      background: '#FFFFFF',
                                      boxShadow:
                                        '0px 4px 12px rgba(0, 0, 0, 0.1)',
                                    }
                                : {}
                            }
                          >
                            <div className='flex items-center gap-3'>
                              <Icon
                                name={item.icon}
                                size={20}
                                className={
                                  (isActiveParent(item.href) || isActive(item.href)) && isDarkMode
                                    ? 'brightness-0 invert'
                                    : ''
                                }
                                style={
                                  !isActiveParent(item.href) && !isActive(item.href)
                                    ? {
                                        filter: isDarkMode
                                          ? 'brightness(0) saturate(100%) invert(64%) sepia(6%) saturate(449%) hue-rotate(178deg) brightness(95%) contrast(88%)'
                                          : 'brightness(0.5)',
                                      }
                                    : (isActiveParent(item.href) || isActive(item.href)) &&
                                      !isDarkMode
                                    ? { filter: 'none' }
                                    : {}
                                }
                              />
                              <span className='font-medium'>{item.label}</span>
                            </div>
                            <Icon
                              name='ChevronDown'
                              size={16}
                              className={`transition-transform ${
                                openSubmenu === item.id ? 'rotate-180' : ''
                              }`}
                              style={{
                                filter: isDarkMode
                                  ? 'brightness(0) invert(1)'
                                  : 'brightness(0.5)',
                              }}
                            />
                          </button>
                          {openSubmenu === item.id && (
                            <div className='mt-1 ml-9 space-y-1'>
                              {item.submenu.map(subItem => (
                                <Link
                                  key={subItem.id}
                                  href={subItem.href}
                                  onClick={onClose}
                                  className={`
                                    flex items-center px-4 py-2 text-sm rounded-[24px] w-[190px] h-[40px] transition-colors
                                    ${
                                      isActive(subItem.href)
                                        ? isDarkMode
                                          ? 'text-white border border-[#FFFFFF1A]'
                                          : 'text-[#101014] border border-[#F1CB68]'
                                        : isDarkMode
                                        ? 'text-gray-400 hover:text-white hover:bg-[#2B2B30]/50'
                                        : 'text-[#101014]/70 hover:text-[#101014] hover:bg-gray-100'
                                    }
                                  `}
                                  style={
                                    isActive(subItem.href)
                                      ? isDarkMode
                                        ? {
                                            background:
                                              'linear-gradient(94.02deg, #222126 0%, #111116 100%)',
                                          }
                                        : {
                                            background: '#FFFFFF',
                                            boxShadow:
                                              '0px 4px 12px rgba(0, 0, 0, 0.1)',
                                          }
                                      : {}
                                  }
                                >
                                  {subItem.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={`
                            flex items-center gap-3 px-4 py-2.5 rounded-[24px] w-[222px] h-[48px]
                            transition-all duration-200
                            ${
                              item.isLogout
                                ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                                : isActive(item.href)
                                ? isDarkMode
                                  ? 'text-white border border-[#FFFFFF1A]'
                                  : 'text-[#101014] border border-[#F1CB68]'
                                : isDarkMode
                                ? 'text-gray-400 hover:text-white hover:bg-[#2B2B30]/50'
                                : 'text-[#101014]/70 hover:text-[#101014] hover:bg-gray-100'
                            }
                          `}
                          style={
                            isActive(item.href) && !item.isLogout
                              ? isDarkMode
                                ? {
                                    background:
                                      'linear-gradient(94.02deg, #222126 0%, #111116 100%)',
                                  }
                                : {
                                    background: '#FFFFFF',
                                    boxShadow:
                                      '0px 4px 12px rgba(0, 0, 0, 0.1)',
                                  }
                              : {}
                          }
                        >
                          <Icon
                            name={item.icon}
                            size={20}
                            className={
                              isActive(item.href) &&
                              !item.isLogout &&
                              isDarkMode
                                ? 'brightness-0 invert'
                                : ''
                            }
                            style={
                              !isActive(item.href) && !item.isLogout
                                ? {
                                    filter: isDarkMode
                                      ? 'brightness(0) saturate(100%) invert(64%) sepia(6%) saturate(449%) hue-rotate(178deg) brightness(95%) contrast(88%)'
                                      : 'brightness(0.5)',
                                  }
                                : isActive(item.href) &&
                                  !item.isLogout &&
                                  !isDarkMode
                                ? { filter: 'none' }
                                : {}
                            }
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

// Icon Component - Using image files
function Icon({ name, size = 24, className = '' }) {
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
    <img
      src={iconPaths[name]}
      alt={name}
      width={size}
      height={size}
      className={className}
    />
  ) : null;
}
