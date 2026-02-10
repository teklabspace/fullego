'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DocumentPreviewModal from '@/components/documents/DocumentPreviewModal';
import FileUploadModal from '@/components/documents/FileUploadModal';
import ShareDocumentModal from '@/components/documents/ShareDocumentModal';
import UploadSuccessModal from '@/components/documents/UploadSuccessModal';
import { useTheme } from '@/context/ThemeContext';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import {
  listDocuments,
  uploadDocument,
  deleteDocument,
  downloadDocument,
  shareDocument,
  getDocumentStatistics,
  getDocumentPreview,
} from '@/utils/documentsApi';
import { toast } from 'react-toastify';

// Document type icon mapping
const getDocumentIcon = type => {
  const iconMap = {
    PDF: (
      <svg
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z'
          stroke='#EF4444'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M14 2V8H20'
          stroke='#EF4444'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <text
          x='12'
          y='17'
          fontSize='6'
          fill='#EF4444'
          textAnchor='middle'
          fontWeight='bold'
        >
          PDF
        </text>
      </svg>
    ),
    XLSX: (
      <svg
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z'
          stroke='#10B981'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M14 2V8H20'
          stroke='#10B981'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <text
          x='12'
          y='17'
          fontSize='5'
          fill='#10B981'
          textAnchor='middle'
          fontWeight='bold'
        >
          XLS
        </text>
      </svg>
    ),
    DOC: (
      <svg
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z'
          stroke='#3B82F6'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <path
          d='M14 2V8H20'
          stroke='#3B82F6'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <text
          x='12'
          y='17'
          fontSize='5'
          fill='#3B82F6'
          textAnchor='middle'
          fontWeight='bold'
        >
          DOC
        </text>
      </svg>
    ),
  };
  return iconMap[type] || iconMap.PDF;
};

