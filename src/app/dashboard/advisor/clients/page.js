'use client';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getAdvisorClients } from '@/utils/advisorApi';

const kycBadge = (status) => {
  const v = String(status || '').toLowerCase();
  if (v === 'approved') return 'bg-green-500/20 text-green-400';
  if (v === 'rejected' || v === 'expired') return 'bg-red-500/20 text-red-400';
  if (v === 'in_progress' || v === 'pending_review') return 'bg-yellow-500/20 text-yellow-500';
  return 'bg-gray-500/20 text-gray-400';
};

const titleCase = (s) =>
  s ? String(s).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—';

export default function AdvisorClientsPage() {
  const { isDarkMode } = useTheme();
  const { isAdvisor, mounted } = useAuth();
  const router = useRouter();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (mounted && !isAdvisor) router.replace('/dashboard');
  }, [mounted, isAdvisor, router]);

  useEffect(() => {
    if (!mounted || !isAdvisor) return;
    (async () => {
      try {
        setLoading(true);
        const res = await getAdvisorClients();
        setClients(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        if (err?.status !== 404) toast.error('Failed to load your clients');
        setClients([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [mounted, isAdvisor]);

  if (!mounted || !isAdvisor) return null;

  const cardCls = `rounded-2xl border ${isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'}`;
  const textMain = isDarkMode ? 'text-white' : 'text-gray-900';
  const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <>
      <div className="mb-6">
        <h1 className={`text-2xl font-bold mb-1 ${textMain}`}>My Clients</h1>
        <p className={`text-sm ${textMuted}`}>Investors assigned to you. Open a chat to help them with their assets.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`${cardCls} h-32 animate-pulse`} />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className={`${cardCls} p-10 text-center`}>
          <p className={`text-sm ${textMuted}`}>No clients assigned yet. An admin will assign investors to you.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((c) => (
            <div key={c.client_id} className={`${cardCls} p-5 flex flex-col`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-[#F1CB68] flex items-center justify-center text-[#101014] font-bold">
                  {(c.name || '?').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className={`font-semibold truncate ${textMain}`}>{c.name || 'Investor'}</p>
                  <p className={`text-xs truncate ${textMuted}`}>{c.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-5">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${kycBadge(c.kyc_status)}`}>
                  KYC: {titleCase(c.kyc_status)}
                </span>
                {c.plan && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize bg-[#F1CB68]/20 text-[#BF9B30]">
                    {c.plan}
                  </span>
                )}
              </div>
              <button
                onClick={() => router.push('/dashboard/support-dashboard')}
                className="mt-auto w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-[#0B0D12]"
                style={{ background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)' }}
              >
                Open chat
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
