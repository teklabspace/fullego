'use client';
import Navbar from '@/components/dashboard/Navbar';
import Sidebar from '@/components/dashboard/Sidebar';
import { useTheme } from '@/context/ThemeContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AssignmentModal from '@/components/dashboard/AssignmentModal';
import DocumentUploadModal from '@/components/dashboard/DocumentUploadModal';

// Mock appraisal data
const mockAppraisals = [
  {
    id: 1,
    assetName: 'Gulfstream G700 Jet',
    assetImage: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400',
    category: 'Jet',
    requestDate: '2024-01-15',
    status: 'In Progress',
    assignedProvider: 'Internal Team',
    appraisedValue: null,
    valuationDate: null,
    assignedTo: null,
    comments: [],
    documents: [],
  },
  {
    id: 2,
    assetName: 'Luxury Yacht Ocean Breeze',
    assetImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
    category: 'Yacht',
    requestDate: '2024-01-10',
    status: 'Completed',
    assignedProvider: 'Marine Appraisal Group',
    appraisedValue: '$12,500,000',
    valuationDate: '2024-01-20',
  },
  {
    id: 3,
    assetName: 'Picasso Original Painting',
    assetImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400',
    category: 'Art',
    requestDate: '2024-01-08',
    status: 'Pending',
    assignedProvider: 'Art Valuation Experts',
    appraisedValue: null,
    valuationDate: null,
  },
  {
    id: 4,
    assetName: 'Private Island Paradise',
    assetImage: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400',
    category: 'Real Estate',
    requestDate: '2024-01-05',
    status: 'Awaiting Info',
    assignedProvider: 'Real Estate Appraisers Inc.',
    appraisedValue: null,
    valuationDate: null,
  },
  {
    id: 5,
    assetName: 'Vintage Ferrari Collection',
    assetImage: 'https://images.unsplash.com/photo-1492144534655-ae79c2c03457?w=400',
    category: 'Collectibles',
    requestDate: '2024-01-12',
    status: 'Completed',
    assignedProvider: 'Classic Car Valuations',
    appraisedValue: '$15,200,000',
    valuationDate: '2024-01-18',
  },
  {
    id: 6,
    assetName: 'Commercial Office Complex',
    assetImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400',
    category: 'Real Estate',
    requestDate: '2024-01-03',
    status: 'In Progress',
    assignedProvider: 'Commercial Property Assessors',
    appraisedValue: null,
    valuationDate: null,
  },
];

