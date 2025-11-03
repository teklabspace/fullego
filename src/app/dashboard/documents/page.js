'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import FileUploadModal from '@/components/documents/FileUploadModal';
import DocumentPreviewModal from '@/components/documents/DocumentPreviewModal';
import UploadSuccessModal from '@/components/documents/UploadSuccessModal';
import ShareDocumentModal from '@/components/documents/ShareDocumentModal';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

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

  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: 'Passport Scan',
      type: 'PDF',
      uploadedDate: 'May 15, 2023',
      uploadedDateValue: new Date('2023-05-15'),
      category: 'Identity',
      size: 2.5, // in MB
    },
    {
      id: 2,
      name: 'Tax Return 2022',
      type: 'PDF',
      uploadedDate: 'May 10, 2023',
      uploadedDateValue: new Date('2023-05-10'),
      category: 'Tax',
      size: 3.2,
    },
    {
      id: 3,
      name: 'Investment Summary Q1',
      type: 'XLSX',
      uploadedDate: 'Apr 28, 2023',
      uploadedDateValue: new Date('2023-04-28'),
      category: 'Investments',
      size: 1.8,
    },
    {
      id: 4,
      name: 'Property Deed',
      type: 'DOC',
      uploadedDate: 'Apr 22, 2023',
      uploadedDateValue: new Date('2023-04-22'),
      category: 'Legal',
      size: 4.1,
    },
    {
      id: 5,
      name: 'Bank Statement April',
      type: 'PDF',
      uploadedDate: 'Apr 15, 2023',
      uploadedDateValue: new Date('2023-04-15'),
      category: 'Bank Statements',
      size: 2.9,
    },
    {
      id: 6,
      name: 'Driver License',
      type: 'PDF',
      uploadedDate: 'May 01, 2023',
      uploadedDateValue: new Date('2023-05-01'),
      category: 'Identity',
      size: 1.2,
    },
    {
      id: 7,
      name: 'Birth Certificate',
      type: 'PDF',
      uploadedDate: 'Apr 20, 2023',
      uploadedDateValue: new Date('2023-04-20'),
      category: 'Identity',
      size: 1.5,
    },
  ]);

  const stats = [
    {
      title: 'Total Documents Stored',
      value: '128',
      subtitle: 'Documents',
      icon: '/icons/document-file.svg',
    },
    {
      title: 'Storage Used',
      value: '1.2GB',
      subtitle: 'of 5GB',
      icon: '/icons/storage-grid.svg',
    },
    {
      title: 'Last Uploaded',
      value: 'May 15, 2023',
      subtitle: '12:45 PM',
      icon: '/icons/upload-cloud.svg',
    },
  ];

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

  const handleDownload = doc => {
    console.log('Download document:', doc);
  };

  const handleShare = doc => {
    console.log('Share document:', doc);
  };

  const handleDelete = id => {
    if (confirm('Are you sure you want to delete this document?')) {
      setDocuments(documents.filter(doc => doc.id !== id));
    }
  };

  const handleUpload = () => {
    setIsUploadModalOpen(true);
  };

  const handlePreview = (file, tags) => {
    setCurrentFile(file);
    setCurrentTags(tags);
    setIsPreviewModalOpen(true);
  };

  const handleContinue = (file, tags) => {
    setCurrentFile(file);
    setCurrentTags(tags);
    setIsSuccessModalOpen(true);
  };

  const handleReturnToDashboard = () => {
    setIsSuccessModalOpen(false);
    setCurrentFile(null);
    setCurrentTags([]);
  };

  const handleShareDocument = (file) => {
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
        <h1 className='text-3xl md:text-4xl font-bold text-white mb-2'>
          Documents Vault
        </h1>
        <p className='text-gray-400'>
          Manage and organize your important documents
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        {stats.map((stat, index) => (
          <div
            key={index}
            className='relative rounded-2xl p-6'
            style={{
              background:
                'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div className='flex justify-between items-start mb-4'>
              <div className='flex-1'>
                <p className='text-gray-400 text-sm mb-2'>{stat.title}</p>
                <h3 className='text-3xl font-bold text-white mb-1'>
                  {stat.value}
                </h3>
                <p className='text-[#D4AF37] text-sm'>{stat.subtitle}</p>
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
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
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
                        'linear-gradient(90deg, #FFFFFF 0%, #D4AF37 100%)',
                      boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)',
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
                    ? {
                        background:
                          'linear-gradient(94.02deg, #222126 0%, #111116 100%)',
                        color: '#FFFFFF',
                        borderColor: 'transparent',
                      }
                    : {
                        background: 'transparent',
                        color: '#9CA3AF',
                        borderColor: 'rgba(156, 163, 175, 0.3)',
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
            className='w-full pl-12 pr-4 py-3 rounded-full text-white text-sm placeholder-gray-500 focus:outline-none transition-all cursor-text'
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            onFocus={e =>
              (e.target.style.borderColor = 'rgba(212, 175, 55, 0.3)')
            }
            onBlur={e =>
              (e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)')
            }
          />
        </div>

        <div className='flex gap-4 items-center'>
          <div className='relative' ref={filterMenuRef}>
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className='flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all cursor-pointer'
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#9CA3AF',
              }}
            >
              <Image
                src='/icons/grid.svg'
                alt='Filter'
                width={16}
                height={16}
              />
              Filter
            </button>
            {showFilterMenu && (
              <div
                className='absolute top-full mt-2 right-0 w-48 rounded-lg p-2 z-10'
                style={{
                  background:
                    'linear-gradient(135deg, rgba(34, 33, 38, 0.95) 0%, rgba(17, 17, 22, 0.95) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <button
                  onClick={() => handleFilterSelect('date')}
                  className={`w-full text-left px-4 py-2 text-sm hover:text-white hover:bg-white/5 rounded cursor-pointer ${
                    sortBy === 'date'
                      ? 'text-white bg-white/5'
                      : 'text-gray-400'
                  }`}
                >
                  By Date
                </button>
                <button
                  onClick={() => handleFilterSelect('type')}
                  className={`w-full text-left px-4 py-2 text-sm hover:text-white hover:bg-white/5 rounded cursor-pointer ${
                    sortBy === 'type'
                      ? 'text-white bg-white/5'
                      : 'text-gray-400'
                  }`}
                >
                  By Type
                </button>
                <button
                  onClick={() => handleFilterSelect('size')}
                  className={`w-full text-left px-4 py-2 text-sm hover:text-white hover:bg-white/5 rounded cursor-pointer ${
                    sortBy === 'size'
                      ? 'text-white bg-white/5'
                      : 'text-gray-400'
                  }`}
                >
                  By Size
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleUpload}
            className='flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all hover:opacity-90 cursor-pointer'
            style={{
              background: 'linear-gradient(90deg, #FFFFFF 0%, #D4AF37 100%)',
              color: '#000000',
            }}
          >
            <Image
              src='/icons/upload-arrow.svg'
              alt='Upload'
              width={16}
              height={16}
            />
            Upload New Document
          </button>
        </div>
      </div>

      {/* Documents Table */}
      <div
        className='rounded-2xl overflow-hidden'
        style={{
          background:
            'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr
                style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}
              >
                <th className='text-left px-6 py-4 text-sm font-semibold text-gray-400'>
                  Document Name
                </th>
                <th className='text-left px-6 py-4 text-sm font-semibold text-gray-400'>
                  Type
                </th>
                <th className='text-left px-6 py-4 text-sm font-semibold text-gray-400'>
                  Uploaded Date
                </th>
                <th className='text-right px-6 py-4 text-sm font-semibold text-gray-400'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td
                    colSpan='4'
                    className='text-center px-6 py-12 text-gray-400'
                  >
                    No documents found
                  </td>
                </tr>
              ) : (
                filteredDocuments.map(doc => (
                  <tr
                    key={doc.id}
                    className='transition-all hover:bg-white/5'
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        {getDocumentIcon(doc.type)}
                        <span className='text-white font-medium'>
                          {doc.name}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <span className='text-gray-400'>{doc.type}</span>
                    </td>
                    <td className='px-6 py-4'>
                      <span className='text-gray-400'>{doc.uploadedDate}</span>
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
