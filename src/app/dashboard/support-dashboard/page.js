'use client';
import Navbar from '@/components/dashboard/Navbar';
import Sidebar from '@/components/dashboard/Sidebar';
import SecureRoute from '@/components/auth/SecureRoute';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  listTickets,
  getTicket,
  getTicketComments,
  addTicketComment,
} from '@/utils/supportTicketsApi';
import { getConversations, getMessages, sendMessage } from '@/utils/chatApi';

export default function SupportDashboardPage() {
  const { isDarkMode } = useTheme();
  const { isAdmin, isAdvisor } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  // Fetch tickets & chat conversations
  useEffect(() => {
    fetchTickets();
    fetchConversations();
  }, [activeFilter, searchQuery]);

  // Fetch ticket/chat messages when item is selected
  useEffect(() => {
    if (!selectedItem) return;
    if (selectedItem.type === 'ticket') {
      fetchTicketComments(selectedItem.id);
    } else if (selectedItem.type === 'chat') {
      fetchConversationMessages(selectedItem.id);
    }
  }, [selectedItem]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await listTickets({
        status:
          activeFilter === 'all' ||
          activeFilter === 'chats' ||
          activeFilter === 'tickets'
            ? undefined
            : activeFilter,
        search: searchQuery || undefined,
        limit: 100,
      });
      const ticketsData = response.data || response || [];
      
      // Transform tickets to match UI format
      const transformedTickets = ticketsData.map((ticket) => ({
        id: ticket.id || ticket.ticketId,
        type: 'ticket',
        userName: ticket.userName || ticket.user_name || ticket.userEmail?.split('@')[0] || 'User',
        userAvatar: '/icons/user-avatar.svg',
        lastMessage: ticket.description || ticket.subject || 'No description',
        timestamp: ticket.updatedAt ? formatTimeAgo(ticket.updatedAt) : formatTimeAgo(ticket.updated_at || ticket.created_at),
        status: ticket.status || 'open',
        isOnline: false,
        priority: ticket.priority || 'medium',
        ticketId: ticket.ticketId || ticket.id,
        subject: ticket.subject,
        description: ticket.description,
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
      const response = await getConversations('active', 50, 0);
      const data = response?.conversations || response?.data || [];

      const transformedConversations = data.map(conv => {
        const primaryParticipant =
          conv.participants?.find(p => p.role !== 'admin') ||
          conv.participants?.[0];

        return {
          id: conv.id,
          type: 'chat',
          userName:
            conv.subject ||
            primaryParticipant?.userName ||
            primaryParticipant?.userId ||
            'Conversation',
          userAvatar: primaryParticipant?.userAvatar || '/icons/user-avatar.svg',
          lastMessage: conv.lastMessage?.content || 'No messages yet',
          timestamp: formatTimeAgo(
            conv.updatedAt || conv.lastMessage?.timestamp,
          ),
          status: 'open',
          isOnline: conv.participants?.some(p => p.isOnline),
          unreadCount: conv.unreadCount || 0,
        };
      });

      setConversations(transformedConversations);
    } catch (error) {
      console.error('Failed to fetch chat conversations:', error);
    }
  };

  const fetchTicketComments = async (ticketId) => {
    try {
      const response = await getTicketComments(ticketId);
      const comments = response.data || response || [];
      
      // Transform comments to messages format
      const transformedMessages = comments.map((comment) => ({
        id: comment.id,
        sender: comment.isAdmin || comment.is_admin ? 'admin' : 'user',
        message: comment.message || comment.content || '',
        timestamp: comment.createdAt ? formatTime(comment.createdAt) : formatTime(comment.created_at),
      }));
      
      setMessages(prev => ({
        ...prev,
        [ticketId]: transformedMessages,
      }));
    } catch (error) {
      console.error('Failed to fetch ticket comments:', error);
    }
  };

  const fetchConversationMessages = async (conversationId) => {
    try {
      const response = await getMessages(conversationId, 50);
      const msgs = response?.messages || response?.data || [];

      const transformedMessages = msgs.map(message => ({
        id: message.id,
        sender: 'user',
        message: message.content || '',
        timestamp: message.timestamp ? formatTime(message.timestamp) : getCurrentTime(),
      }));

      setMessages(prev => ({
        ...prev,
        [conversationId]: transformedMessages,
      }));
    } catch (error) {
      console.error('Failed to fetch conversation messages:', error);
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
  const allItems = [...tickets, ...conversations];

  // Get messages for selected item
  const currentMessages = selectedItem ? messages[selectedItem.id] || [] : [];

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

  // Handle send message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedItem) return;

    const content = messageInput.trim();

    try {
      if (selectedItem.type === 'ticket') {
        await addTicketComment(selectedItem.id, { message: content });

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
    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'chats' && item.type === 'chat') ||
      (activeFilter === 'tickets' && item.type === 'ticket') ||
      item.status === activeFilter;

    const matchesSearch =
      searchQuery === '' ||
      item.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.ticketId &&
        item.ticketId.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  // Select first item by default (desktop only)
  useEffect(() => {
    if (filteredItems.length > 0 && !selectedItem && !isMobile) {
      setSelectedItem(filteredItems[0]);
    }
  }, [filteredItems, selectedItem, isMobile]);

  // Handle item selection - show chat view on mobile/tablet
  const handleItemSelect = item => {
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
    <SecureRoute allowedRoles={['admin', 'advisor']}>
    <div
      className={`flex h-screen ${isDarkMode ? 'bg-[#1A1A1F]' : 'bg-gray-50'}`}
    >
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className='flex-1 flex flex-col overflow-hidden lg:ml-64'>
        {/* Navbar */}
        <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Page Content */}
        <main className='flex-1  overflow-hidden flex flex-col'>
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
                } w-full lg:w-80 border-r flex-col ${
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
                  {filteredItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleItemSelect(item)}
                      className={`p-4 border-b cursor-pointer transition-colors ${
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
                        <div className='relative shrink-0 w-10 h-10 rounded-full overflow-hidden bg-[#F1CB68] flex items-center justify-center'>
                          <Image
                            src={item.userAvatar}
                            alt={item.userName}
                            width={40}
                            height={40}
                            className='w-full h-full object-cover'
                          />
                          {item.isOnline && (
                            <div
                              className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2'
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
                              className={`font-medium text-sm truncate ${
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

                          <div className='flex items-center gap-2 mb-1'>
                            <Image
                              src={
                                item.type === 'chat'
                                  ? '/icons/chat.svg'
                                  : '/icons/ticket.svg'
                              }
                              alt={item.type === 'chat' ? 'Chat' : 'Ticket'}
                              width={16}
                              height={16}
                              style={{
                                filter: isDarkMode
                                  ? 'brightness(0) invert(1)'
                                  : 'brightness(0.5)',
                              }}
                            />
                            <p
                              className={`text-xs truncate ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}
                            >
                              {item.lastMessage}
                            </p>
                          </div>

                          <div className='flex items-center gap-2'>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                item.status === 'active' ||
                                item.status === 'inprogress'
                                  ? 'bg-green-500/20 text-green-500'
                                  : item.status === 'waiting'
                                  ? 'bg-yellow-500/20 text-yellow-500'
                                  : 'bg-gray-500/20 text-gray-500'
                              }`}
                            >
                              {item.status === 'active'
                                ? 'Active'
                                : item.status === 'inprogress'
                                ? 'In Progress'
                                : item.status === 'waiting'
                                ? 'Waiting'
                                : 'Closed'}
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
                  ))}
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
                      className={`p-3 md:p-4 border-b flex items-center justify-between ${
                        isDarkMode
                          ? 'border-white/10 bg-[#1A1A1F]'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className='flex items-center gap-2 md:gap-3 flex-1 min-w-0'>
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
                        <div className='w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden bg-[#F1CB68] flex items-center justify-center shrink-0'>
                          <Image
                            src={selectedItem.userAvatar}
                            alt={selectedItem.userName}
                            width={40}
                            height={40}
                            className='w-full h-full object-cover'
                          />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p
                            className={`font-medium text-sm md:text-base truncate ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {selectedItem.userName}
                          </p>
                          <p
                            className={`text-xs truncate ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}
                          >
                            {selectedItem.isOnline ? 'Online' : 'Offline'} •{' '}
                            {selectedItem.type === 'chat' ? 'Chat' : 'Ticket'}{' '}
                            {selectedItem.ticketId &&
                              `• ${selectedItem.ticketId}`}
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
                      className={`flex-1 overflow-y-auto p-3 md:p-4 custom-scrollbar space-y-3 md:space-y-4 ${
                        isDarkMode ? 'bg-[#1A1A1F]' : 'bg-white'
                      }`}
                    >
                      {currentMessages.map(message => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender === 'user'
                              ? 'justify-start'
                              : 'justify-end'
                          }`}
                        >
                          <div
                            className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-3 md:px-4 py-2 text-sm ${
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
                            <p className='text-sm'>{message.message}</p>
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
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div
                      className={`p-3 md:p-4 border-t ${
                        isDarkMode
                          ? 'border-white/10 bg-[#1A1A1F]'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className='flex items-center gap-2'>
                        <button
                          className={`p-2 rounded-lg transition-colors shrink-0 ${
                            isDarkMode
                              ? 'hover:bg-white/10'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <Image
                            src='/icons/upload-icon.svg'
                            alt='Attach'
                            width={20}
                            height={20}
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
                          className={`flex-1 px-3 md:px-4 py-2 rounded-lg text-sm border transition-colors ${
                            isDarkMode
                              ? 'bg-transparent border-white/10 text-white placeholder-gray-500 focus:border-[#F1CB68]'
                              : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#F1CB68]'
                          } focus:outline-none`}
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={!messageInput.trim()}
                          className='px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shrink-0'
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
                          <p
                            className={`font-medium ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            Premium
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
                            Last Login
                          </p>
                          <p
                            className={`font-medium ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            2 hours ago
                          </p>
                        </div>
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
                            {selectedItem.status === 'active'
                              ? 'Active'
                              : selectedItem.status === 'inprogress'
                              ? 'In Progress'
                              : selectedItem.status === 'waiting'
                              ? 'Waiting'
                              : 'Closed'}
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
                            Sarah Johnson
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
                        {/* Re-assign is admin-only (assign:tickets permission) */}
                        {isAdmin && (
                          <button
                            className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isDarkMode
                                ? 'bg-white/10 hover:bg-white/20 text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                            }`}
                          >
                            Re-assign
                          </button>
                        )}
                        <button
                          className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isDarkMode
                              ? 'bg-white/10 hover:bg-white/20 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                          }`}
                        >
                          Escalate
                        </button>
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
              <h2
                className={`text-2xl font-bold mb-6 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Support Analytics
              </h2>

              {/* Stats Grid */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
                <StatCard
                  label='Total Chats Handled'
                  value='1,234'
                  change='+12%'
                  isDarkMode={isDarkMode}
                />
                <StatCard
                  label='Average Response Time'
                  value='2.5 min'
                  change='-5%'
                  isDarkMode={isDarkMode}
                />
                <StatCard
                  label='Unresolved Issues'
                  value='23'
                  change='-8%'
                  isDarkMode={isDarkMode}
                />
                <StatCard
                  label='Satisfaction Rate'
                  value='94%'
                  change='+2%'
                  isDarkMode={isDarkMode}
                />
              </div>

              {/* Charts Section */}
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
                    {[
                      'Sarah Johnson',
                      'Mike Chen',
                      'Emma Wilson',
                      'David Brown',
                    ].map((agent, index) => (
                      <div
                        key={agent}
                        className='flex items-center justify-between'
                      >
                        <span
                          className={`text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          {agent}
                        </span>
                        <div className='flex items-center gap-2'>
                          <div
                            className={`w-32 h-2 rounded-full ${
                              isDarkMode ? 'bg-white/10' : 'bg-gray-200'
                            }`}
                          >
                            <div
                              className='h-2 rounded-full bg-[#F1CB68]'
                              style={{ width: `${60 + index * 10}%` }}
                            />
                          </div>
                          <span
                            className={`text-sm font-medium w-12 text-right ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {120 + index * 15}
                          </span>
                        </div>
                      </div>
                    ))}
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
                    {[
                      { topic: 'Asset Appraisal', count: 45 },
                      { topic: 'Billing Issues', count: 32 },
                      { topic: 'Document Upload', count: 28 },
                      { topic: 'Account Access', count: 22 },
                    ].map(item => (
                      <div
                        key={item.topic}
                        className='flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors'
                      >
                        <span
                          className={`text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          {item.topic}
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

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
  const isPositive = change.startsWith('+');
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
        <span
          className={`text-sm font-medium ${
            isPositive ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {change}
        </span>
      </div>
    </div>
  );
}
