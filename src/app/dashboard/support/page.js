'use client';
import NewTicketModal from '@/components/dashboard/NewTicketModal';
import { useTheme } from '@/context/ThemeContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import DocumentUploadModal from '@/components/dashboard/DocumentUploadModal';
import TicketRatingModal from '@/components/support/TicketRatingModal';
import {
  listTicketsPage,
  createTicket,
  updateTicket,
  uploadTicketDocuments,
  getTicketStatistics,
  addTicketComment,
  getTicketComments,
  getTicketHistory,
} from '@/utils/supportTicketsApi';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';

// The list payload carries created_at / updated_at (camelised to createdAt /
// updatedAt by the util). Reading `ticket.created` / `ticket.updated` — keys
// the backend has never sent — is what left both columns blank.
// updated_at stays NULL until a ticket is first touched, so fall back to created.
const formatTicketDate = value =>
  value
    ? new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

export default function SupportPage() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  // Every ticket on this page belongs to the logged-in user, so when the
  // backend doesn't send an issuer name, theirs is the correct one to show.
  const { user } = useAuth();
  const loggedInName =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    user?.name ||
    user?.email?.split('@')[0] ||
    '';
  const [ticketFilter, setTicketFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ratingTicket, setRatingTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const mapTicket = ticket => ({
    id: ticket.id || ticket.ticketId,
    ticketNumber: ticket.ticketNumber,
    subject: ticket.subject,
    description: ticket.description,
    status: ticket.status,
    priority: ticket.priority,
    category: ticket.category,
    created: formatTicketDate(ticket.createdAt),
    updated: formatTicketDate(ticket.updatedAt || ticket.createdAt),
    resolvedAt: ticket.resolvedAt,
    issuer: ticket.requester?.name || ticket.issuer || ticket.userName || '',
    assignee: ticket.assignee?.name || null,
    satisfactionRating: ticket.satisfactionRating ?? null,
    documentsCount: ticket.documentsCount ?? (ticket.documents || []).length,
    documents: ticket.documents || [],
  });

  // Fetch tickets on mount and whenever a filter or the page changes
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const params = {
          status: ticketFilter === 'all' ? undefined : ticketFilter,
          priority: priorityFilter || undefined,
          search: searchQuery || undefined,
          page,
          limit: PAGE_SIZE,
        };
        const { tickets: ticketsData, total } = await listTicketsPage(params);
        setTickets(ticketsData.map(mapTicket));
        setTotalTickets(total);
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
        toast.error('Failed to load tickets. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchTickets();
    }
  }, [mounted, ticketFilter, priorityFilter, searchQuery, page]);

  // Changing a filter invalidates the current page — reset to page 1 in the
  // same tick so a filter change doesn't fetch a stale page first.
  const changeStatusFilter = id => {
    setPage(1);
    setTicketFilter(id);
  };
  const changePriorityFilter = value => {
    setPage(1);
    setPriorityFilter(value);
  };
  const changeSearchQuery = value => {
    setPage(1);
    setSearchQuery(value);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleDocumentUpload = async (uploadData) => {
    if (selectedTicket) {
      try {
        const files = uploadData.files.map(f => f.file || f);
        await uploadTicketDocuments(selectedTicket.id, files);
        
        // Update local state
        const updatedTickets = tickets.map(t =>
          t.id === selectedTicket.id
            ? {
                ...t,
                documents: [
                  ...(t.documents || []),
                  ...uploadData.files.map(f => ({
                    name: f.name,
                    size: f.size,
                    type: f.type,
                  })),
                ],
              }
            : t
        );
        setTickets(updatedTickets);
        setSelectedTicket(null);
        toast.success('Documents uploaded successfully!');
      } catch (error) {
        console.error('Failed to upload documents:', error);
        const errorMsg = error.data?.detail || error.message || 'Failed to upload documents. Please try again.';
        toast.error(errorMsg);
      }
    }
  };

  // Status/priority/search filtering now happens server-side via listTicketsPage
  // params, so `tickets` already reflects the active filters — no client-side
  // re-filter needed (and re-filtering client-side would be wrong once the
  // list is paginated, since a page only ever holds a slice of the full set).
  const filteredTickets = tickets;

  const pageStart = totalTickets === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(page * PAGE_SIZE, totalTickets);
  const hasPrevPage = page > 1;
  const hasNextPage = page * PAGE_SIZE < totalTickets;
  const goPrevPage = () => hasPrevPage && setPage(p => p - 1);
  const goNextPage = () => hasNextPage && setPage(p => p + 1);

  const getStatusBadge = status => {
    const statusConfig = {
      open: { bg: 'rgba(241, 203, 104, 0.2)', color: '#F1CB68', text: 'Open' },
      in_progress: {
        bg: 'rgba(59, 130, 246, 0.2)',
        color: '#3B82F6',
        text: 'In Progress',
      },
      resolved: {
        bg: 'rgba(34, 197, 94, 0.2)',
        color: '#22C55E',
        text: 'Resolved',
      },
      closed: {
        bg: 'rgba(107, 114, 128, 0.2)',
        color: '#6B7280',
        text: 'Closed',
      },
    };
    const config = statusConfig[status] || statusConfig.open;
    return (
      <span
        className='px-3 py-1 rounded-full text-xs font-medium'
        style={{ background: config.bg, color: config.color }}
      >
        {config.text}
      </span>
    );
  };

  return (
    // Sidebar, Navbar, background and page padding all come from the shared
    // /dashboard layout (DashboardLayout) — rendering them here again
    // duplicated the navbar and pushed the whole page out of place.
    <div>
            {/* Header */}
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8'>
              <div>
                <h1
                  className={`text-2xl md:text-3xl font-bold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Support Ticket Center
                </h1>
                <p
                  className={`text-xs md:text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Manage your requests and support conversations.
                </p>
              </div>
              <button
                onClick={() => setIsNewTicketModalOpen(true)}
                className='px-4 md:px-6 py-2.5 md:py-3 rounded-full text-xs md:text-sm font-bold transition-all hover:opacity-90 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap'
                style={{
                  background:
                    'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
                  color: '#000000',
                }}
              >
                <span className='text-base md:text-lg'>+</span>
                New Ticket
              </button>
            </div>

            {/* Search and Filters */}
            <div className='mb-6 space-y-4'>
              {/* Search Bar */}
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none'>
                  <Image
                    src='/icons/search.svg'
                    alt='Search'
                    width={18}
                    height={18}
                    style={{
                      filter: isDarkMode
                        ? 'brightness(0) invert(1)'
                        : 'brightness(0.5)',
                    }}
                  />
                </div>
                <input
                  type='text'
                  placeholder='Search by keyword or ticket ID'
                  value={searchQuery}
                  onChange={(e) => changeSearchQuery(e.target.value)}
                  className={`w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 rounded-lg text-sm border transition-colors ${
                    isDarkMode
                      ? 'bg-transparent border-white/10 text-white placeholder-gray-500 focus:border-[#F1CB68]'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#F1CB68]'
                  } focus:outline-none`}
                />
              </div>

              {/* Filter Tabs + Priority */}
              <div className='flex flex-col md:flex-row md:items-center gap-3'>
                <div className='flex items-center gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide'>
                  {[
                    { id: 'all', label: 'All Tickets' },
                    { id: 'open', label: 'Open' },
                    { id: 'in_progress', label: 'In Progress' },
                    { id: 'resolved', label: 'Resolved' },
                    { id: 'closed', label: 'Closed' },
                  ].map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => changeStatusFilter(filter.id)}
                      className={`px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        ticketFilter === filter.id
                          ? 'text-black'
                          : isDarkMode
                          ? 'text-gray-400'
                          : 'text-gray-600'
                      }`}
                      style={{
                        background:
                          ticketFilter === filter.id
                            ? 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)'
                            : 'transparent',
                        border:
                          ticketFilter === filter.id
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

                <select
                  value={priorityFilter}
                  onChange={(e) => changePriorityFilter(e.target.value)}
                  className={`px-3 py-2 rounded-full text-xs md:text-sm font-medium shrink-0 focus:outline-none ${
                    isDarkMode
                      ? 'bg-transparent border border-white/10 text-gray-300'
                      : 'bg-white border border-gray-300 text-gray-700'
                  }`}
                >
                  <option value=''>All Priorities</option>
                  <option value='low'>Low</option>
                  <option value='medium'>Medium</option>
                  <option value='high'>High</option>
                  <option value='urgent'>Urgent</option>
                </select>
              </div>
            </div>

            {/* Tickets Table - Desktop */}
            <div
              className={`hidden md:block rounded-2xl overflow-hidden ${
                isDarkMode
                  ? 'bg-gradient-to-br from-[#1E1E23] to-[#141419] border border-white/10'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr
                      className={`border-b ${
                        isDarkMode
                          ? 'border-white/10 bg-white/5'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <th
                        className={`text-left px-6 py-4 text-xs font-semibold uppercase ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        Subject
                      </th>
                      <th
                        className={`text-left px-6 py-4 text-xs font-semibold uppercase ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        Status
                      </th>
                      <th
                        className={`text-left px-6 py-4 text-xs font-semibold uppercase ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        Created
                      </th>
                      <th
                        className={`text-left px-6 py-4 text-xs font-semibold uppercase ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        Updated
                      </th>
                      <th
                        className={`text-left px-6 py-4 text-xs font-semibold uppercase ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        Issuer
                      </th>
                      <th
                        className={`text-left px-6 py-4 text-xs font-semibold uppercase ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        ID
                      </th>
                      <th
                        className={`text-left px-6 py-4 text-xs font-semibold uppercase ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((ticket, index) => (
                      <tr
                        key={ticket.id}
                        className={`border-b transition-colors ${
                          isDarkMode
                            ? 'border-white/5 hover:bg-white/5'
                            : 'border-gray-200 hover:bg-gray-50'
                        } ${index === filteredTickets.length - 1 ? 'border-0' : ''}`}
                      >
                        <td className='px-6 py-4'>
                          <div>
                            <p
                              className={`font-medium mb-1 ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}
                            >
                              {ticket.subject}
                            </p>
                            <p
                              className={`text-sm ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}
                            >
                              {ticket.description}
                            </p>
                          </div>
                        </td>
                        <td className='px-6 text-nowrap py-4'>
                          {getStatusBadge(ticket.status)}
                        </td>
                        <td
                          className={`px-6 py-4 text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {ticket.created}
                        </td>
                        <td
                          className={`px-6 py-4 text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {ticket.updated}
                        </td>
                        <td
                          className={`px-6 py-4 text-sm font-medium ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          {ticket.issuer || loggedInName || 'N/A'}
                        </td>
                        <td
                          className={`px-6 py-4 text-sm font-mono ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {ticket.ticketNumber || ticket.id}
                        </td>
                        <td className='px-6 py-4'>
                          <button
                            onClick={() => router.push(`/dashboard/support-dashboard?ticketId=${ticket.id}`)}
                            className={`p-2 rounded-lg transition-all ${
                              isDarkMode
                                ? 'text-gray-400 hover:text-white hover:bg-white/10'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                            title='View ticket'
                          >
                            <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                              <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
                              <circle cx='12' cy='12' r='3' />
                            </svg>
                          </button>
                          {(ticket.status === 'resolved' || ticket.status === 'closed') && !ticket.satisfactionRating && (
                            <button
                              onClick={() => setRatingTicket(ticket)}
                              className='p-2 rounded-lg text-[#F1CB68] hover:bg-[#F1CB68]/10 transition-all'
                              title='Rate support'
                            >
                              <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                                <path d='M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z' />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setDocumentModalOpen(true);
                            }}
                            className={`p-2 rounded-lg transition-all ${
                              isDarkMode
                                ? 'text-gray-400 hover:text-white hover:bg-white/10'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                            title='Upload documents'
                          >
                            <svg
                              width='18'
                              height='18'
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='currentColor'
                              strokeWidth='2'
                            >
                              <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                              <path d='M14 2v6h6' />
                              <path d='M16 13H8' />
                              <path d='M16 17H8' />
                              <path d='M10 9H8' />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div
                className={`flex items-center justify-between px-6 py-4 border-t ${
                  isDarkMode ? 'border-white/10' : 'border-gray-200'
                }`}
              >
                <p
                  className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {totalTickets === 0
                    ? 'No tickets'
                    : `Showing ${pageStart}-${pageEnd} of ${totalTickets} tickets`}
                </p>
                <div className='flex items-center gap-2'>
                  <button
                    onClick={goPrevPage}
                    disabled={!hasPrevPage}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      isDarkMode
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={goNextPage}
                    disabled={!hasNextPage}
                    className='px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed'
                    style={{
                      background: 'rgba(241, 203, 104, 0.2)',
                      color: '#F1CB68',
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {/* Tickets List - Mobile */}
            <div className='md:hidden space-y-3'>
              {filteredTickets.map(ticket => (
                <div
                  key={ticket.id}
                  className={`rounded-2xl p-4 cursor-pointer hover:opacity-90 transition-opacity ${
                    isDarkMode
                      ? 'bg-gradient-to-br from-[#1E1E23] to-[#141419] border border-white/10'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className='flex items-start justify-between gap-3 mb-3'>
                    <h3
                      className={`font-medium text-sm flex-1 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {ticket.subject}
                    </h3>
                    {getStatusBadge(ticket.status)}
                  </div>
                  <p
                    className={`text-xs mb-3 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {ticket.description}
                  </p>
                  <div className='flex items-center justify-between text-xs mb-3'>
                    <div className='flex items-center gap-3'>
                      <span
                        className={
                          isDarkMode ? 'text-gray-500' : 'text-gray-500'
                        }
                      >
                        Created:{' '}
                        <span
                          className={
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }
                        >
                          {ticket.created}
                        </span>
                      </span>
                    </div>
                    <span
                      className={`font-mono ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {ticket.ticketNumber || ticket.id}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <div>
                      <span
                        className={`text-xs ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-500'
                        }`}
                      >
                        Issuer:{' '}
                        <span
                          className={`font-medium ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          {ticket.issuer || loggedInName || 'N/A'}
                        </span>
                      </span>
                    </div>
                    <button
                      onClick={() => router.push(`/dashboard/support-dashboard?ticketId=${ticket.id}`)}
                      className={`p-2 rounded-lg transition-all ${
                        isDarkMode
                          ? 'text-gray-400 hover:text-white hover:bg-white/10'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      title='View ticket'
                    >
                      <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                        <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
                        <circle cx='12' cy='12' r='3' />
                      </svg>
                    </button>
                    {(ticket.status === 'resolved' || ticket.status === 'closed') && !ticket.satisfactionRating && (
                      <button
                        onClick={() => setRatingTicket(ticket)}
                        className='p-2 rounded-lg text-[#F1CB68] hover:bg-[#F1CB68]/10 transition-all'
                        title='Rate support'
                      >
                        <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                          <path d='M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z' />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setDocumentModalOpen(true);
                      }}
                      className={`p-2 rounded-lg transition-all ${
                        isDarkMode
                          ? 'text-gray-400 hover:text-white hover:bg-white/10'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      title='Upload documents'
                    >
                      <svg
                        width='18'
                        height='18'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                      >
                        <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                        <path d='M14 2v6h6' />
                        <path d='M16 13H8' />
                        <path d='M16 17H8' />
                        <path d='M10 9H8' />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              {/* Pagination - Mobile */}
              <div className='flex items-center justify-between pt-4'>
                <p
                  className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {totalTickets === 0 ? 'No tickets' : `Showing ${pageStart}-${pageEnd} of ${totalTickets}`}
                </p>
                <div className='flex items-center gap-2'>
                  <button
                    onClick={goPrevPage}
                    disabled={!hasPrevPage}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      isDarkMode
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={goNextPage}
                    disabled={!hasNextPage}
                    className='px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed'
                    style={{
                      background: 'rgba(241, 203, 104, 0.2)',
                      color: '#F1CB68',
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

      {/* New Ticket Modal */}
      <NewTicketModal
        isOpen={isNewTicketModalOpen}
        setIsOpen={setIsNewTicketModalOpen}
        onTicketCreated={() => {
          // Refresh tickets list — a brand-new ticket belongs on page 1, so
          // jump back there rather than refetching whatever page was showing.
          setPage(1);
          const fetchTickets = async () => {
            try {
              const params = {
                status: ticketFilter === 'all' ? undefined : ticketFilter,
                priority: priorityFilter || undefined,
                search: searchQuery || undefined,
                page: 1,
                limit: PAGE_SIZE,
              };
              const { tickets: ticketsData, total } = await listTicketsPage(params);
              setTickets(ticketsData.map(mapTicket));
              setTotalTickets(total);
            } catch (error) {
              console.error('Failed to refresh tickets:', error);
            }
          };
          fetchTickets();
        }}
      />

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={documentModalOpen}
        setIsOpen={setDocumentModalOpen}
        onUpload={handleDocumentUpload}
        title='Upload Documents'
        itemType='ticket'
        itemId={selectedTicket?.id}
      />

      <TicketRatingModal
        isOpen={!!ratingTicket}
        onClose={() => setRatingTicket(null)}
        ticket={ratingTicket}
        isDarkMode={isDarkMode}
      />

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
