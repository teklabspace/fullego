'use client';
import SecureRoute from '@/components/auth/SecureRoute';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  listTickets,
  getTicket,
  getTicketReplies,
  addTicketReply,
  assignTicket,
  updateTicket,
  getOwnSupportAnalytics,
} from '@/utils/supportTicketsApi';
import { getConversations, getMessages, sendMessage } from '@/utils/chatApi';
import {
  listAdminSupportTickets,
  listAssetRequests,
  assignAssetRequest,
  listAdminConversations,
  getAdminConversationMessages,
  getSupportAnalytics,
} from '@/utils/supportAdminApi';
import { getAdminUser } from '@/utils/adminApi';
import AssignmentModal from '@/components/dashboard/AssignmentModal';

export default function SupportDashboardPage() {
  const { isDarkMode } = useTheme();
  const { isAdmin, isAdvisor, isInvestor, user } = useAuth();
  // Display name for the logged-in viewer — used when a list item is the
  // viewer's own ticket (the API doesn't echo the requester's name back to
  // themselves since it's obviously them).
  const selfName =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    user?.email?.split('@')[0] ||
    'You';
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('support'); // support or reports
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState({});
  const messagesEndRef = useRef(null);
  const [showChatView, setShowChatView] = useState(false); // For mobile/tablet view control
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [assetRequests, setAssetRequests] = useState([]);
  // Reports tab analytics (admin) + selected window.
  const [analytics, setAnalytics] = useState(null);
  const [analyticsRange, setAnalyticsRange] = useState('30d');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  // Requester context for the right panel (plan, last login), keyed by item id.
  const [selectedContext, setSelectedContext] = useState(null);
  const [contextLoading, setContextLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if mobile/tablet
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch tickets, chat conversations and (admin) asset requests
  useEffect(() => {
    fetchTickets();
    fetchConversations();
    fetchAssetRequests();
  }, [activeFilter, searchQuery]);

  // Refetch when the tab regains focus so changes made elsewhere (another
  // session, a deleted test message, a reply from the other party) don't
  // stay stuck showing whatever was last fetched.
  useEffect(() => {
    const onFocus = () => {
      fetchTickets();
      fetchConversations();
      fetchAssetRequests();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, searchQuery]);

  // Fetch ticket/chat messages + requester context when an item is selected
  useEffect(() => {
    if (!selectedItem) return;
    if (selectedItem.type === 'ticket') {
      fetchTicketComments(selectedItem.id);
    } else if (selectedItem.type === 'chat') {
      fetchConversationMessages(selectedItem.id);
    }

    // Right-panel context for admins: the requester's plan + last login.
    setSelectedContext(null);
    if (isAdmin && selectedItem.userId) {
      setContextLoading(true);
      getAdminUser(selectedItem.userId)
        .then((res) => setSelectedContext(res?.data || res || null))
        .catch(() => setSelectedContext(null))
        .finally(() => setContextLoading(false));
    } else {
      setContextLoading(false);
    }
  }, [selectedItem]);

  // Live updates without a chat socket: while a conversation/ticket is open,
  // poll its messages every 5s so replies from the other party show up without
  // a manual refresh. The fetchers reuse the message cache, so the skeleton
  // (gated on an empty cache) never flashes during a background refresh. Skip
  // polling while the tab is hidden to avoid needless traffic.
  useEffect(() => {
    if (!selectedItem) return;
    const intervalId = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      if (selectedItem.type === 'ticket') {
        fetchTicketComments(selectedItem.id);
      } else if (selectedItem.type === 'chat') {
        fetchConversationMessages(selectedItem.id);
      }
    }, 5000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem]);

  // Refresh the list itself every 20s so new tickets/chats (and updated
  // previews/timestamps) appear without a manual reload.
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      fetchTickets();
      fetchConversations();
      fetchAssetRequests();
    }, 20000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, searchQuery]);

  // Reports tab analytics, refetched when the range changes. Admin gets the
  // richer all-tickets dashboard endpoint; advisor/investor get the
  // role-scoped /support/analytics (assigned tickets / own tickets).
  const fetchAnalytics = async (range) => {
    try {
      setAnalyticsLoading(true);
      const res = isAdmin
        ? await getSupportAnalytics(range)
        : await getOwnSupportAnalytics(range);
      setAnalytics(res?.data || res || null);
    } catch (error) {
      console.error('Failed to fetch support analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports') fetchAnalytics(analyticsRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, analyticsRange]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      // The "Closed" tab maps to resolved + closed; pass a single status to the
      // status-filtered tabs, leave undefined for All/Chats/Tickets/Requests.
      const statusParam =
        activeFilter === 'all' ||
        activeFilter === 'chats' ||
        activeFilter === 'tickets' ||
        activeFilter === 'requests'
          ? undefined
          : activeFilter === 'inprogress'
            ? 'in_progress'
            : activeFilter;

      // Admins use the dedicated all-tickets endpoint; advisors keep /support/*.
      const response = isAdmin
        ? await listAdminSupportTickets({ status: statusParam, search: searchQuery || undefined, limit: 100 })
        : await listTickets({ status: statusParam, search: searchQuery || undefined, limit: 100 });
      const ticketsData = response.data || response || [];

      // Transform tickets to match UI format (handles both admin + advisor shapes).
      // Non-admin (/support/tickets) now returns a real `requester` object and
      // a sequential `ticket_number` (e.g. "TCK-0006"). The admin-only
      // dashboard endpoint (/admin/support/tickets) wasn't part of that fix,
      // so it keeps the older flat userName/userEmail fields.
      const transformedTickets = ticketsData.map((ticket) => ({
        id: ticket.id || ticket.ticketId,
        type: 'ticket',
        userName: isAdmin
          ? ticket.userName || ticket.user_name || ticket.userEmail?.split('@')[0] || ticket.user_email?.split('@')[0] || 'User'
          : ticket.requester?.name || selfName,
        userEmail: isAdmin ? (ticket.user_email || ticket.userEmail) : (ticket.requester?.email || user?.email),
        userId: isAdmin ? (ticket.user_id || ticket.userId) : (ticket.requester?.id || user?.id),
        userAvatar: '/icons/user-avatar.svg',
        lastMessage: ticket.subject || ticket.description || 'No description',
        timestamp: formatTimeAgo(ticket.updated_at || ticket.updatedAt || ticket.created_at || ticket.createdAt),
        status: ticket.status || 'open',
        isOnline: false,
        priority: ticket.priority || 'medium',
        category: ticket.category,
        ticketId: ticket.id || ticket.ticketId,
        ticketNumber: ticket.ticketNumber || null,
        subject: ticket.subject,
        description: ticket.description,
        assignedAdvisor: ticket.assigned_advisor || ticket.assignedAdvisor || null,
      }));

      setTickets(transformedTickets);
      
      // Update selected item if it exists
      if (selectedItem && selectedItem.type === 'ticket') {
        const updatedTicket = transformedTickets.find(t => t.id === selectedItem.id);
        if (updatedTicket) {
          setSelectedItem(updatedTicket);
        }
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      toast.error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      // Admins see ALL conversations (incl. advisor↔investor); advisors see theirs.
      const response = isAdmin
        ? await listAdminConversations({ status: 'all', search: searchQuery || undefined, limit: 50 })
        : await getConversations('active', 50, 0);
      const data = response?.data || response?.conversations || [];

      // Backend guarantees a NULL-safe userName (falls back to email, then
      // "Unknown") on every participant — no more multi-field guessing needed.
      const nameOf = (p) => p?.userName || p?.email?.split('@')[0] || 'Unknown';
      // From a non-admin viewer's own perspective, label the thread with the
      // OTHER participant's name (never their own), since it's always a 1:1
      // advisor↔investor chat.
      const isSelf = (p) => !isAdmin && p?.userId && user?.id && p.userId === user.id;
      const transformedConversations = data.map(conv => {
        const participants = conv.participants || [];
        // Label as "Advisor ↔ Investor" when both roles are present.
        const advisor = participants.find(p => p.role === 'advisor');
        const investor = participants.find(p => p.role === 'investor');
        const other = participants.find(p => !isSelf(p) && p.role !== 'admin') || participants[0];
        const label =
          isAdmin && advisor && investor
            ? `${nameOf(advisor)} ↔ ${nameOf(investor)}`
            : nameOf(other) || conv.subject || 'Conversation';

        const last = conv.last_message || conv.lastMessage;
        return {
          id: conv.id,
          type: 'chat',
          userName: label,
          subject: conv.subject,
          participants,
          userId: (investor || participants.find(p => p.role !== 'admin'))?.userId,
          assignedAdvisor: advisor ? { id: advisor.userId, name: nameOf(advisor) } : null,
          userAvatar: '/icons/user-avatar.svg',
          lastMessage: last?.content || 'No messages yet',
          timestamp: formatTimeAgo(conv.updated_at || conv.updatedAt || last?.timestamp),
          status: 'open',
          isOnline: participants.some(p => p.isOnline),
          unreadCount: conv.unread_count ?? conv.unreadCount ?? 0,
        };
      });

      setConversations(transformedConversations);
    } catch (error) {
      console.error('Failed to fetch chat conversations:', error);
    }
  };

  const fetchAssetRequests = async () => {
    if (!isAdmin) return;
    try {
      const response = await listAssetRequests({ search: searchQuery || undefined, pageSize: 100 });
      const data = response?.data || [];
      const transformed = data.map(req => ({
        id: req.id,
        type: 'asset_request',
        requestType: req.type, // 'appraisal' | 'sale'
        userName: req.requested_by?.name || req.requested_by?.email?.split('@')[0] || 'User',
        userEmail: req.requested_by?.email,
        userId: req.requested_by?.id,
        userAvatar: '/icons/user-avatar.svg',
        assetName: req.asset?.name,
        lastMessage: `${req.type === 'sale' ? 'Sale' : 'Appraisal'} request · ${req.asset?.name || 'Asset'}`,
        timestamp: formatTimeAgo(req.created_at),
        status: req.status || 'pending',
        isOnline: false,
        assignedAdvisor: req.assigned_advisor || null,
      }));
      setAssetRequests(transformed);
    } catch (error) {
      console.error('Failed to fetch asset requests:', error);
    }
  };

  const fetchTicketComments = async (ticketId) => {
    try {
      setMessagesLoading(true);
      const response = await getTicketReplies(ticketId);
      const replies = response.data || response || [];

      // Transform replies to messages format
      const transformedMessages = replies.map((reply) => ({
        id: reply.id,
        sender: reply.isAdmin || reply.is_admin ? 'admin' : 'user',
        message: reply.message || reply.content || '',
        timestamp: reply.createdAt ? formatTime(reply.createdAt) : formatTime(reply.created_at),
      }));

      setMessages(prev => ({
        ...prev,
        [ticketId]: transformedMessages,
      }));
    } catch (error) {
      console.error('Failed to fetch ticket comments:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const fetchConversationMessages = async (conversationId) => {
    try {
      setMessagesLoading(true);
      // Admins can read any thread via the dedicated endpoint.
      const response = isAdmin
        ? await getAdminConversationMessages(conversationId, 50)
        : await getMessages(conversationId, 50);
      const msgs = response?.data || response?.messages || [];

      const transformedMessages = msgs.map(message => ({
        id: message.id,
        // In admin threads the sender carries a role; our bubbles render staff
        // (advisor/admin) on the right, the investor on the left.
        sender: message.sender_role && message.sender_role !== 'investor' ? 'admin' : 'user',
        message: message.content || '',
        timestamp: message.timestamp ? formatTime(message.timestamp) : getCurrentTime(),
      }));

      setMessages(prev => ({
        ...prev,
        [conversationId]: transformedMessages,
      }));
    } catch (error) {
      console.error('Failed to fetch conversation messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (dateString) => {
    if (!dateString) return getCurrentTime();
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  // Only use API data - no mock data
  const allItems = [...tickets, ...assetRequests, ...conversations];

  // Get messages for selected item
  const currentMessages = selectedItem ? messages[selectedItem.id] || [] : [];
  // Only show the skeleton on a cold load for this item — a background
  // refetch of an already-cached thread shouldn't flash the messages away.
  const showMessagesSkeleton = messagesLoading && !messages[selectedItem?.id];

  // Function to get current time in HH:MM AM/PM format
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  // Format a period-over-period percentage for the analytics cards.
  const pctLabel = (c) => (c == null ? '' : `${c >= 0 ? '+' : ''}${c}%`);

  // Render any backend status (ticket / chat / asset-request) nicely.
  const titleCase = (s) =>
    s ? String(s).replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase()) : '';
  const statusTone = (s) => {
    const v = String(s || '').toLowerCase();
    if (['active', 'open', 'in_progress', 'inprogress', 'approved', 'completed', 'reviewed'].includes(v))
      return 'bg-green-500/20 text-green-500';
    if (['pending', 'waiting', 'ai_appraised', 'needs_more_information', 'professional_appraisal_recommended'].includes(v))
      return 'bg-yellow-500/20 text-yellow-500';
    return 'bg-gray-500/20 text-gray-500';
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedItem) return;

    const content = messageInput.trim();

    try {
      if (selectedItem.type === 'ticket') {
        await addTicketReply(selectedItem.id, { message: content });

        const newMessage = {
          id: Date.now().toString(),
          sender: 'admin',
          message: content,
          timestamp: getCurrentTime(),
        };

        setMessages(prev => ({
          ...prev,
          [selectedItem.id]: [...(prev[selectedItem.id] || []), newMessage],
        }));
        // Keep the list's preview/timestamp in sync — it otherwise only
        // refreshes on the next filter/search change, so it would keep
        // showing whatever was last fetched (looks like a stale/dummy preview).
        setTickets(prev =>
          prev.map(t => (t.id === selectedItem.id ? { ...t, lastMessage: content, timestamp: 'Just now' } : t))
        );
      } else if (selectedItem.type === 'chat') {
        const sentMessage = await sendMessage(selectedItem.id, content);
        const created = sentMessage?.message || sentMessage;

        const newMessage = {
          id: created?.id || Date.now().toString(),
          sender: 'admin',
          message: created?.content || content,
          timestamp: created?.timestamp
            ? formatTime(created.timestamp)
            : getCurrentTime(),
        };

        setMessages(prev => ({
          ...prev,
          [selectedItem.id]: [...(prev[selectedItem.id] || []), newMessage],
        }));
        setConversations(prev =>
          prev.map(c => (c.id === selectedItem.id ? { ...c, lastMessage: content, timestamp: 'Just now' } : c))
        );
      }

      // Clear input
      setMessageInput('');

      // Scroll to bottom after message is added
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  // Re-assign the selected ticket to a chosen CRM user (admin only).
  const handleReassign = () => {
    if (!selectedItem) return;
    if (selectedItem.type === 'chat') {
      toast.info('Assignment is available for tickets and asset requests.');
      return;
    }
    setReassignModalOpen(true);
  };

  // Unified assignment handler for the shared AssignmentModal — routes to the
  // ticket re-assign or the asset-request assign endpoint by item type.
  const handleAssign = async (assignmentData) => {
    if (!selectedItem) return;
    if (selectedItem.type === 'asset_request') {
      try {
        await assignAssetRequest(selectedItem.requestType, selectedItem.id, assignmentData.userId);
        toast.success(`Request assigned to ${assignmentData.userName}.`);
        fetchAssetRequests();
      } catch (error) {
        toast.error(error?.message || 'Failed to assign request.');
      }
      return;
    }
    // Default: ticket re-assign.
    if (selectedItem.type !== 'ticket') return;
    try {
      await assignTicket(selectedItem.id, {
        userId: assignmentData.userId,
        userName: assignmentData.userName,
        internalNote: assignmentData.internalNote || undefined,
      });
      toast.success(`Ticket re-assigned to ${assignmentData.userName}.`);
      fetchTickets();
    } catch (error) {
      console.error('Failed to re-assign ticket:', error);
      toast.error(error?.message || 'Failed to re-assign ticket.');
    }
  };

  // Escalate the selected ticket by raising its priority to high.
  const handleEscalate = async () => {
    if (!selectedItem) return;
    if (selectedItem.type !== 'ticket') {
      toast.info('Escalation is only available for support tickets.');
      return;
    }
    try {
      setEscalating(true);
      await updateTicket(selectedItem.id, { priority: 'high' });
      toast.success('Ticket escalated. Priority raised to high.');
      fetchTickets();
    } catch (error) {
      console.error('Failed to escalate ticket:', error);
      const msg = error.data?.detail || error.message || 'Failed to escalate ticket.';
      toast.error(typeof msg === 'string' ? msg : 'Failed to escalate ticket.');
    } finally {
      setEscalating(false);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (selectedItem && currentMessages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [currentMessages, selectedItem]);

  // Handle Enter key press
  const handleKeyPress = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filter items based on active filter and search
  const filteredItems = allItems.filter(item => {
    const status = String(item.status || '').toLowerCase();
    // Asset requests (concierge appraisals / sale requests) use their own status
    // enum — pending, ai_appraised, needs_more_information, etc. — none of which
    // is literally "open". Bucket every non-terminal status as "open" so an
    // active concierge request shows under the Open tab, not just All/Requests.
    const isClosed = ['resolved', 'closed', 'completed', 'cancelled', 'appraisal_failed'].includes(status);
    const isInProgress = status === 'in_progress' || status === 'inprogress';
    const isOpen = !isClosed && !isInProgress; // open, pending, ai_appraised, awaiting info, …

    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'chats' && item.type === 'chat') ||
      (activeFilter === 'tickets' && item.type === 'ticket') ||
      (activeFilter === 'requests' && item.type === 'asset_request') ||
      (activeFilter === 'open' && isOpen) ||
      (activeFilter === 'inprogress' && isInProgress) ||
      (activeFilter === 'closed' && isClosed);

    const matchesSearch =
      searchQuery === '' ||
      item.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.ticketId &&
        item.ticketId.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  // Select first item by default (desktop only). This runs on every load/
  // reload once the list finishes fetching — it must flip the loading flag
  // the same way handleItemSelect does, or the auto-selected item flashes
  // blank before its messages fetch kicks in (the "reload" version of the
  // click-transition bug).
  useEffect(() => {
    if (filteredItems.length > 0 && !selectedItem && !isMobile) {
      const first = filteredItems[0];
      if (!messages[first.id]) setMessagesLoading(true);
      setSelectedItem(first);
    }
  }, [filteredItems, selectedItem, isMobile]);

  // Handle item selection - show chat view on mobile/tablet
  const handleItemSelect = item => {
    // Flip the loading flag synchronously with the selection change so there's
    // no render frame where the old messages are gone but the skeleton hasn't
    // kicked in yet (that gap read as "stuck"/blank when switching items).
    if (!messages[item.id]) setMessagesLoading(true);
    setSelectedItem(item);
    if (isMobile) {
      setShowChatView(true);
    }
  };

  // Handle back to list on mobile/tablet
  const handleBackToList = () => {
    setShowChatView(false);
  };

  if (!mounted) {
    return null;
  }

  return (
    <SecureRoute allowedRoles={['admin', 'advisor', 'investor']}>
      {/* Fits inside the shared DashboardLayout (which already renders the
          sidebar + navbar). Height = viewport minus the navbar + page padding. */}
      <div
        className={`flex flex-col overflow-hidden rounded-2xl border h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)] lg:h-[calc(100vh-9rem)] ${
          isDarkMode ? 'border-white/10 bg-[#1A1A1F]' : 'border-gray-200 bg-white'
        }`}
      >
          {/* Header Tabs */}
          <div
            className={`flex items-center gap-4 px-6 py-4 border-b ${
              isDarkMode
                ? 'border-white/10 bg-[#1A1A1F]'
                : 'border-gray-200 bg-white'
            }`}
          >
            <button
              onClick={() => setActiveTab('support')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'support'
                  ? 'text-black'
                  : isDarkMode
                  ? 'text-gray-400'
                  : 'text-gray-600'
              }`}
              style={{
                background:
                  activeTab === 'support'
                    ? 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)'
                    : 'transparent',
              }}
            >
              Support Dashboard
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'reports'
                  ? 'text-black'
                  : isDarkMode
                  ? 'text-gray-400'
                  : 'text-gray-600'
              }`}
              style={{
                background:
                  activeTab === 'reports'
                    ? 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)'
                    : 'transparent',
              }}
            >
              Reports
            </button>
          </div>

          {activeTab === 'support' ? (
            <div className='flex-1 flex overflow-hidden'>
              {/* Left Panel - Ticket/Chat List */}
              <div
                className={`${
                  showChatView ? 'hidden lg:flex' : 'flex'
                } w-full lg:w-96 border-r flex-col ${
                  isDarkMode
                    ? 'border-white/10 bg-[#1A1A1F]'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {/* Search Bar */}
                <div
                  className={`p-4 border-b ${
                    isDarkMode ? 'border-white/10' : 'border-gray-200'
                  }`}
                >
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <Image
                        src='/icons/search.svg'
                        alt='Search'
                        width={16}
                        height={16}
                        style={{
                          filter: isDarkMode
                            ? 'brightness(0) invert(1)'
                            : 'brightness(0.5)',
                        }}
                      />
                    </div>
                    <input
                      type='text'
                      placeholder='Search...'
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg text-sm border transition-colors ${
                        isDarkMode
                          ? 'bg-transparent border-white/10 text-white placeholder-gray-500 focus:border-[#F1CB68]'
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#F1CB68]'
                      } focus:outline-none`}
                    />
                  </div>
                </div>

                {/* Filters */}
                <div
                  className={`p-4 border-b ${
                    isDarkMode ? 'border-white/10' : 'border-gray-200'
                  }`}
                >
                  <div className='flex items-center gap-2 flex-wrap'>
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'open', label: 'Open' },
                      { id: 'inprogress', label: 'In Progress' },
                      { id: 'closed', label: 'Closed' },
                      { id: 'chats', label: 'Chats' },
                      { id: 'tickets', label: 'Tickets' },
                      ...(isAdmin ? [{ id: 'requests', label: 'Requests' }] : []),
                    ].map(filter => (
                      <button
                        key={filter.id}
                        onClick={() => setActiveFilter(filter.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          activeFilter === filter.id
                            ? 'text-black'
                            : isDarkMode
                            ? 'text-gray-400'
                            : 'text-gray-600'
                        }`}
                        style={{
                          background:
                            activeFilter === filter.id
                              ? 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)'
                              : 'transparent',
                          border:
                            activeFilter === filter.id
                              ? 'none'
                              : isDarkMode
                              ? '1px solid rgba(255, 255, 255, 0.1)'
                              : '1px solid rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Items List */}
                <div className='flex-1 overflow-y-auto custom-scrollbar'>
                  {loading ? (
                    [0, 1, 2, 3, 4].map(i => (
                      <div key={i} className='p-5 border-b border-white/5 animate-pulse'>
                        <div className='flex items-start gap-3'>
                          <div className={`shrink-0 w-12 h-12 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                          <div className='flex-1 min-w-0 space-y-2 pt-1'>
                            <div className='flex items-center justify-between'>
                              <div className={`h-3.5 w-24 rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                              <div className={`h-3 w-10 rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                            </div>
                            <div className={`h-3 w-40 rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                            <div className={`h-3 w-16 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : filteredItems.length === 0 ? (
                    <div className='p-8 text-center'>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Nothing here yet.
                      </p>
                    </div>
                  ) : (
                  filteredItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleItemSelect(item)}
                      className={`p-5 border-b cursor-pointer transition-colors ${
                        selectedItem?.id === item.id
                          ? isDarkMode
                            ? 'bg-white/10 border-[#F1CB68]/50'
                            : 'bg-[#F1CB68]/10 border-[#F1CB68]'
                          : isDarkMode
                          ? 'border-white/5 hover:bg-white/5'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className='flex items-start gap-3'>
                        {/* Avatar */}
                        <div className='relative shrink-0 w-12 h-12 rounded-full overflow-hidden bg-[#F1CB68] flex items-center justify-center'>
                          <Image
                            src={item.userAvatar}
                            alt={item.userName}
                            width={48}
                            height={48}
                            className='w-full h-full object-cover'
                          />
                          {item.isOnline && (
                            <div
                              className='absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2'
                              style={{
                                borderColor: isDarkMode ? '#1A1A1F' : '#FFFFFF',
                              }}
                            ></div>
                          )}
                        </div>

                        {/* Content */}
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center justify-between mb-1'>
                            <p
                              className={`font-semibold text-[15px] truncate ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}
                            >
                              {item.userName}
                            </p>
                            <span
                              className={`text-xs shrink-0 ml-2 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}
                            >
                              {item.timestamp}
                            </span>
                          </div>

                          <div className='flex items-center gap-2 mb-1.5'>
                            <Image
                              src={
                                item.type === 'chat'
                                  ? '/icons/chat.svg'
                                  : '/icons/ticket.svg'
                              }
                              alt={item.type === 'chat' ? 'Chat' : 'Ticket'}
                              width={16}
                              height={16}
                              className='shrink-0'
                              style={{
                                filter: isDarkMode
                                  ? 'brightness(0) invert(1)'
                                  : 'brightness(0.5)',
                              }}
                            />
                            <p
                              className={`text-sm truncate ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}
                            >
                              {item.lastMessage}
                            </p>
                          </div>

                          <div className='flex items-center gap-2'>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${statusTone(item.status)}`}
                            >
                              {titleCase(item.status) || 'Open'}
                            </span>
                            {item.unreadCount > 0 && (
                              <span className='bg-[#F1CB68] text-black text-xs px-2 py-0.5 rounded-full font-medium'>
                                {item.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )))}
                </div>
              </div>

              {/* Center Panel - Conversation */}
              <div
                className={`${
                  showChatView ? 'flex' : 'hidden lg:flex'
                } flex-1 flex-col`}
              >
                {selectedItem ? (
                  <>
                    {/* Conversation Header */}
                    <div
                      className={`p-4 md:p-5 border-b flex items-center justify-between ${
                        isDarkMode
                          ? 'border-white/10 bg-[#1A1A1F]'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className='flex items-center gap-3 md:gap-4 flex-1 min-w-0'>
                        {/* Back Button - Mobile/Tablet Only */}
                        <button
                          onClick={handleBackToList}
                          className='lg:hidden p-1.5 -ml-1 rounded-lg transition-colors hover:bg-white/10 shrink-0'
                        >
                          <svg
                            width='20'
                            height='20'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke={isDarkMode ? '#FFFFFF' : '#000000'}
                            strokeWidth='2'
                          >
                            <path d='M19 12H5M12 19l-7-7 7-7' />
                          </svg>
                        </button>
                        <div className='w-11 h-11 md:w-12 md:h-12 rounded-full overflow-hidden bg-[#F1CB68] flex items-center justify-center shrink-0'>
                          <Image
                            src={selectedItem.userAvatar}
                            alt={selectedItem.userName}
                            width={48}
                            height={48}
                            className='w-full h-full object-cover'
                          />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p
                            className={`font-semibold text-base md:text-lg truncate ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {selectedItem.userName}
                          </p>
                          <p
                            className={`text-xs md:text-sm truncate ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}
                          >
                            {selectedItem.isOnline ? 'Online' : 'Offline'} •{' '}
                            {selectedItem.type === 'chat' ? 'Chat' : 'Ticket'}{' '}
                            {selectedItem.type === 'ticket' &&
                              `• ${
                                selectedItem.ticketNumber ||
                                (selectedItem.ticketId ? `#${selectedItem.ticketId.slice(-8).toUpperCase()}` : '')
                              }`}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-2 shrink-0'>
                        {selectedItem.type === 'chat' && (
                          <span
                            className={`hidden sm:inline-block text-xs px-2 py-1 rounded ${
                              isDarkMode
                                ? 'bg-white/10 text-white'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {tickets.filter(
                              t => t.userName === selectedItem.userName
                            ).length}{' '}
                            tickets
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Messages */}
                    <div
                      className={`flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar space-y-4 ${
                        isDarkMode ? 'bg-[#1A1A1F]' : 'bg-white'
                      }`}
                    >
                      {showMessagesSkeleton ? (
                        [0, 1, 2].map(i => (
                          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                            <div
                              className={`max-w-[65%] h-10 rounded-2xl animate-pulse ${
                                isDarkMode ? 'bg-white/10' : 'bg-gray-200'
                              }`}
                              style={{ width: `${140 + i * 40}px` }}
                            />
                          </div>
                        ))
                      ) : currentMessages.length === 0 ? (
                        <div className='h-full flex items-center justify-center'>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            No messages yet.
                          </p>
                        </div>
                      ) : (
                      currentMessages.map(message => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender === 'user'
                              ? 'justify-start'
                              : 'justify-end'
                          }`}
                        >
                          <div
                            className={`max-w-[85%] md:max-w-[65%] rounded-2xl px-4 py-2.5 text-sm md:text-base ${
                              message.sender === 'user'
                                ? isDarkMode
                                  ? 'bg-white/10 text-white'
                                  : 'bg-white border border-gray-200 text-gray-900'
                                : message.sender === 'system'
                                ? isDarkMode
                                  ? 'bg-white/5 text-gray-400'
                                  : 'bg-gray-100 text-gray-600'
                                : 'bg-[#F1CB68] text-black'
                            }`}
                          >
                            <p className='text-sm md:text-base'>{message.message}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.sender === 'user'
                                  ? isDarkMode
                                    ? 'text-gray-400'
                                    : 'text-gray-500'
                                  : message.sender === 'system'
                                  ? isDarkMode
                                    ? 'text-gray-500'
                                    : 'text-gray-500'
                                  : 'text-black/70'
                              }`}
                            >
                              {message.timestamp}
                            </p>
                          </div>
                        </div>
                      )))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div
                      className={`p-4 md:p-5 border-t ${
                        isDarkMode
                          ? 'border-white/10 bg-[#1A1A1F]'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className='flex items-center gap-3'>
                        <button
                          className={`p-2.5 rounded-lg transition-colors shrink-0 ${
                            isDarkMode
                              ? 'hover:bg-white/10'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <Image
                            src='/icons/upload-icon.svg'
                            alt='Attach'
                            width={22}
                            height={22}
                            style={{
                              filter: isDarkMode
                                ? 'brightness(0) invert(1)'
                                : 'brightness(0.5)',
                            }}
                          />
                        </button>
                        <input
                          type='text'
                          placeholder='Type a message...'
                          value={messageInput}
                          onChange={e => setMessageInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className={`flex-1 px-4 py-2.5 rounded-lg text-sm md:text-base border transition-colors ${
                            isDarkMode
                              ? 'bg-transparent border-white/10 text-white placeholder-gray-500 focus:border-[#F1CB68]'
                              : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#F1CB68]'
                          } focus:outline-none`}
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={!messageInput.trim()}
                          className='px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shrink-0'
                          style={{
                            background:
                              'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
                            color: '#000000',
                          }}
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div
                    className={`flex-1 flex items-center justify-center ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    <p className='text-sm md:text-base'>
                      {isMobile
                        ? 'Select a conversation to start chatting'
                        : 'Select a conversation to view messages'}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Panel - Context & Actions - Desktop Only */}
              {selectedItem && (
                <div
                  className={`hidden xl:flex w-80 border-l flex-col ${
                    isDarkMode
                      ? 'border-white/10 bg-[#1A1A1F]'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div
                    className={`p-4 border-b ${
                      isDarkMode ? 'border-white/10' : 'border-gray-200'
                    }`}
                  >
                    <h3
                      className={`font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {selectedItem.type === 'chat'
                        ? 'Chat Details'
                        : 'Ticket Details'}
                    </h3>
                  </div>

                  <div className='flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6'>
                    {/* User Details */}
                    <div>
                      <h4
                        className={`text-sm font-medium mb-3 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        User Details
                      </h4>
                      <div className='space-y-3'>
                        <div className='flex items-center gap-3'>
                          <div className='w-12 h-12 rounded-full overflow-hidden bg-[#F1CB68] flex items-center justify-center'>
                            <Image
                              src={selectedItem.userAvatar}
                              alt={selectedItem.userName}
                              width={50}
                              height={50}
                              className='w-full h-full object-cover'
                            />
                          </div>
                          <div>
                            <p
                              className={`font-medium ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}
                            >
                              {selectedItem.userName}
                            </p>
                            <p
                              className={`text-xs ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}
                            >
                              {selectedItem.isOnline ? 'Online' : 'Offline'}
                            </p>
                          </div>
                        </div>
                        {/* Plan Type / Last Login are staff-facing context about
                            the OTHER party — meaningless on an investor's own
                            self-view, so hide them for that role. */}
                        {!isInvestor && (
                          <>
                            <div
                              className={`p-3 rounded-lg ${
                                isDarkMode ? 'bg-white/5' : 'bg-gray-50'
                              }`}
                            >
                              <p
                                className={`text-xs mb-1 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}
                              >
                                Plan Type
                              </p>
                              {contextLoading ? (
                                <div className={`h-4 w-20 rounded animate-pulse ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                              ) : (
                                <p
                                  className={`font-medium capitalize ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                  }`}
                                >
                                  {selectedContext?.subscription_plan || '—'}
                                </p>
                              )}
                            </div>
                            <div
                              className={`p-3 rounded-lg ${
                                isDarkMode ? 'bg-white/5' : 'bg-gray-50'
                              }`}
                            >
                              <p
                                className={`text-xs mb-1 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}
                              >
                                Last Login
                              </p>
                              {contextLoading ? (
                                <div className={`h-4 w-24 rounded animate-pulse ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                              ) : (
                                <p
                                  className={`font-medium ${
                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                  }`}
                                >
                                  {selectedContext?.last_login ? formatTimeAgo(selectedContext.last_login) : '—'}
                                </p>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Ticket/Chat Details */}
                    <div>
                      <h4
                        className={`text-sm font-medium mb-3 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        {selectedItem.type === 'chat' ? 'Chat' : 'Ticket'}{' '}
                        Details
                      </h4>
                      <div className='space-y-3'>
                        {selectedItem.type === 'ticket' && (
                          <>
                            <div
                              className={`p-3 rounded-lg ${
                                isDarkMode ? 'bg-white/5' : 'bg-gray-50'
                              }`}
                            >
                              <p
                                className={`text-xs mb-1 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}
                              >
                                Type
                              </p>
                              <p
                                className={`font-medium ${
                                  isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}
                              >
                                Support Ticket
                              </p>
                            </div>
                            <div
                              className={`p-3 rounded-lg ${
                                isDarkMode ? 'bg-white/5' : 'bg-gray-50'
                              }`}
                            >
                              <p
                                className={`text-xs mb-1 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}
                              >
                                Priority
                              </p>
                              <p
                                className={`font-medium ${
                                  isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}
                              >
                                {selectedItem.priority || 'Medium'}
                              </p>
                            </div>
                          </>
                        )}
                        <div
                          className={`p-3 rounded-lg ${
                            isDarkMode ? 'bg-white/5' : 'bg-gray-50'
                          }`}
                        >
                          <p
                            className={`text-xs mb-1 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}
                          >
                            Status
                          </p>
                          <p
                            className={`font-medium ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {titleCase(selectedItem.status) || 'Open'}
                          </p>
                        </div>
                        <div
                          className={`p-3 rounded-lg ${
                            isDarkMode ? 'bg-white/5' : 'bg-gray-50'
                          }`}
                        >
                          <p
                            className={`text-xs mb-1 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}
                          >
                            Assigned Agent
                          </p>
                          <p
                            className={`font-medium ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {selectedItem.assignedAdvisor?.name || 'Unassigned'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                      <h4
                        className={`text-sm font-medium mb-3 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Quick Actions
                      </h4>
                      <div className='space-y-2'>
                        {/* Assign is admin-only (assign:tickets permission) */}
                        {isAdmin && selectedItem.type === 'ticket' && (
                          <button
                            onClick={handleReassign}
                            className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                              isDarkMode
                                ? 'bg-white/10 hover:bg-white/20 text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                            }`}
                          >
                            Re-assign
                          </button>
                        )}
                        {isAdmin && selectedItem.type === 'asset_request' && (
                          <button
                            onClick={handleReassign}
                            className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                              isDarkMode
                                ? 'bg-white/10 hover:bg-white/20 text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                            }`}
                          >
                            Assign advisor
                          </button>
                        )}
                        {selectedItem.type === 'ticket' && (
                          <button
                            onClick={handleEscalate}
                            disabled={escalating}
                            className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                              isDarkMode
                                ? 'bg-white/10 hover:bg-white/20 text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                            }`}
                          >
                            {escalating ? 'Escalating…' : 'Escalate'}
                          </button>
                        )}
                        {selectedItem.type !== 'asset_request' && (
                          <button
                            className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isDarkMode
                                ? 'bg-white/10 hover:bg-white/20 text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                            }`}
                          >
                            {selectedItem.type === 'chat'
                              ? 'Convert to Ticket'
                              : 'Convert to Chat'}
                          </button>
                        )}
                        <button
                          className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isDarkMode
                              ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                              : 'bg-red-50 hover:bg-red-100 text-red-600'
                          }`}
                        >
                          Close
                        </button>
                      </div>
                    </div>

                    {/* Internal Notes */}
                    <div>
                      <h4
                        className={`text-sm font-medium mb-3 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Internal Notes
                      </h4>
                      <textarea
                        placeholder='Add internal notes (not visible to user)...'
                        className={`w-full px-3 py-2 rounded-lg text-sm border resize-none ${
                          isDarkMode
                            ? 'bg-transparent border-white/10 text-white placeholder-gray-500 focus:border-[#F1CB68]'
                            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#F1CB68]'
                        } focus:outline-none`}
                        rows={4}
                      />
                      <button
                        className='mt-2 w-full px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90'
                        style={{
                          background:
                            'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
                          color: '#000000',
                        }}
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Reports Tab */
            <div className='flex-1 overflow-y-auto p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Support Analytics
                </h2>
                <div className={`inline-flex rounded-lg p-1 ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                  {['7d', '30d', '90d'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setAnalyticsRange(r)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        analyticsRange === r ? 'bg-[#F1CB68]/20 text-[#BF9B30]' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {r === '7d' ? '7 days' : r === '30d' ? '30 days' : '90 days'}
                    </button>
                  ))}
                </div>
              </div>

              {analyticsLoading && (
                <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading analytics…</p>
              )}

              {/* Stats Grid — admin gets the all-tickets shape, advisor/investor
                  get the role-scoped /support/analytics shape. */}
              {isAdmin ? (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
                  <StatCard
                    label='Total Chats Handled'
                    value={analytics?.summary?.total_chats_handled?.value ?? '—'}
                    change={pctLabel(analytics?.summary?.total_chats_handled?.change_pct)}
                    isDarkMode={isDarkMode}
                  />
                  <StatCard
                    label='Average Response Time'
                    value={analytics?.summary?.avg_response_time?.value_label ?? '—'}
                    change={pctLabel(analytics?.summary?.avg_response_time?.change_pct)}
                    isDarkMode={isDarkMode}
                  />
                  <StatCard
                    label='Unresolved Issues'
                    value={analytics?.summary?.unresolved_issues?.value ?? '—'}
                    change={pctLabel(analytics?.summary?.unresolved_issues?.change_pct)}
                    isDarkMode={isDarkMode}
                  />
                  <StatCard
                    label='Satisfaction Rate'
                    value={
                      analytics?.summary?.satisfaction_rate?.value != null
                        ? `${analytics.summary.satisfaction_rate.value}%`
                        : '—'
                    }
                    change={pctLabel(analytics?.summary?.satisfaction_rate?.change_pct)}
                    isDarkMode={isDarkMode}
                  />
                </div>
              ) : (
                <>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4'>
                    <StatCard
                      label={isAdvisor ? 'Assigned Tickets' : 'Total Tickets'}
                      value={analytics?.summary?.total_tickets?.value ?? '—'}
                      change={pctLabel(analytics?.summary?.total_tickets?.change_pct)}
                      isDarkMode={isDarkMode}
                    />
                    <StatCard
                      label='Unresolved Issues'
                      value={analytics?.summary?.unresolved_issues?.value ?? '—'}
                      change={pctLabel(analytics?.summary?.unresolved_issues?.change_pct)}
                      isDarkMode={isDarkMode}
                    />
                    <StatCard
                      label='Avg First Response'
                      value={analytics?.summary?.avg_first_response?.value_label ?? '—'}
                      change={pctLabel(analytics?.summary?.avg_first_response?.change_pct)}
                      isDarkMode={isDarkMode}
                    />
                    <StatCard
                      label='Avg Resolution'
                      value={analytics?.summary?.avg_resolution?.value_label ?? '—'}
                      change={pctLabel(analytics?.summary?.avg_resolution?.change_pct)}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                    <StatCard
                      label='Satisfaction Rate'
                      value={
                        analytics?.summary?.satisfaction_rate?.value != null
                          ? `${analytics.summary.satisfaction_rate.value}%`
                          : '—'
                      }
                      change={pctLabel(analytics?.summary?.satisfaction_rate?.change_pct)}
                      isDarkMode={isDarkMode}
                    />
                    <div
                      className={`p-4 rounded-2xl ${
                        isDarkMode
                          ? 'bg-gradient-to-br from-[#1E1E23] to-[#141419] border border-white/10'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <p className={`text-xs mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        By Status
                      </p>
                      <div className='flex items-center justify-between gap-2'>
                        {['open', 'in_progress', 'resolved', 'closed'].map((s) => (
                          <div key={s} className='text-center flex-1'>
                            <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {analytics?.summary?.by_status?.[s] ?? 0}
                            </p>
                            <p className={`text-[11px] capitalize ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {s.replace('_', ' ')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Charts Section — the richer breakdowns are admin-only. */}
              {isAdmin && (
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <div
                  className={`p-6 rounded-2xl ${
                    isDarkMode
                      ? 'bg-gradient-to-br from-[#1E1E23] to-[#141419] border border-white/10'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <h3
                    className={`text-lg font-semibold mb-4 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Chats per Agent
                  </h3>
                  <div className='space-y-3'>
                    {(analytics?.chats_per_agent || []).length === 0 ? (
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        No data for this range.
                      </p>
                    ) : (
                      analytics.chats_per_agent.map((a) => {
                        const max = Math.max(...analytics.chats_per_agent.map((x) => x.count || 0), 1);
                        const width = Math.round(((a.count || 0) / max) * 100);
                        return (
                          <div key={a.agent_id || a.agent_name} className='flex items-center justify-between'>
                            <span className={`text-sm truncate mr-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {a.agent_name}
                            </span>
                            <div className='flex items-center gap-2'>
                              <div className={`w-32 h-2 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                                <div className='h-2 rounded-full bg-[#F1CB68]' style={{ width: `${width}%` }} />
                              </div>
                              <span className={`text-sm font-medium w-12 text-right ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {a.count}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div
                  className={`p-6 rounded-2xl ${
                    isDarkMode
                      ? 'bg-gradient-to-br from-[#1E1E23] to-[#141419] border border-white/10'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <h3
                    className={`text-lg font-semibold mb-4 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Common Topics
                  </h3>
                  <div className='space-y-2'>
                    {(analytics?.common_topics || []).length === 0 ? (
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        No data for this range.
                      </p>
                    ) : (
                      analytics.common_topics.map((item) => (
                        <div
                          key={item.topic}
                          className='flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors'
                        >
                          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {item.topic}
                          </span>
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {item.count}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              )}
            </div>
          )}

      {/* Re-assign Ticket Modal */}
      <AssignmentModal
        isOpen={reassignModalOpen}
        setIsOpen={setReassignModalOpen}
        onAssign={handleAssign}
        title={selectedItem?.type === 'asset_request' ? 'Assign Asset Request' : 'Re-assign Ticket'}
        itemName={selectedItem?.type === 'asset_request' ? 'request' : 'ticket'}
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(241, 203, 104, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(241, 203, 104, 0.5);
        }
      `}</style>
    </div>
    </SecureRoute>
  );
}

// Stat Card Component
function StatCard({ label, value, change, isDarkMode }) {
  const hasChange = typeof change === 'string' && change.length > 0;
  const isPositive = hasChange && change.startsWith('+');
  return (
    <div
      className={`p-6 rounded-2xl ${
        isDarkMode
          ? 'bg-gradient-to-br from-[#1E1E23] to-[#141419] border border-white/10'
          : 'bg-white border border-gray-200'
      }`}
    >
      <p
        className={`text-sm mb-2 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}
      >
        {label}
      </p>
      <div className='flex items-end justify-between'>
        <h3
          className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          {value}
        </h3>
        {hasChange && (
          <span
            className={`text-sm font-medium ${
              isPositive ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {change}
          </span>
        )}
      </div>
    </div>
  );
}
