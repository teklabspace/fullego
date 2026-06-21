'use client';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  listAdminUsers,
  getAdminUser,
  updateUserRole,
  deactivateUser,
  activateUser,
} from '@/utils/adminApi';

const ROLE_OPTIONS = ['investor', 'advisor', 'admin'];

const roleBadge = (role) => {
  const map = {
    admin: 'bg-purple-500/20 text-purple-400',
    advisor: 'bg-blue-500/20 text-blue-400',
    investor: 'bg-green-500/20 text-green-400',
  };
  return map[role] || 'bg-gray-500/20 text-gray-400';
};

const statusBadge = (active) =>
  active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400';

const fmt = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function AdminUsersPage() {
  const { isDarkMode } = useTheme();
  const { isAdmin, mounted, user: currentUser } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, page_size: 20, total: 0, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [page, setPage] = useState(1);

  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (mounted && !isAdmin) router.replace('/dashboard');
  }, [mounted, isAdmin, router]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        page_size: 20,
        ...(search ? { search } : {}),
        ...(roleFilter ? { role: roleFilter } : {}),
        ...(statusFilter !== '' ? { is_active: statusFilter } : {}),
        ...(verifiedFilter !== '' ? { is_verified: verifiedFilter } : {}),
      };
      const res = await listAdminUsers(params);
      setUsers(res.data || []);
      setPagination(res.pagination || { page: 1, page_size: 20, total: 0, total_pages: 1 });
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter, verifiedFilter]);

  useEffect(() => {
    if (mounted && isAdmin) fetchUsers();
  }, [fetchUsers, mounted, isAdmin]);

  const openDrawer = async (user) => {
    setDrawerOpen(true);
    setSelectedUser(user);
    setDetailLoading(true);
    try {
      const res = await getAdminUser(user.id);
      setSelectedUser(res.data || res);
    } catch {
      // keep basic row data
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole, e) => {
    e.stopPropagation();
    if (userId === currentUser?.id) {
      toast.error('You cannot change your own role');
      return;
    }
    setActionLoading((p) => ({ ...p, [userId + '_role']: true }));
    try {
      await updateUserRole(userId, newRole);
      toast.success('Role updated');
      fetchUsers();
    } catch (err) {
      toast.error(err?.message || 'Failed to update role');
    } finally {
      setActionLoading((p) => ({ ...p, [userId + '_role']: false }));
    }
  };

  const handleToggleActive = async (user, e) => {
    e.stopPropagation();
    if (user.id === currentUser?.id) {
      toast.error('You cannot deactivate your own account');
      return;
    }
    const key = user.id + '_status';
    setActionLoading((p) => ({ ...p, [key]: true }));
    try {
      if (user.is_active) {
        await deactivateUser(user.id);
        toast.success('User deactivated');
      } else {
        await activateUser(user.id);
        toast.success('User activated');
      }
      fetchUsers();
    } catch (err) {
      toast.error(err?.message || 'Failed to update status');
    } finally {
      setActionLoading((p) => ({ ...p, [key]: false }));
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  if (!mounted || !isAdmin) return null;

  const cardCls = `rounded-2xl border ${isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'}`;
  const textMain = isDarkMode ? 'text-white' : 'text-gray-900';
  const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const inputCls = `px-3 py-2 rounded-lg text-sm border focus:outline-none focus:border-[#F1CB68] transition-colors ${
    isDarkMode ? 'bg-white/5 border-[#FFFFFF14] text-white placeholder-gray-500' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
  }`;

  return (
    <>
      <div className="mb-6">
        <h1 className={`text-2xl font-bold mb-1 ${textMain}`}>Users & Roles</h1>
        <p className={`text-sm ${textMuted}`}>Manage user accounts, roles, and access</p>
      </div>

      {/* Filters */}
      <div className={`${cardCls} p-4 mb-6 flex flex-wrap gap-3 items-center`}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={handleSearch}
          className={`${inputCls} flex-1 min-w-48`}
        />
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className={inputCls}>
          <option value="">All Roles</option>
          <option value="investor">Investor</option>
          <option value="advisor">Advisor</option>
          <option value="admin">Admin</option>
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className={inputCls}>
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <select value={verifiedFilter} onChange={(e) => { setVerifiedFilter(e.target.value); setPage(1); }} className={inputCls}>
          <option value="">All Verified</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>
      </div>

      {/* Table */}
      <div className={`${cardCls} overflow-hidden mb-6`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'}`}>
                {['Name', 'Email', 'Role', 'Status', 'Verified', 'Joined', 'Last Login', 'Actions'].map((h) => (
                  <th key={h} className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${textMuted}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className={`border-b ${isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-100'}`}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className={`h-4 rounded animate-pulse ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className={`px-4 py-12 text-center text-sm ${textMuted}`}>No users found</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => openDrawer(user)}
                    className={`border-b cursor-pointer transition-colors ${
                      isDarkMode
                        ? 'border-[#FFFFFF14] hover:bg-white/5'
                        : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <p className={`text-sm font-medium ${textMain}`}>
                        {user.first_name} {user.last_name}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className={`text-sm ${textMuted}`}>{user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${roleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge(user.is_active)}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${user.is_verified ? 'text-green-400' : textMuted}`}>
                        {user.is_verified ? '✓ Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className={`text-xs ${textMuted}`}>{fmt(user.created_at)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className={`text-xs ${textMuted}`}>{fmt(user.last_login)}</p>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value, e)}
                          disabled={actionLoading[user.id + '_role'] || user.id === currentUser?.id}
                          className={`text-xs px-2 py-1 rounded border focus:outline-none ${
                            isDarkMode
                              ? 'bg-white/5 border-[#FFFFFF14] text-white disabled:opacity-40'
                              : 'bg-white border-gray-300 text-gray-900 disabled:opacity-40'
                          }`}
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r} className={isDarkMode ? 'bg-[#1A1A1D]' : ''}>
                              {r.charAt(0).toUpperCase() + r.slice(1)}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={(e) => handleToggleActive(user, e)}
                          disabled={actionLoading[user.id + '_status'] || user.id === currentUser?.id}
                          className={`text-xs px-2 py-1 rounded border font-medium transition-colors disabled:opacity-40 ${
                            user.is_active
                              ? isDarkMode
                                ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                                : 'border-red-300 text-red-600 hover:bg-red-50'
                              : isDarkMode
                                ? 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                                : 'border-green-300 text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {actionLoading[user.id + '_status'] ? '...' : user.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className={`px-4 py-3 flex items-center justify-between border-t ${isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'}`}>
            <p className={`text-xs ${textMuted}`}>
              {pagination.total} total · page {pagination.page} of {pagination.total_pages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`px-3 py-1 text-xs rounded border transition-colors disabled:opacity-40 ${
                  isDarkMode ? 'border-[#FFFFFF14] text-white hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Prev
              </button>
              {[...Array(Math.min(5, pagination.total_pages))].map((_, i) => {
                const p = Math.max(1, Math.min(page - 2, pagination.total_pages - 4)) + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 text-xs rounded transition-colors ${
                      p === page
                        ? 'bg-[#F1CB68] text-[#101014] font-semibold'
                        : isDarkMode
                          ? 'text-gray-400 hover:bg-white/10'
                          : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
                disabled={page === pagination.total_pages}
                className={`px-3 py-1 text-xs rounded border transition-colors disabled:opacity-40 ${
                  isDarkMode ? 'border-[#FFFFFF14] text-white hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className={`w-full max-w-md border-l overflow-y-auto ${isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'}`}>
            <div className={`sticky top-0 p-4 border-b flex items-center justify-between ${isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'}`}>
              <h3 className={`font-semibold text-lg ${textMain}`}>User Details</h3>
              <button onClick={() => setDrawerOpen(false)} className={`w-8 h-8 flex items-center justify-center rounded-full ${isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}>
                ×
              </button>
            </div>
            {detailLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F1CB68]" />
              </div>
            ) : selectedUser ? (
              <div className="p-4 space-y-4">
                {/* Identity */}
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-xs font-medium uppercase tracking-wider mb-3 ${textMuted}`}>Identity</p>
                  <DetailRow label="Name" value={`${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`} isDarkMode={isDarkMode} />
                  <DetailRow label="Email" value={selectedUser.email} isDarkMode={isDarkMode} />
                  <DetailRow label="Role" value={selectedUser.role} isDarkMode={isDarkMode} badge={roleBadge(selectedUser.role)} />
                  <DetailRow label="Status" value={selectedUser.is_active ? 'Active' : 'Inactive'} isDarkMode={isDarkMode} badge={statusBadge(selectedUser.is_active)} />
                </div>
                {/* Account */}
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-xs font-medium uppercase tracking-wider mb-3 ${textMuted}`}>Account</p>
                  <DetailRow label="Account Type" value={selectedUser.account_type || '—'} isDarkMode={isDarkMode} />
                  <DetailRow label="Subscription Plan" value={selectedUser.subscription_plan || '—'} isDarkMode={isDarkMode} />
                  <DetailRow label="KYC Status" value={selectedUser.kyc_status || '—'} isDarkMode={isDarkMode} />
                  <DetailRow label="2FA Enabled" value={selectedUser.two_factor_auth_enabled ? 'Yes' : 'No'} isDarkMode={isDarkMode} />
                </div>
                {/* Dates */}
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-xs font-medium uppercase tracking-wider mb-3 ${textMuted}`}>Activity</p>
                  <DetailRow label="Joined" value={fmt(selectedUser.created_at)} isDarkMode={isDarkMode} />
                  <DetailRow label="Last Login" value={fmt(selectedUser.last_login)} isDarkMode={isDarkMode} />
                  <DetailRow label="Email Verified" value={selectedUser.is_verified ? 'Yes' : 'No'} isDarkMode={isDarkMode} />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}

function DetailRow({ label, value, isDarkMode, badge }) {
  const textMain = isDarkMode ? 'text-white' : 'text-gray-900';
  const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  return (
    <div className="flex justify-between items-center py-1.5">
      <span className={`text-xs ${textMuted}`}>{label}</span>
      {badge ? (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${badge}`}>{value}</span>
      ) : (
        <span className={`text-xs font-medium ${textMain}`}>{value}</span>
      )}
    </div>
  );
}
