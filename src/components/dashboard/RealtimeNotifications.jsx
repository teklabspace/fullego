'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { mutate } from 'swr';
import { API_BASE_URL, API_BASE_PATH } from '@/config/api';

// SWR key used by the notification bell (NotificationDropdown) for the unread count.
const UNREAD_COUNT_KEY = 'notifications-unread-count';

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
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const pingTimer = useRef(null);
  const attempts = useRef(0);
  const stopped = useRef(false);

  useEffect(() => {
    stopped.current = false;

    const scheduleReconnect = (delayMs) => {
      clearTimeout(reconnectTimer.current);
      const n = attempts.current++;
      const backoff = delayMs != null ? delayMs : Math.min(30000, 1000 * 2 ** n);
      reconnectTimer.current = setTimeout(connect, backoff);
    };

    const handleEvent = (msg) => {
      // Refresh the bell's unread count.
      mutate(UNREAD_COUNT_KEY);
      const code = msg.asset_code ? `${msg.asset_code} · ` : '';
      const preview =
        msg.preview ||
        (msg.type === 'appraisal_created' ? 'New appraisal request' : 'New message');
      toast.info(`${code}${preview}`, {
        onClick: () => {
          if (msg.appraisal_id) {
            router.push(`/dashboard/concierge?appraisal=${msg.appraisal_id}`);
          }
        },
      });
    };

    const connect = () => {
      if (typeof window === 'undefined' || stopped.current) return;
      const token = localStorage.getItem('access_token');
      if (!token) return; // not logged in — nothing to connect

      let ws;
      try {
        ws = new WebSocket(`${wsBaseUrl()}?token=${encodeURIComponent(token)}`);
      } catch {
        scheduleReconnect();
        return;
      }
      wsRef.current = ws;

      ws.onopen = () => {
        attempts.current = 0;
        clearInterval(pingTimer.current);
        // Keepalive so Railway's proxy doesn't drop the idle socket.
        pingTimer.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
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
        clearInterval(pingTimer.current);
        if (stopped.current) return;
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
      stopped.current = true;
      clearTimeout(reconnectTimer.current);
      clearInterval(pingTimer.current);
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {
          /* ignore */
        }
      }
    };
  }, [router]);

  return null;
}