export default function ConciergeServicePage() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedAppraisal, setSelectedAppraisal] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [appraisals, setAppraisals] = useState(mockAppraisals);

  // Calculate stats
  const stats = {
    total: appraisals.length,
    inProgress: appraisals.filter(a => a.status === 'In Progress').length,
    completed: appraisals.filter(a => a.status === 'Completed').length,
    awaitingInfo: appraisals.filter(a => a.status === 'Awaiting Info').length,
  };

  const handleAssignConcierge = assignmentData => {
    if (selectedAppraisal) {
      const updatedAppraisals = appraisals.map(a =>
        a.id === selectedAppraisal.id
          ? {
              ...a,
              assignedTo: assignmentData.userName,
              comments: [
                ...(a.comments || []),
                {
                  id: Date.now(),
                  from: 'System',
                  message: `Task assigned to ${assignmentData.userName}`,
                  date: new Date().toISOString(),
                },
              ],
            }
          : a
      );
      setAppraisals(updatedAppraisals);
      setSelectedAppraisal({
        ...selectedAppraisal,
        assignedTo: assignmentData.userName,
        comments: updatedAppraisals.find(a => a.id === selectedAppraisal.id)
          .comments,
      });
    }
  };

  const handleDocumentUpload = uploadData => {
    if (selectedAppraisal) {
      const updatedAppraisals = appraisals.map(a =>
        a.id === selectedAppraisal.id
          ? {
              ...a,
              documents: [
                ...(a.documents || []),
                ...uploadData.files.map(f => ({
                  name: f.name,
                  size: f.size,
                  type: f.type,
                })),
              ],
            }
          : a
      );
      setAppraisals(updatedAppraisals);
      setSelectedAppraisal({
        ...selectedAppraisal,
        documents: updatedAppraisals.find(a => a.id === selectedAppraisal.id)
          .documents,
      });
    }
  };

  // Get status color
  const getStatusColor = status => {
    switch (status) {
      case 'Pending':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'In Progress':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'Completed':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'Awaiting Info':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  // Format date
  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      className={`flex h-screen ${isDarkMode ? 'bg-brand-bg' : 'bg-gray-50'}`}
    >
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className='flex-1 flex flex-col overflow-hidden lg:ml-64'>
        {/* Navbar */}
        <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Page Content */}
        <main className='flex-1 overflow-y-auto'>
          <div className='p-4 md:p-6'>
            {/* Header */}
            <div className='mb-6'>
              <h1
                className={`text-2xl md:text-3xl font-bold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Appraisals
              </h1>
              <p
                className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Track and manage all your asset appraisal requests
              </p>
            </div>

            {/* Stats Summary Bar */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
              <StatCard
                label='Total Requests'
                value={stats.total}
                isDarkMode={isDarkMode}
              />
              <StatCard
                label='In Progress'
                value={stats.inProgress}
                isDarkMode={isDarkMode}
                color='blue'
              />
              <StatCard
                label='Completed'
                value={stats.completed}
                isDarkMode={isDarkMode}
                color='green'
              />
              <StatCard
                label='Awaiting Info'
                value={stats.awaitingInfo}
                isDarkMode={isDarkMode}
                color='orange'
              />
            </div>

            {/* View Mode Toggle */}
            <div className='flex items-center justify-between mb-4'>
              <p
                className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {appraisals.length} appraisal{appraisals.length !== 1 ? 's' : ''} found
              </p>
              <div className='flex gap-2'>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-[#F1CB68] text-white'
                      : isDarkMode
                      ? 'bg-white/5 text-gray-400 hover:text-white'
                      : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                  >
                    <rect x='3' y='3' width='7' height='7' />
                    <rect x='14' y='3' width='7' height='7' />
                    <rect x='3' y='14' width='7' height='7' />
                    <rect x='14' y='14' width='7' height='7' />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list'
                      ? 'bg-[#F1CB68] text-white'
                      : isDarkMode
                      ? 'bg-white/5 text-gray-400 hover:text-white'
                      : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                  >
                    <path d='M3 3h18v18H3z' />
                    <path d='M3 9h18' />
                    <path d='M3 15h18' />
                    <path d='M9 3v18' />
                    <path d='M15 3v18' />
                  </svg>
                </button>
              </div>
            </div>

            {/* Appraisals Grid View */}
            {viewMode === 'grid' && (
              <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
                {appraisals.map(appraisal => (
                  <AppraisalCard
                    key={appraisal.id}
                    appraisal={appraisal}
                    isDarkMode={isDarkMode}
                    getStatusColor={getStatusColor}
                    formatDate={formatDate}
                    onViewDetails={() => setSelectedAppraisal(appraisal)}
                  />
                ))}
              </div>
            )}

            {/* Appraisals List View */}
            {viewMode === 'list' && (
              <div
                className={`rounded-xl border overflow-hidden ${
                  isDarkMode
                    ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr
                        className={`border-b ${
                          isDarkMode
                            ? 'border-[#FFFFFF14]'
                            : 'border-gray-200'
                        }`}
                      >
                        <th
                          className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          Asset
                        </th>
                        <th
                          className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          Category
                        </th>
                        <th
                          className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          Request Date
                        </th>
                        <th
                          className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          Status
                        </th>
                        <th
                          className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          Provider
                        </th>
                        <th
                          className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          Appraised Value
                        </th>
                        <th
                          className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {appraisals.map(appraisal => (
                        <AppraisalTableRow
                          key={appraisal.id}
                          appraisal={appraisal}
                          isDarkMode={isDarkMode}
                          getStatusColor={getStatusColor}
                          formatDate={formatDate}
                          onViewDetails={() => setSelectedAppraisal(appraisal)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Appraisal Detail Modal */}
      {selectedAppraisal && (
        <AppraisalDetailModal
          appraisal={selectedAppraisal}
          isDarkMode={isDarkMode}
          onClose={() => setSelectedAppraisal(null)}
          formatDate={formatDate}
          getStatusColor={getStatusColor}
          onAssign={() => setAssignmentModalOpen(true)}
          onDocumentUpload={() => setDocumentModalOpen(true)}
          onCommentAdd={comment => {
            const updatedAppraisals = appraisals.map(a =>
              a.id === selectedAppraisal.id
                ? {
                    ...a,
                    comments: [
                      ...(a.comments || []),
                      {
                        id: Date.now(),
                        from: 'CRM Staff',
                        message: comment,
                        date: new Date().toISOString(),
                      },
                    ],
                  }
                : a
            );
            setAppraisals(updatedAppraisals);
            setSelectedAppraisal({
              ...selectedAppraisal,
              comments: updatedAppraisals.find(a => a.id === selectedAppraisal.id)
                .comments,
            });
          }}
        />
      )}

      {/* Assignment Modal */}
      <AssignmentModal
        isOpen={assignmentModalOpen}
        setIsOpen={setAssignmentModalOpen}
        onAssign={handleAssignConcierge}
        title='Assign to CRM User'
        itemName='concierge request'
      />

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={documentModalOpen}
        setIsOpen={setDocumentModalOpen}
        onUpload={handleDocumentUpload}
        title='Upload Documents'
        itemType='concierge'
        itemId={selectedAppraisal?.id}
      />
    </div>
  );
}

// Stat Card Component
function StatCard({ label, value, isDarkMode, color = 'default' }) {
  const colorClasses = {
    default: 'border-[#F1CB68]/20 bg-[#F1CB68]/10',
    blue: 'border-blue-500/20 bg-blue-500/10',
    green: 'border-green-500/20 bg-green-500/10',
    orange: 'border-orange-500/20 bg-orange-500/10',
  };

  return (
    <div
      className={`rounded-xl border p-4 ${
        isDarkMode
          ? `bg-[#1A1A1D] ${colorClasses[color]}`
          : 'bg-white border-gray-200'
      }`}
    >
      <p
        className={`text-xs mb-2 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}
      >
        {label}
      </p>
      <p
        className={`text-2xl font-bold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// Appraisal Card Component
function AppraisalCard({
  appraisal,
  isDarkMode,
  getStatusColor,
  formatDate,
  onViewDetails,
}) {
  return (
    <div
      className={`rounded-xl border p-4 transition-all hover:shadow-lg ${
        isDarkMode
          ? 'bg-[#1A1A1D] border-[#FFFFFF14] hover:border-[#F1CB68]'
          : 'bg-white border-gray-200 hover:border-[#F1CB68]'
      }`}
    >
      {/* Asset Image & Name */}
      <div className='flex items-start gap-3 mb-4'>
        <img
          src={appraisal.assetImage}
          alt={appraisal.assetName}
          className='w-16 h-16 rounded-lg object-cover'
        />
        <div className='flex-1 min-w-0'>
          <h3
            className={`text-sm font-semibold mb-1 truncate ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            {appraisal.assetName}
          </h3>
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              isDarkMode
                ? 'bg-white/5 text-gray-300'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {appraisal.category}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className='space-y-2 mb-4'>
        <div className='flex items-center justify-between'>
          <span
            className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Request Date
          </span>
          <span
            className={`text-xs ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            {formatDate(appraisal.requestDate)}
          </span>
        </div>

        <div className='flex items-center justify-between'>
          <span
            className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Status
          </span>
          <span
            className={`text-xs px-2 py-1 rounded border ${getStatusColor(
              appraisal.status
            )}`}
          >
            {appraisal.status}
          </span>
        </div>

        <div className='flex items-center justify-between'>
          <span
            className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Provider
          </span>
          <span
            className={`text-xs font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            {appraisal.assignedProvider}
          </span>
        </div>

        {appraisal.appraisedValue && (
          <div className='flex items-center justify-between'>
            <span
              className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Appraised Value
            </span>
            <span
              className={`text-sm font-semibold ${
                isDarkMode ? 'text-[#F1CB68]' : 'text-[#F1CB68]'
              }`}
            >
              {appraisal.appraisedValue}
            </span>
          </div>
        )}
      </div>

      {/* View Details Button */}
      <button
        onClick={onViewDetails}
        className={`w-full py-2 text-xs rounded-lg font-medium transition-all ${
          isDarkMode
            ? 'bg-[#F1CB68] text-white hover:bg-[#F1CB68]/80'
            : 'bg-[#F1CB68] text-white hover:bg-[#F1CB68]/80'
        }`}
      >
        View Details
      </button>
    </div>
  );
}

// Appraisal Table Row Component
function AppraisalTableRow({
  appraisal,
  isDarkMode,
  getStatusColor,
  formatDate,
  onViewDetails,
}) {
  return (
    <tr
      className={`border-b ${
        isDarkMode
          ? 'border-[#FFFFFF14] hover:bg-white/5'
          : 'border-gray-200 hover:bg-gray-50'
      }`}
    >
      <td className='px-4 py-3'>
        <div className='flex items-center gap-3'>
          <img
            src={appraisal.assetImage}
            alt={appraisal.assetName}
            className='w-12 h-12 rounded-lg object-cover'
          />
          <span
            className={`text-sm font-medium ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            {appraisal.assetName}
          </span>
        </div>
      </td>
      <td className='px-4 py-3'>
        <span
          className={`text-xs px-2 py-1 rounded ${
            isDarkMode
              ? 'bg-white/5 text-gray-300'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {appraisal.category}
        </span>
      </td>
      <td className='px-4 py-3'>
        <span
          className={`text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          {formatDate(appraisal.requestDate)}
        </span>
      </td>
      <td className='px-4 py-3'>
        <span
          className={`text-xs px-2 py-1 rounded border ${getStatusColor(
            appraisal.status
          )}`}
        >
          {appraisal.status}
        </span>
      </td>
      <td className='px-4 py-3'>
        <span
          className={`text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          {appraisal.assignedProvider}
        </span>
      </td>
      <td className='px-4 py-3'>
        <span
          className={`text-sm font-semibold ${
            appraisal.appraisedValue
              ? isDarkMode
                ? 'text-[#F1CB68]'
                : 'text-[#F1CB68]'
              : isDarkMode
              ? 'text-gray-400'
              : 'text-gray-400'
          }`}
        >
          {appraisal.appraisedValue || 'Pending'}
        </span>
      </td>
      <td className='px-4 py-3'>
        <button
          onClick={onViewDetails}
          className={`px-3 py-1 text-xs rounded transition-all ${
            isDarkMode
              ? 'bg-white/5 text-white hover:bg-white/10'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }`}
        >
          View Details
        </button>
      </td>
    </tr>
  );
}

// Appraisal Detail Modal Component
function AppraisalDetailModal({
  appraisal,
  isDarkMode,
  onClose,
  formatDate,
  getStatusColor,
  onAssign,
  onDocumentUpload,
  onCommentAdd,
}) {
  const [newComment, setNewComment] = useState('');
  // Progress timeline steps
  const timelineSteps = [
    { step: 'Submitted', completed: true, date: appraisal.requestDate },
    {
      step: 'Assigned',
      completed: appraisal.status !== 'Pending',
      date: appraisal.status !== 'Pending' ? '2024-01-16' : null,
    },
    {
      step: 'Under Review',
      completed: ['In Progress', 'Completed'].includes(appraisal.status),
      date: ['In Progress', 'Completed'].includes(appraisal.status)
        ? '2024-01-18'
        : null,
    },
    {
      step: 'Completed',
      completed: appraisal.status === 'Completed',
      date: appraisal.valuationDate,
    },
  ];

  // Combine system notes with user comments
  const systemNotes = [
    {
      id: 1,
      from: 'Concierge Team',
      message: 'Your appraisal request has been received and assigned to our expert team.',
      date: '2024-01-15T10:00:00Z',
    },
    {
      id: 2,
      from: appraisal.assignedProvider,
      message: 'We have begun the valuation process. Additional documentation may be required.',
      date: '2024-01-16T14:30:00Z',
    },
    ...(appraisal.status === 'Completed'
      ? [
          {
            id: 3,
            from: appraisal.assignedProvider,
            message: 'Valuation completed. Final report is now available for download.',
            date: appraisal.valuationDate
              ? `${appraisal.valuationDate}T16:00:00Z`
              : '2024-01-20T16:00:00Z',
          },
        ]
      : []),
  ];
  const notes = [...systemNotes, ...(appraisal.comments || [])].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const handleAddComment = e => {
    e.preventDefault();
    if (newComment.trim() && onCommentAdd) {
      onCommentAdd(newComment.trim());
      setNewComment('');
    }
  };

  return (
    <>
      <style jsx>{`
        .concierge-modal-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .concierge-modal-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .concierge-modal-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .concierge-modal-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        .concierge-modal-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
        }
      `}</style>
      <div
        className='fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto'
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className={`relative w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] my-auto rounded-2xl border flex flex-col ${
            isDarkMode
              ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
              : 'bg-white border-gray-200'
          }`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between p-4 sm:p-6 border-b shrink-0 ${
              isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
            }`}
          >
          <div className='flex-1 min-w-0'>
            <h2
              className={`text-lg sm:text-xl font-semibold mb-1 truncate ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {appraisal.assetName}
            </h2>
            <p
              className={`text-xs sm:text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Appraisal Details
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all shrink-0 ${
              isDarkMode
                ? 'hover:bg-white/10 text-gray-400'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <svg
              width='20'
              height='20'
              className='sm:w-6 sm:h-6'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            >
              <path d='M18 6L6 18M6 6l12 12' />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className='p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 concierge-modal-scrollbar'>
          {/* Asset Info */}
          <div className='flex items-start gap-4'>
            <img
              src={appraisal.assetImage}
              alt={appraisal.assetName}
              className='w-24 h-24 rounded-lg object-cover'
            />
            <div className='flex-1'>
              <div className='flex items-center gap-3 mb-2'>
                <h3
                  className={`text-lg font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {appraisal.assetName}
                </h3>
                <span
                  className={`text-xs px-2 py-1 rounded border ${getStatusColor(
                    appraisal.status
                  )}`}
                >
                  {appraisal.status}
                </span>
              </div>
              <p
                className={`text-sm mb-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Category: {appraisal.category}
              </p>
              <p
                className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Assigned Provider: {appraisal.assignedProvider}
              </p>
              {appraisal.assignedTo && (
                <p
                  className={`text-sm font-medium mt-2 ${
                    isDarkMode ? 'text-[#F1CB68]' : 'text-[#F1CB68]'
                  }`}
                >
                  Assigned to: {appraisal.assignedTo}
                </p>
              )}
            </div>
            <div className='flex gap-2'>
              {onAssign && (
                <button
                  onClick={onAssign}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isDarkMode
                      ? 'bg-[#F1CB68]/20 text-[#F1CB68] hover:bg-[#F1CB68]/30'
                      : 'bg-[#F1CB68]/20 text-[#F1CB68] hover:bg-[#F1CB68]/30'
                  }`}
                >
                  Assign to CRM User
                </button>
              )}
              {onDocumentUpload && (
                <button
                  onClick={onDocumentUpload}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    isDarkMode
                      ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <svg
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                  >
                    <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                    <path d='M14 2v6h6' />
                  </svg>
                  Documents
                </button>
              )}
            </div>
          </div>

          {/* Progress Timeline */}
          <div>
            <h3
              className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Progress Timeline
            </h3>
            <div className='space-y-4'>
              {timelineSteps.map((step, index) => (
                <div key={index} className='flex items-start gap-4'>
                  <div className='flex flex-col items-center'>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        step.completed
                          ? 'bg-[#F1CB68]'
                          : isDarkMode
                          ? 'bg-gray-600'
                          : 'bg-gray-300'
                      }`}
                    />
                    {index < timelineSteps.length - 1 && (
                      <div
                        className={`w-px h-12 mt-1 ${
                          step.completed
                            ? 'bg-[#F1CB68]'
                            : isDarkMode
                            ? 'bg-gray-600'
                            : 'bg-gray-300'
                        }`}
                      />
                    )}
                  </div>
                  <div className='flex-1 pb-4'>
                    <p
                      className={`font-medium mb-1 ${
                        step.completed
                          ? isDarkMode
                            ? 'text-white'
                            : 'text-gray-900'
                          : isDarkMode
                          ? 'text-gray-500'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.step}
                    </p>
                    {step.date && (
                      <p
                        className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {formatDate(step.date)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comments Area */}
          <div>
            <h3
              className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Comments & Notes
            </h3>
            
            {/* Add Comment Form */}
            {onCommentAdd && (
              <form onSubmit={handleAddComment} className='mb-4'>
                <textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder='Add a comment or note...'
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg border text-sm transition-colors resize-none ${
                    isDarkMode
                      ? 'bg-[#2C2C2E] border-[#FFFFFF14] text-white placeholder-gray-500 focus:border-[#F1CB68]'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#F1CB68]'
                  } focus:outline-none`}
                />
                <div className='flex justify-end mt-2'>
                  <button
                    type='submit'
                    disabled={!newComment.trim()}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDarkMode
                        ? 'bg-[#F1CB68] text-black hover:bg-[#F1CB68]/80'
                        : 'bg-[#F1CB68] text-black hover:bg-[#F1CB68]/80'
                    }`}
                  >
                    Add Comment
                  </button>
                </div>
              </form>
            )}

            {/* Notes/Messages List */}
            <div className='space-y-3'>
              {notes.length > 0 ? (
                notes.map(note => (
                  <div
                    key={note.id}
                    className={`rounded-lg border p-4 ${
                      isDarkMode
                        ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className='flex items-center justify-between mb-2'>
                      <p
                        className={`text-sm font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {note.from}
                      </p>
                      <p
                        className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {formatDate(note.date)}
                      </p>
                    </div>
                    <p
                      className={`text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {note.message}
                    </p>
                  </div>
                ))
              ) : (
                <p
                  className={`text-sm text-center py-4 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}
                >
                  No comments yet. Add the first comment above.
                </p>
              )}
            </div>
          </div>

          {/* Documents & Valuation */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Uploaded Documents */}
            <div>
              <div className='flex items-center justify-between mb-4'>
                <h3
                  className={`text-lg font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Uploaded Documents
                </h3>
                {onDocumentUpload && (
                  <button
                    onClick={onDocumentUpload}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      isDarkMode
                        ? 'bg-[#F1CB68]/20 text-[#F1CB68] hover:bg-[#F1CB68]/30'
                        : 'bg-[#F1CB68]/20 text-[#F1CB68] hover:bg-[#F1CB68]/30'
                    }`}
                  >
                    + Upload
                  </button>
                )}
              </div>
              <div className='space-y-2'>
                {appraisal.documents && appraisal.documents.length > 0 ? (
                  appraisal.documents.map((doc, index) => (
                    <DocumentItem
                      key={index}
                      name={doc.name}
                      type={doc.type || 'PDF'}
                      size={`${(doc.size / 1024 / 1024).toFixed(2)} MB`}
                      isDarkMode={isDarkMode}
                    />
                  ))
                ) : (
                  <>
                    <DocumentItem
                      name='Asset Photos'
                      type='PDF'
                      size='2.4 MB'
                      isDarkMode={isDarkMode}
                    />
                    <DocumentItem
                      name='Ownership Certificate'
                      type='PDF'
                      size='1.8 MB'
                      isDarkMode={isDarkMode}
                    />
                    <DocumentItem
                      name='Purchase Receipt'
                      type='PDF'
                      size='956 KB'
                      isDarkMode={isDarkMode}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Valuation Report */}
            <div>
              <h3
                className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Valuation Report
              </h3>
              {appraisal.appraisedValue ? (
                <div
                  className={`rounded-lg border p-4 ${
                    isDarkMode
                      ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className='mb-4'>
                    <p
                      className={`text-sm mb-2 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Appraised Value
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        isDarkMode ? 'text-[#F1CB68]' : 'text-[#F1CB68]'
                      }`}
                    >
                      {appraisal.appraisedValue}
                    </p>
                  </div>
                  <div className='mb-4'>
                    <p
                      className={`text-sm mb-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Valuation Date
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {formatDate(appraisal.valuationDate)}
                    </p>
                  </div>
                  <button
                    className={`w-full py-2 rounded-lg font-medium transition-all ${
                      isDarkMode
                        ? 'bg-[#F1CB68] text-white hover:bg-[#F1CB68]/80'
                        : 'bg-[#F1CB68] text-white hover:bg-[#F1CB68]/80'
                    }`}
                  >
                    Download Report
                  </button>
                </div>
              ) : (
                <div
                  className={`rounded-lg border p-4 text-center ${
                    isDarkMode
                      ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <p
                    className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Valuation report will be available once the appraisal is
                    completed.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}

// Document Item Component
function DocumentItem({ name, type, size, isDarkMode }) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border ${
        isDarkMode
          ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className='flex items-center gap-3'>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isDarkMode ? 'bg-white/5' : 'bg-gray-100'
          }`}
        >
          <svg
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke={isDarkMode ? '#F1CB68' : '#F1CB68'}
            strokeWidth='2'
          >
            <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
            <path d='M14 2v6h6' />
            <path d='M16 13H8' />
            <path d='M16 17H8' />
            <path d='M10 9H8' />
          </svg>
        </div>
        <div>
          <p
            className={`text-sm font-medium ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            {name}
          </p>
          <p
            className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {type} • {size}
          </p>
        </div>
      </div>
      <button
        className={`p-2 rounded-lg transition-all ${
          isDarkMode
            ? 'hover:bg-white/10 text-gray-400'
            : 'hover:bg-gray-100 text-gray-600'
        }`}
      >
        <svg
          width='20'
          height='20'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
        >
          <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
          <polyline points='7 10 12 15 17 10' />
          <line x1='12' y1='15' x2='12' y2='3' />
        </svg>
      </button>
    </div>
  );
}