export default function DocumentsPage() {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('Identity');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sortBy, setSortBy] = useState('date'); // 'date', 'type', 'size'
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [currentTags, setCurrentTags] = useState([]);
  const filterMenuRef = useRef(null);

  // Close filter menu when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (
        filterMenuRef.current &&
        !filterMenuRef.current.contains(event.target)
      ) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabs = [
    { name: 'Identity', count: 12 },
    { name: 'Tax', count: 24 },
    { name: 'Investments', count: 37 },
    { name: 'Legal', count: 18 },
    { name: 'Bank Statements', count: 37 },
  ];

  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState([
    {
      title: 'Total Documents Stored',
      value: '0',
      subtitle: 'Documents',
      icon: '/icons/document-file.svg',
    },
    {
      title: 'Storage Used',
      value: '0GB',
      subtitle: 'of 5GB',
      icon: '/icons/storage-grid.svg',
    },
    {
      title: 'Last Uploaded',
      value: 'N/A',
      subtitle: 'N/A',
      icon: '/icons/upload-cloud.svg',
    },
  ]);
  const [loading, setLoading] = useState(true);

  // Fetch documents and statistics on mount
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const [documentsResponse, statsResponse] = await Promise.allSettled([
          listDocuments({ category: activeTab === 'Identity' ? undefined : activeTab, sortBy }),
          getDocumentStatistics(),
        ]);

        if (documentsResponse.status === 'fulfilled') {
          const docs = documentsResponse.value.data || documentsResponse.value || [];
          setDocuments(docs.map(doc => ({
            id: doc.id,
            name: doc.name || doc.fileName,
            type: doc.type || doc.fileType?.toUpperCase() || 'PDF',
            uploadedDate: doc.uploadedDate || doc.createdAt ? new Date(doc.uploadedDate || doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
            uploadedDateValue: doc.uploadedDate || doc.createdAt ? new Date(doc.uploadedDate || doc.createdAt) : new Date(),
            category: doc.category || 'Identity',
            size: doc.size || doc.fileSize ? (doc.size || doc.fileSize) / (1024 * 1024) : 0, // Convert bytes to MB
          })));
        }

        if (statsResponse.status === 'fulfilled') {
          const statistics = statsResponse.value.data || statsResponse.value;
          setStats([
            {
              title: 'Total Documents Stored',
              value: statistics.totalDocuments?.toString() || '0',
              subtitle: 'Documents',
              icon: '/icons/document-file.svg',
            },
            {
              title: 'Storage Used',
              value: statistics.storageUsed || '0GB',
              subtitle: `of ${statistics.storageLimit || '5GB'}`,
              icon: '/icons/storage-grid.svg',
            },
            {
              title: 'Last Uploaded',
              value: statistics.lastUploaded ? new Date(statistics.lastUploaded).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
              subtitle: statistics.lastUploaded ? new Date(statistics.lastUploaded).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
              icon: '/icons/upload-cloud.svg',
            },
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch documents:', error);
        toast.error('Failed to load documents. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [activeTab, sortBy]);

  // Filter and sort documents
  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = doc.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      // Show all documents when Identity tab is active, otherwise filter by category
      const matchesTab = activeTab === 'Identity' || doc.category === activeTab;
      return matchesSearch && matchesTab;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.uploadedDateValue - a.uploadedDateValue; // Newest first
        case 'type':
          return a.type.localeCompare(b.type);
        case 'size':
          return b.size - a.size; // Largest first
        default:
          return 0;
      }
    });

  const handleFilterSelect = filter => {
    setSortBy(filter);
    setShowFilterMenu(false);
  };

  const handleView = doc => {
    console.log('View document:', doc);
  };

  const handleDownload = async (doc) => {
    try {
      const response = await downloadDocument(doc.id);
      // Handle file download
      if (response.url) {
        window.open(response.url, '_blank');
      } else {
        // Create blob URL if response is blob
        const blob = new Blob([response], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
      toast.success('Document download started!');
    } catch (error) {
      console.error('Failed to download document:', error);
      const errorMsg = error.data?.detail || error.message || 'Failed to download document. Please try again.';
      toast.error(errorMsg);
    }
  };

  const handleShare = async (doc) => {
    try {
      const shareData = {
        generateLink: true,
        permissions: 'view',
      };
      const response = await shareDocument(doc.id, shareData);
      // Handle share response (show modal with link, etc.)
      if (response.shareableLink) {
        toast.success('Document shared successfully!');
        // Could show modal with shareable link
      } else {
        toast.success('Document shared with selected users!');
      }
    } catch (error) {
      console.error('Failed to share document:', error);
      const errorMsg = error.data?.detail || error.message || 'Failed to share document. Please try again.';
      toast.error(errorMsg);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(id);
        setDocuments(documents.filter(doc => doc.id !== id));
        toast.success('Document deleted successfully!');
      } catch (error) {
        console.error('Failed to delete document:', error);
        const errorMsg = error.data?.detail || error.message || 'Failed to delete document. Please try again.';
        toast.error(errorMsg);
      }
    }
  };

  const handleUpload = () => {
    setIsUploadModalOpen(true);
  };

  const handlePreview = async (file, tags) => {
    try {
      // If file has an ID, fetch preview from API
      if (file.id) {
        const preview = await getDocumentPreview(file.id);
        setCurrentFile({ ...file, previewUrl: preview.previewUrl || preview.url });
      } else {
        setCurrentFile(file);
      }
      setCurrentTags(tags);
      setIsPreviewModalOpen(true);
    } catch (error) {
      console.error('Failed to get document preview:', error);
      setCurrentFile(file);
      setCurrentTags(tags);
      setIsPreviewModalOpen(true);
    }
  };

  const handleContinue = async (file, tags) => {
    try {
      // Upload the file
      if (file.file) {
        const response = await uploadDocument(file.file, {
          category: activeTab,
          tags: tags || [],
          description: file.description || '',
        });
        
        // Update documents list
        const newDoc = {
          id: response.id || response.data?.id,
          name: response.name || file.name,
          type: response.type || file.type,
          uploadedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          uploadedDateValue: new Date(),
          category: activeTab,
          size: response.size ? response.size / (1024 * 1024) : file.size / (1024 * 1024),
        };
        setDocuments([newDoc, ...documents]);
        
        setCurrentFile(newDoc);
        setCurrentTags(tags);
        setIsSuccessModalOpen(true);
        toast.success('Document uploaded successfully!');
      }
    } catch (error) {
      console.error('Failed to upload document:', error);
      const errorMsg = error.data?.detail || error.message || 'Failed to upload document. Please try again.';
      toast.error(errorMsg);
    }
  };

  const handleReturnToDashboard = () => {
    setIsSuccessModalOpen(false);
    setCurrentFile(null);
    setCurrentTags([]);
  };

  const handleShareDocument = file => {
    setIsShareModalOpen(true);
  };

  const handleCloseShare = () => {
    setIsShareModalOpen(false);
    setCurrentFile(null);
    setCurrentTags([]);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className='mb-8'>
        <h1
          className={`text-3xl md:text-4xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          Documents Vault
        </h1>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          Manage and organize your important documents
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        {stats.map((stat, index) => (
          <div
            key={index}
            className='relative rounded-2xl p-6 border'
            style={
              isDarkMode
                ? {
                    background:
                      'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                  }
                : {
                    background: 'transparent',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                  }
            }
          >
            <div className='flex justify-between items-start mb-4'>
              <div className='flex-1'>
                <p
                  className={`text-sm mb-2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {stat.title}
                </p>
                <h3
                  className={`text-3xl font-bold mb-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {stat.value}
                </h3>
                <p className='text-[#F1CB68] text-sm'>{stat.subtitle}</p>
              </div>
              <div className='ml-4'>
                <Image
                  src={stat.icon}
                  alt={stat.title}
                  width={32}
                  height={32}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className='mb-6'>
        <div
          className='flex gap-2 flex-wrap pb-4'
          style={{
            borderBottom: isDarkMode
              ? '1px solid rgba(255, 255, 255, 0.08)'
              : '1px solid rgba(0, 0, 0, 0.1)',
          }}
        >
          {tabs.map(tab => (
            <div
              key={tab.name}
              className='rounded-full transition-all duration-300'
              style={
                activeTab === tab.name
                  ? {
                      padding: '1px',
                      background:
                        'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
                      boxShadow: '0 0 20px rgba(241, 203, 104, 0.2)',
                    }
                  : {
                      padding: '0px',
                    }
              }
            >
              <button
                onClick={() => setActiveTab(tab.name)}
                className='px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer w-full h-full border'
                style={
                  activeTab === tab.name
                    ? isDarkMode
                      ? {
                          background:
                            'linear-gradient(94.02deg, #222126 0%, #111116 100%)',
                          color: '#FFFFFF',
                          borderColor: 'transparent',
                        }
                      : {
                          background: 'transparent',
                          color: '#000000',
                          borderColor: 'transparent',
                        }
                    : {
                        background: 'transparent',
                        color: isDarkMode ? '#9CA3AF' : '#6B7280',
                        borderColor: isDarkMode
                          ? 'rgba(156, 163, 175, 0.3)'
                          : 'rgba(0, 0, 0, 0.1)',
                      }
                }
              >
                {tab.name} {tab.count}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filter */}
      <div className='flex flex-col md:flex-row gap-4 mb-6 justify-between items-center'>
        <div className='relative flex-1 max-w-md w-full'>
          <div className='absolute left-4 top-1/2 transform -translate-y-1/2 opacity-50'>
            <Image
              src='/icons/search.svg'
              alt='Search'
              width={16}
              height={16}
            />
          </div>
          <input
            type='text'
            placeholder='Search documents...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 rounded-full text-sm focus:outline-none transition-all cursor-text ${
              isDarkMode
                ? 'text-white placeholder-gray-500'
                : 'text-gray-900 placeholder-gray-400'
            }`}
            style={
              isDarkMode
                ? {
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }
                : {
                    background: 'transparent',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                  }
            }
            onFocus={e =>
              (e.target.style.borderColor = 'rgba(241, 203, 104, 0.3)')
            }
            onBlur={e =>
              (e.target.style.borderColor = isDarkMode
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.1)')
            }
          />
        </div>

        <div className='flex gap-2 sm:gap-4 items-center flex-wrap'>
          <div className='relative' ref={filterMenuRef}>
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer border shrink-0 ${
                isDarkMode ? '' : ''
              }`}
              style={
                isDarkMode
                  ? {
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#9CA3AF',
                    }
                  : {
                      background: 'transparent',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      color: '#6B7280',
                    }
              }
            >
              <Image
                src='/icons/grid.svg'
                alt='Filter'
                width={14}
                height={14}
                className='sm:w-4 sm:h-4'
              />
              <span className='hidden sm:inline'>Filter</span>
            </button>
            {showFilterMenu && (
              <div
                className={`absolute top-full mt-2 left-0 md:left-auto md:right-0 w-48 max-w-[calc(100vw-2rem)] rounded-lg p-2 z-50 border ${
                  isDarkMode ? '' : ''
                }`}
                style={
                  isDarkMode
                    ? {
                        background:
                          'linear-gradient(135deg, rgba(34, 33, 38, 0.95) 0%, rgba(17, 17, 22, 0.95) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                      }
                    : {
                        background: '#fffffffF',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                      }
                }
              >
                <button
                  onClick={() => handleFilterSelect('date')}
                  className={`w-full text-left px-4 py-2 text-sm rounded cursor-pointer ${
                    sortBy === 'date'
                      ? isDarkMode
                        ? 'text-white bg-white/5'
                        : 'text-black bg-black/5'
                      : isDarkMode
                      ? 'text-gray-400 hover:text-white hover:bg-white/5'
                      : 'text-gray-600 hover:text-black hover:bg-black/5'
                  }`}
                >
                  By Date
                </button>
                <button
                  onClick={() => handleFilterSelect('type')}
                  className={`w-full text-left px-4 py-2 text-sm rounded cursor-pointer ${
                    sortBy === 'type'
                      ? isDarkMode
                        ? 'text-white bg-white/5'
                        : 'text-black bg-black/5'
                      : isDarkMode
                      ? 'text-gray-400 hover:text-white hover:bg-white/5'
                      : 'text-gray-600 hover:text-black hover:bg-black/5'
                  }`}
                >
                  By Type
                </button>
                <button
                  onClick={() => handleFilterSelect('size')}
                  className={`w-full text-left px-4 py-2 text-sm rounded cursor-pointer ${
                    sortBy === 'size'
                      ? isDarkMode
                        ? 'text-white bg-white/5'
                        : 'text-black bg-black/5'
                      : isDarkMode
                      ? 'text-gray-400 hover:text-white hover:bg-white/5'
                      : 'text-gray-600 hover:text-black hover:bg-black/5'
                  }`}
                >
                  By Size
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleUpload}
            className='flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold transition-all hover:opacity-90 cursor-pointer whitespace-nowrap shrink-0'
            style={{
              background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
              color: '#000000',
            }}
          >
            <Image
              src='/icons/upload-arrow.svg'
              alt='Upload'
              width={14}
              height={14}
              className='sm:w-4 sm:h-4'
            />
            <span className='hidden sm:inline'>Upload New Document</span>
            <span className='sm:hidden'>Upload</span>
          </button>
        </div>
      </div>

      {/* Documents Table */}
      <div
        className={`rounded-2xl overflow-hidden border ${isDarkMode ? '' : ''}`}
        style={
          isDarkMode
            ? {
                background:
                  'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
              }
            : {
                background: 'transparent',
                border: '1px solid rgba(0, 0, 0, 0.1)',
              }
        }
      >
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr
                style={{
                  borderBottom: isDarkMode
                    ? '1px solid rgba(255, 255, 255, 0.08)'
                    : '1px solid rgba(0, 0, 0, 0.1)',
                }}
              >
                <th
                  className={`text-left px-6 py-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Document Name
                </th>
                <th
                  className={`text-left px-6 py-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Type
                </th>
                <th
                  className={`text-left px-6 py-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Uploaded Date
                </th>
                <th
                  className={`text-right px-6 py-4 text-sm font-semibold ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td
                    colSpan='4'
                    className={`text-center px-6 py-12 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    No documents found
                  </td>
                </tr>
              ) : (
                filteredDocuments.map(doc => (
                  <tr
                    key={doc.id}
                    className={`transition-all ${
                      isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/5'
                    }`}
                    style={{
                      borderBottom: isDarkMode
                        ? '1px solid rgba(255, 255, 255, 0.05)'
                        : '1px solid rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        {getDocumentIcon(doc.type)}
                        <span
                          className={`font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {doc.name}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <span
                        className={
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }
                      >
                        {doc.type}
                      </span>
                    </td>
                    <td className='px-6 py-4'>
                      <span
                        className={
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }
                      >
                        {doc.uploadedDate}
                      </span>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center justify-end gap-3'>
                        <button
                          onClick={() => handleView(doc)}
                          className='p-2 rounded-full transition-all hover:bg-white/10 cursor-pointer'
                          title='View'
                        >
                          <Image
                            src='/icons/Eye.svg'
                            alt='View'
                            width={16}
                            height={16}
                          />
                        </button>
                        <button
                          onClick={() => handleDownload(doc)}
                          className='p-2 rounded-full transition-all hover:bg-white/10 cursor-pointer'
                          title='Download'
                        >
                          <Image
                            src='/icons/download.svg'
                            alt='Download'
                            width={16}
                            height={16}
                          />
                        </button>
                        <button
                          onClick={() => handleShare(doc)}
                          className='p-2 rounded-full transition-all hover:bg-white/10 cursor-pointer'
                          title='Share'
                        >
                          <Image
                            src='/icons/Shear.svg'
                            alt='Share'
                            width={16}
                            height={16}
                          />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className='p-2 rounded-full transition-all hover:bg-red-500/20 cursor-pointer'
                          title='Delete'
                        >
                          <Image
                            src='/icons/Delete.svg'
                            alt='Delete'
                            width={16}
                            height={16}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        setIsOpen={setIsUploadModalOpen}
        onPreview={handlePreview}
      />

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={isPreviewModalOpen}
        setIsOpen={setIsPreviewModalOpen}
        file={currentFile}
        tags={currentTags}
        onContinue={handleContinue}
      />

      {/* Upload Success Modal */}
      <UploadSuccessModal
        isOpen={isSuccessModalOpen}
        setIsOpen={setIsSuccessModalOpen}
        file={currentFile}
        onReturnToDashboard={handleReturnToDashboard}
        onShare={handleShareDocument}
      />

      {/* Share Document Modal */}
      <ShareDocumentModal
        isOpen={isShareModalOpen}
        setIsOpen={setIsShareModalOpen}
        file={currentFile}
        onShare={handleCloseShare}
      />
    </DashboardLayout>
  );
}
