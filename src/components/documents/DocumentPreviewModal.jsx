'use client';
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
          className='absolute top-4 right-4 z-50 p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer'
          title='Close'
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
        >
          <Image
            src='/icons/close-x.svg'
            alt='Close'
            width={24}
            height={24}
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </button>

        {/* Left Side - Document Preview */}
        <div
          className='flex-1 p-6 lg:p-8 overflow-y-auto custom-scroll'
          style={{
            background: 'rgba(20, 20, 25, 0.95)',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <style jsx>{`
            .custom-scroll::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scroll::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scroll::-webkit-scrollbar-thumb {
              background: rgba(212, 175, 55, 0.3);
              border-radius: 3px;
            }
            .custom-scroll::-webkit-scrollbar-thumb:hover {
              background: rgba(212, 175, 55, 0.5);
            }
          `}</style>

          {/* Document Header */}
          <div
            className='flex items-center gap-4 mb-6 pb-4'
            style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            <div
              className='p-2 rounded-lg'
              style={{ background: 'rgba(255, 255, 255, 0.05)' }}
            >
              <Image
                src='/icons/file-text.svg'
                alt='Document'
                width={24}
                height={24}
              />
            </div>
            <div className='flex-1'>
              <h3 className='text-white font-semibold text-lg'>
                {file?.name || 'document.pdf'}
              </h3>
              <p className='text-gray-400 text-sm'>
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
                  style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                  title='Zoom Out'
                >
                  <Image
                    src='/icons/minus.svg'
                    alt='Zoom Out'
                    width={16}
                    height={16}
                    style={{ filter: 'brightness(0) invert(1)' }}
                  />
                </button>
                <div
                  className='flex items-center justify-center gap-2 px-3 py-2 rounded-lg min-w-[80px]'
                  style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                >
                  <span className='text-white text-sm font-medium'>
                    {zoom}%
                  </span>
                </div>
                <button
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                  className='p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed'
                  style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                  title='Zoom In'
                >
                  <Image
                    src='/icons/plus.svg'
                    alt='Zoom In'
                    width={16}
                    height={16}
                    style={{ filter: 'brightness(0) invert(1)' }}
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
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    background: 'rgba(30, 30, 35, 0.5)',
                    filter: 'invert(0.9) hue-rotate(180deg)',
                  }}
                  title='PDF Preview'
                />
              </div>
            ) : (
              <div
                className='rounded-2xl p-8 mb-4'
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.3s ease',
                  maxWidth: '800px',
                }}
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
                  <h1 className='text-2xl font-bold text-white mb-2'>
                    {file?.name}
                  </h1>
                  <p className='text-gray-400 text-sm mb-4'>
                    {getFileType(file?.name)}
                  </p>
                  <p className='text-gray-300 text-sm'>
                    Preview not available for this file type.
                    <br />
                    Click download to view the document.
                  </p>
                </div>

                {tags && tags.length > 0 && (
                  <div className='mt-6'>
                    <p className='text-gray-400 text-sm mb-3'>Tags:</p>
                    <div className='flex flex-wrap gap-2'>
                      {tags.map((tag, index) => (
                        <span
                          key={index}
                          className='px-3 py-1 rounded-full text-sm'
                          style={{
                            background: 'rgba(212, 175, 55, 0.1)',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            color: '#D4AF37',
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
                className='p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed'
              >
                <Image
                  src='/icons/chevron-down.svg'
                  alt='Previous'
                  width={20}
                  height={20}
                  style={{
                    transform: 'rotate(90deg)',
                    filter: 'brightness(0) invert(1)',
                  }}
                />
              </button>
              <span className='text-gray-400 text-sm'>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className='p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed'
              >
                <Image
                  src='/icons/chevron-down.svg'
                  alt='Next'
                  width={20}
                  height={20}
                  style={{
                    transform: 'rotate(-90deg)',
                    filter: 'brightness(0) invert(1)',
                  }}
                />
              </button>
            </div>
          )}
        </div>

        {/* Right Side - Document Details */}
        <div
          className='w-full lg:w-80 xl:w-96 p-6 flex flex-col overflow-y-auto custom-scroll'
          style={{
            background: 'rgba(17, 17, 22, 0.98)',
          }}
        >
          <h2 className='text-xl font-bold text-white mb-6'>
            Document Details
          </h2>

          {/* Details Grid */}
          <div className='space-y-5'>
            <div>
              <p className='text-gray-400 text-sm mb-1'>Uploaded by</p>
              <p className='text-white font-medium'>Olivia Benson</p>
            </div>

            <div>
              <p className='text-gray-400 text-sm mb-1'>Date</p>
              <p className='text-white font-medium'>
                {new Date().toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>

            <div>
              <p className='text-gray-400 text-sm mb-1'>File Type</p>
              <p className='text-white font-medium'>
                {getFileType(file?.name)}
              </p>
            </div>

            <div>
              <p className='text-gray-400 text-sm mb-1'>Size</p>
              <p className='text-white font-medium'>
                {file?.size ? formatFileSize(file.size) : '0 KB'}
              </p>
            </div>

            {/* Show Tags */}
            {tags && tags.length > 0 && (
              <div>
                <p className='text-gray-400 text-sm mb-2'>Tags</p>
                <div className='flex flex-wrap gap-2'>
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className='px-3 py-1 rounded-full text-xs'
                      style={{
                        background: 'rgba(212, 175, 55, 0.1)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        color: '#D4AF37',
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
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
            }}
          >
            <div className='shrink-0'>
              <div
                className='w-6 h-6 rounded-full flex items-center justify-center'
                style={{ background: '#D4AF37' }}
              >
                <span className='text-black font-bold text-sm'>!</span>
              </div>
            </div>
            <p className='text-[#D4AF37] text-sm'>
              This document requires approval
            </p>
          </div>

          {/* Confirmation Text */}
          <p className='text-gray-400 text-sm mt-6 mb-6 leading-relaxed'>
            By continuing, you confirm that this is the correct document for
            upload.
          </p>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            className='mt-auto w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all hover:opacity-90 cursor-pointer'
            style={{
              background: 'linear-gradient(90deg, #FFFFFF 0%, #D4AF37 100%)',
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
