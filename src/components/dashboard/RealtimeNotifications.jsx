'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';
import { useTheme } from '@/context/ThemeContext';
import { API_BASE_URL, API_BASE_PATH } from '@/config/api';

// SWR key used by the notification bell (NotificationDropdown) for the unread count.
const UNREAD_COUNT_KEY = 'notifications-unread-count';

// "nadia nazar" / "NADIA NAZAR" → "Nadia Nazar"
const titleCase = (s) =>
  (s || '').toString().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

// Derive the WebSocket URL from the REST base (same backend host). A dedicated
// override can be set via NEXT_PUBLIC_WS_BASE_URL if the WS host ever differs.
const wsBaseUrl = () => {
  const override = process.env.NEXT_PUBLIC_WS_BASE_URL;
  if (override) return override.replace(/\/$/, '');
  const base = API_BASE_URL.replace(/\/$/, '').replace(/^http/, 'ws'); // http→ws, https→wss
  return `${base}${API_BASE_PATH}/ws/notifications`;
};

// Exchange the refresh token for a fresh access token (used when the socket is
// closed with 4401 = expired token).
async function refreshAccessToken() {
  if (typeof window === 'undefined') return false;
  const refresh_token = localStorage.getItem('refresh_token');
  if (!refresh_token) return false;
  try {
    const base = API_BASE_URL.replace(/\/$/, '');
    const res = await fetch(`${base}${API_BASE_PATH}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token }),
    });
    if (!res.ok) return false;
    const data = await res.json().catch(() => null);
    if (data?.access_token) {
      localStorage.setItem('access_token', data.access_token);
      if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
      return true;
    }
  } catch {
    /* fall through */
  }
  return false;
}

/**
 * Headless component: maintains a single WebSocket to the notifications channel
 * for the logged-in user. Pushes appear as clickable toasts (deep-link to the
 * appraisal thread) and refresh the unread bell. Auto-reconnects with backoff;
 * refreshes the token and reconnects on a 4401 close.
 */
export default function RealtimeNotifications() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [popups, setPopups] = useState([]);
  // Remember notification ids we've already shown, to drop duplicate events.
  const seenIds = useRef(new Set());

  const removePopup = (key) =>
    setPopups((prev) => prev.filter((p) => p.key !== key));

  const openPopup = (p) => {
    removePopup(p.key);
    if (p.appraisalId) {
      router.push(`/dashboard/concierge?appraisal=${p.appraisalId}`);
    }
  };

  useEffect(() => {
    // All connection state is closure-local so React StrictMode's double-invoke
    // (or any re-mount) can never leave a stale socket reconnecting → no dupes.
    let cancelled = false;
    let ws = null;
    let reconnectTimer = null;
    let pingTimer = null;
    let attempts = 0;

    const scheduleReconnect = (delayMs) => {
      if (cancelled) return;
      clearTimeout(reconnectTimer);
      const backoff = delayMs != null ? delayMs : Math.min(30000, 1000 * 2 ** attempts++);
      reconnectTimer = setTimeout(connect, backoff);
    };

    const handleEvent = (msg) => {
      // Dedupe by notification id so one message can't show two popups.
      const nid = msg.notification_id;
      if (nid) {
        if (seenIds.current.has(nid)) return;
        seenIds.current.add(nid);
      }
      mutate(UNREAD_COUNT_KEY);
      // Broadcast so any open list (e.g. the Notifications page) can prepend it
      // live without re-calling the API.
      if (typeof window !== 'undefined') {
        console.log('[notifications] broadcast app:notification', msg.type, msg.notification_id);
        window.dispatchEvent(new CustomEvent('app:notification', { detail: msg }));
      }
      const key = nid || `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      const popup = {
        key,
        assetCode: msg.asset_code,
        authorName: msg.author_name,
        preview:
          msg.preview ||
          (msg.type === 'appraisal_created' ? 'New appraisal request' : 'New message'),
        appraisalId: msg.appraisal_id,
      };
      // Keep at most the last 3 popups stacked.
      setPopups((prev) => [...prev.slice(-2), popup]);
      setTimeout(() => removePopup(key), 6000);
    };

    const connect = () => {
      if (cancelled || typeof window === 'undefined') return;
      const token = localStorage.getItem('access_token');
      if (!token) return; // not logged in — nothing to connect

      try {
        ws = new WebSocket(`${wsBaseUrl()}?token=${encodeURIComponent(token)}`);
      } catch {
        scheduleReconnect();
        return;
      }

      ws.onopen = () => {
        attempts = 0;
        console.log('[notifications] WebSocket connected');
        clearInterval(pingTimer);
        // Keepalive so Railway's proxy doesn't drop the idle socket.
        pingTimer = setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 25000);
      };

      ws.onmessage = (ev) => {
        let msg;
        try {
          msg = JSON.parse(ev.data);
        } catch {
          return;
        }
        if (!msg) return;
        if (msg.type === 'appraisal_message' || msg.type === 'appraisal_created') {
          handleEvent(msg);
        }
        // ping/pong/connected are ignored (channel is push-only).
      };

      ws.onclose = (ev) => {
        clearInterval(pingTimer);
        if (cancelled) return;
        console.warn('[notifications] WebSocket closed', ev.code, '— reconnecting');
        if (ev.code === 4401) {
          // Token expired/invalid — refresh, then reconnect.
          refreshAccessToken().then((ok) => scheduleReconnect(ok ? 0 : undefined));
          return;
        }
        scheduleReconnect();
      };

      ws.onerror = () => {
        // onclose runs next and handles reconnection.
      };
    };

    connect();

    return () => {
      cancelled = true;
      clearTimeout(reconnectTimer);
      clearInterval(pingTimer);
      if (ws) {
        try {
          ws.close();
        } catch {
          /* ignore */
        }
      }
    };
  }, [router]);

  if (popups.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[320px] max-w-[calc(100vw-2rem)] pointer-events-none">
      {popups.map((p) => (
        <div
          key={p.key}
          role="button"
          tabIndex={0}
          onClick={() => openPopup(p)}
          className={`pointer-events-auto cursor-pointer rounded-2xl border shadow-2xl p-3 transition-transform hover:scale-[1.02] ${
            isDarkMode
              ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
              : 'bg-white border-gray-200'
          }`}
          style={{ animation: 'rtSlideIn 0.2s ease-out' }}
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              {/* small bell glyph */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#F1CB68"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 shrink-0"
              >
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {p.authorName && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#F1CB68]/15 text-[#F1CB68] truncate max-w-[130px]">
                  {titleCase(p.authorName)}
                </span>
              )}
              {p.assetCode && (
                <span className="text-[11px] font-mono text-gray-400 shrink-0">
                  {p.assetCode}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removePopup(p.key);
              }}
              aria-label="Dismiss"
              className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className={`text-sm line-clamp-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            {p.preview}
          </p>
        </div>
      ))}

      <style jsx global>{`
        @keyframes rtSlideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
