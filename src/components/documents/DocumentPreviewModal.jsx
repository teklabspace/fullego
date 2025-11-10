'use client';
import { useTheme } from '@/context/ThemeContext';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import Modal from '../ui/Modal';

const DocumentPreviewModal = ({
  isOpen,
  setIsOpen,
  file,
  tags,
  onContinue,
}) => {
  const { isDarkMode } = useTheme();
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(5);

  // Create object URL for the uploaded file
  const fileUrl = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file);
    }
    return null;
  }, [file]);

  // Cleanup function to revoke the object URL
  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  const formatFileSize = bytes => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileType = filename => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    const typeMap = {
      pdf: 'PDF Document',
      doc: 'DOC Document',
      docx: 'DOCX Document',
      xls: 'XLS Document',
      xlsx: 'XLSX Document',
      csv: 'CSV Document',
    };
    return typeMap[ext] || 'Document';
  };

  const getFileExtension = filename => {
    return filename?.split('.').pop()?.toLowerCase();
  };

  const handleZoomIn = () => {
    if (zoom < 200) setZoom(zoom + 25);
  };

  const handleZoomOut = () => {
    if (zoom > 50) setZoom(zoom - 25);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleContinue = () => {
    console.log('Continue with document:', file);
    console.log('Tags:', tags);
    // Close this modal and open success modal
    setIsOpen(false);
    if (onContinue) {
      onContinue(file, tags);
    }
  };

  const isPDF = getFileExtension(file?.name) === 'pdf';

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} maxWidth='max-w-full'>
      <div className='flex flex-col lg:flex-row min-h-[90vh] max-h-[90vh] relative'>
        {/* Close Button - Top Right Corner */}
        <button
          onClick={() => setIsOpen(false)}
          className={`absolute top-4 right-4 z-50 p-2 rounded-lg transition-colors cursor-pointer ${
            isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'
          }`}
          title='Close'
          style={{
            background: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)',
          }}
        >
          <Image
            src='/icons/close-x.svg'
            alt='Close'
            width={24}
            height={24}
            style={{ filter: isDarkMode ? 'brightness(0) invert(1)' : 'none' }}
          />
        </button>

        {/* Left Side - Document Preview */}
        <div
          className='flex-1 p-6 lg:p-8 overflow-y-auto custom-scroll'
          style={
            isDarkMode
              ? {
                  background: 'rgba(20, 20, 25, 0.95)',
                  borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                }
              : {
                  background: 'white',
                  borderRight: '1px solid rgba(0, 0, 0, 0.1)',
                }
          }
        >
          <style jsx>{`
            .custom-scroll::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scroll::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scroll::-webkit-scrollbar-thumb {
              background: rgba(241, 203, 104, 0.3);
              border-radius: 3px;
            }
            .custom-scroll::-webkit-scrollbar-thumb:hover {
              background: rgba(241, 203, 104, 0.5);
            }
          `}</style>

          {/* Document Header */}
          <div
            className='flex items-center gap-4 mb-6 pb-4'
            style={{
              borderBottom: isDarkMode
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(0, 0, 0, 0.1)',
            }}
          >
            <div
              className='p-2 rounded-lg'
              style={{
                background: isDarkMode
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(241, 203, 104, 0.2)',
              }}
            >
              <Image
                src='/icons/file-text.svg'
                alt='Document'
                width={24}
                height={24}
              />
            </div>
            <div className='flex-1'>
              <h3 className={`font-semibold text-lg ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {file?.name || 'document.pdf'}
              </h3>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {getFileType(file?.name)} •{' '}
                {file?.size ? formatFileSize(file.size) : '2.4 MB'}
              </p>
            </div>

            {/* Zoom Controls */}
            {isPDF && (
              <div className='hidden items-center gap-2'>
                <button
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                  className='p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed'
                  style={{
                    background: isDarkMode
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(241, 203, 104, 0.2)',
                  }}
                  title='Zoom Out'
                >
                  <Image
                    src='/icons/minus.svg'
                    alt='Zoom Out'
                    width={16}
                    height={16}
                    style={{ filter: isDarkMode ? 'brightness(0) invert(1)' : 'none' }}
                  />
                </button>
                <div
                  className='flex items-center justify-center gap-2 px-3 py-2 rounded-lg min-w-[80px]'
                  style={{
                    background: isDarkMode
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(241, 203, 104, 0.2)',
                  }}
                >
                  <span className={`text-sm font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {zoom}%
                  </span>
                </div>
                <button
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                  className='p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed'
                  style={{
                    background: isDarkMode
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(241, 203, 104, 0.2)',
                  }}
                  title='Zoom In'
                >
                  <Image
                    src='/icons/plus.svg'
                    alt='Zoom In'
                    width={16}
                    height={16}
                    style={{ filter: isDarkMode ? 'brightness(0) invert(1)' : 'none' }}
                  />
                </button>
              </div>
            )}

            <div className='flex gap-2'>
              <a
                href={fileUrl}
                download={file?.name}
                className='p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer'
                title='Download'
              >
                <Image
                  src='/icons/download.svg'
                  alt='Download'
                  width={20}
                  height={20}
                />
              </a>
            </div>
          </div>

          {/* Document Content Preview */}
          <div className='flex justify-center'>
            {isPDF && fileUrl ? (
              <div
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.3s ease',
                  width: '100%',
                }}
              >
                <iframe
                  src={`${fileUrl}#page=${currentPage}`}
                  className='w-full rounded-2xl'
                  style={{
                    height: '70vh',
                    border: '1px solid rgba(241, 203, 104, 0.3)',
                    background: 'rgba(30, 30, 35, 0.5)',
                    filter: 'invert(0.9) hue-rotate(180deg)',
                  }}
                  title='PDF Preview'
                />
              </div>
            ) : (
              <div
                className='rounded-2xl p-8 mb-4'
                style={
                  isDarkMode
                    ? {
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: 'top center',
                        transition: 'transform 0.3s ease',
                        maxWidth: '800px',
                      }
                    : {
                        background: 'rgba(241, 203, 104, 0.2)',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: 'top center',
                        transition: 'transform 0.3s ease',
                        maxWidth: '800px',
                      }
                }
              >
                <div className='text-center mb-6'>
                  <div className='flex justify-center mb-4'>
                    <Image
                      src='/icons/file-text.svg'
                      alt='Document'
                      width={64}
                      height={64}
                    />
                  </div>
                  <h1 className={`text-2xl font-bold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {file?.name}
                  </h1>
                  <p className={`text-sm mb-4 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {getFileType(file?.name)}
                  </p>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Preview not available for this file type.
                    <br />
                    Click download to view the document.
                  </p>
                </div>

                {tags && tags.length > 0 && (
                  <div className='mt-6'>
                    <p className={`text-sm mb-3 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Tags:</p>
                    <div className='flex flex-wrap gap-2'>
                      {tags.map((tag, index) => (
                        <span
                          key={index}
                          className='px-3 py-1 rounded-full text-sm'
                          style={{
                            background: 'rgba(241, 203, 104, 0.1)',
                            border: '1px solid rgba(241, 203, 104, 0.3)',
                            color: '#F1CB68',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pagination - Only show for PDF */}
          {isPDF && (
            <div className='hidden items-center justify-center gap-4 mt-6'>
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                  isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'
                }`}
              >
                <Image
                  src='/icons/chevron-down.svg'
                  alt='Previous'
                  width={20}
                  height={20}
                  style={{
                    transform: 'rotate(90deg)',
                    filter: isDarkMode ? 'brightness(0) invert(1)' : 'none',
                  }}
                />
              </button>
              <span className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                  isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'
                }`}
              >
                <Image
                  src='/icons/chevron-down.svg'
                  alt='Next'
                  width={20}
                  height={20}
                  style={{
                    transform: 'rotate(-90deg)',
                    filter: isDarkMode ? 'brightness(0) invert(1)' : 'none',
                  }}
                />
              </button>
            </div>
          )}
        </div>

        {/* Right Side - Document Details */}
        <div
          className='w-full lg:w-80 xl:w-96 p-6 flex flex-col overflow-y-auto custom-scroll'
          style={
            isDarkMode
              ? {
                  background: 'rgba(17, 17, 22, 0.98)',
                }
              : {
                  background: 'white',
                }
          }
        >
          <h2 className={`text-xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Document Details
          </h2>

          {/* Details Grid */}
          <div className='space-y-5'>
            <div>
              <p className={`text-sm mb-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Uploaded by</p>
              <p className={`font-medium ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Olivia Benson</p>
            </div>

            <div>
              <p className={`text-sm mb-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Date</p>
              <p className={`font-medium ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {new Date().toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>

            <div>
              <p className={`text-sm mb-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>File Type</p>
              <p className={`font-medium ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {getFileType(file?.name)}
              </p>
            </div>

            <div>
              <p className={`text-sm mb-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Size</p>
              <p className={`font-medium ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {file?.size ? formatFileSize(file.size) : '0 KB'}
              </p>
            </div>

            {/* Show Tags */}
            {tags && tags.length > 0 && (
              <div>
                <p className={`text-sm mb-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Tags</p>
                <div className='flex flex-wrap gap-2'>
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className='px-3 py-1 rounded-full text-xs'
                      style={{
                        background: 'rgba(241, 203, 104, 0.1)',
                        border: '1px solid rgba(241, 203, 104, 0.3)',
                        color: '#F1CB68',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Warning Message */}
          <div
            className='mt-6 p-4 rounded-lg flex gap-3'
            style={{
              background: 'rgba(241, 203, 104, 0.1)',
              border: '1px solid rgba(241, 203, 104, 0.3)',
            }}
          >
            <div className='shrink-0'>
              <div
                className='w-6 h-6 rounded-full flex items-center justify-center'
                style={{ background: '#F1CB68' }}
              >
                <span className='text-black font-bold text-sm'>!</span>
              </div>
            </div>
            <p className='text-[#F1CB68] text-sm'>
              This document requires approval
            </p>
          </div>

          {/* Confirmation Text */}
          <p className={`text-sm mt-6 mb-6 leading-relaxed ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            By continuing, you confirm that this is the correct document for
            upload.
          </p>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            className='mt-auto w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all hover:opacity-90 cursor-pointer'
            style={{
              background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
              color: '#000000',
            }}
          >
            Continue
            <Image
              src='/icons/chevron-down.svg'
              alt='Continue'
              width={16}
              height={16}
              style={{ transform: 'rotate(-90deg)' }}
            />
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DocumentPreviewModal;
