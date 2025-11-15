'use client';
import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function DocumentUploadModal({
  isOpen,
  setIsOpen,
  onUpload,
  title = 'Upload Documents',
  itemType = 'ticket', // 'ticket' or 'task'
  itemId,
}) {
  const { isDarkMode } = useTheme();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = e => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const handleRemoveFile = index => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = bytes => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (files.length === 0) return;

    setUploading(true);
    // Simulate upload - in production, this would upload to your backend
    setTimeout(() => {
      onUpload({
        files: files.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          file: file,
        })),
        itemType,
        itemId,
      });
      setFiles([]);
      setUploading(false);
      setIsOpen(false);
    }, 1000);
  };

  const handleClose = () => {
    setFiles([]);
    setIsOpen(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      onClick={handleClose}
      className='bg-black/60 backdrop-blur-sm p-2 sm:p-4 fixed inset-0 z-50 flex items-center justify-center overflow-y-auto cursor-pointer'
      style={{ animation: 'fadeIn 0.2s ease-out' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className={`w-full max-w-2xl cursor-default relative overflow-hidden rounded-2xl my-auto max-h-[95vh] sm:max-h-[90vh] flex flex-col ${
          isDarkMode
            ? 'bg-[#1A1A1D] border border-[#FFFFFF14]'
            : 'bg-white border border-gray-200'
        }`}
        style={{ animation: 'scaleIn 0.2s ease-out' }}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 md:p-6 border-b shrink-0 ${
            isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
          }`}
        >
          <h2
            className={`text-lg md:text-xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            {title}
          </h2>
          <button
            onClick={handleClose}
            className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
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
              <path d='M18 6L6 18M6 6l12 12' />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className='p-4 md:p-6 space-y-6 overflow-y-auto flex-1 document-modal-scrollbar'>
          {/* Upload Area */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Select Documents
            </label>
            <div
              onClick={() => document.getElementById('file-upload').click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                isDarkMode
                  ? 'border-[#FFFFFF14] hover:border-[#F1CB68]'
                  : 'border-gray-300 hover:border-[#F1CB68]'
              }`}
            >
              <input
                id='file-upload'
                type='file'
                multiple
                className='hidden'
                accept='.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt'
                onChange={handleFileChange}
              />
              <svg
                width='40'
                height='40'
                viewBox='0 0 24 24'
                fill='none'
                stroke={isDarkMode ? '#F1CB68' : '#F1CB68'}
                strokeWidth='2'
                className='mx-auto mb-3'
              >
                <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                <polyline points='17 8 12 3 7 8' />
                <line x1='12' y1='3' x2='12' y2='15' />
              </svg>
              <p
                className={`text-sm mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Click to upload or drag and drop
              </p>
              <p
                className={`text-xs ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-500'
                }`}
              >
                PDF, DOC, DOCX, XLS, XLSX, JPG, PNG up to 10MB
              </p>
            </div>
          </div>

          {/* Selected Files List */}
          {files.length > 0 && (
            <div>
              <h3
                className={`text-sm font-medium mb-3 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Selected Files ({files.length})
              </h3>
              <div className='space-y-2'>
                {files.map((file, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isDarkMode
                        ? 'bg-[#2C2C2E] border-[#FFFFFF14]'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className='flex items-center gap-3 flex-1 min-w-0'>
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          isDarkMode ? 'bg-white/5' : 'bg-gray-200'
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
                      <div className='flex-1 min-w-0'>
                        <p
                          className={`text-sm font-medium truncate ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {file.name}
                        </p>
                        <p
                          className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className={`p-2 rounded-lg transition-colors shrink-0 ${
                        isDarkMode
                          ? 'hover:bg-white/10 text-gray-400'
                          : 'hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      <svg
                        width='18'
                        height='18'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                      >
                        <path d='M18 6L6 18M6 6l12 12' />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info */}
          <div
            className={`rounded-lg p-4 ${
              isDarkMode ? 'bg-[#F1CB68]/10' : 'bg-[#F1CB68]/10'
            }`}
          >
            <p
              className={`text-xs ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Documents will be attached to this {itemType} and will be
              accessible to all team members working on it.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div
          className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 p-4 md:p-6 border-t shrink-0 ${
            isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
          }`}
        >
          <button
            type='button'
            onClick={handleClose}
            className={`px-6 py-2.5 md:py-3 rounded-full text-sm font-medium transition-colors cursor-pointer order-2 sm:order-1 ${
              isDarkMode
                ? 'text-gray-300 hover:text-white'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={handleSubmit}
            disabled={files.length === 0 || uploading}
            className='px-8 py-2.5 md:py-3 rounded-full text-sm font-bold transition-all hover:opacity-90 cursor-pointer order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed'
            style={{
              background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
              color: '#000000',
            }}
          >
            {uploading ? 'Uploading...' : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
          </button>
        </div>

        {/* Custom Styles */}
        <style jsx global>{`
          .document-modal-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .document-modal-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .document-modal-scrollbar::-webkit-scrollbar-thumb {
            background: ${isDarkMode
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.1)'};
            border-radius: 4px;
          }
          .document-modal-scrollbar::-webkit-scrollbar-thumb:hover {
            background: ${isDarkMode
              ? 'rgba(255, 255, 255, 0.2)'
              : 'rgba(0, 0, 0, 0.2)'};
          }
          .document-modal-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: ${isDarkMode
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.1)'} transparent;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes scaleIn {
            from {
              transform: scale(0.95);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

