'use client';
import { useTheme } from '@/context/ThemeContext';
import Image from 'next/image';
import Modal from '../ui/Modal';

const UploadSuccessModal = ({ isOpen, setIsOpen, file, onReturnToDashboard, onShare }) => {
  const { isDarkMode } = useTheme();
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
      pdf: 'PDF',
      doc: 'DOC',
      docx: 'DOCX',
      xls: 'XLS',
      xlsx: 'XLSX',
      csv: 'CSV',
    };
    return typeMap[ext] || 'Document';
  };

  const handleShare = () => {
    setIsOpen(false);
    if (onShare) {
      onShare(file);
    }
  };

  const handleReturnToDashboard = () => {
    setIsOpen(false);
    if (onReturnToDashboard) {
      onReturnToDashboard();
    }
  };

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} maxWidth="max-w-2xl">
      <div className="flex flex-col items-center p-8 md:p-12">
        {/* Success Icon */}
        <div className="relative mb-6">
          {/* Outer Circle */}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(34, 197, 94, 0.2)',
            }}
          >
            {/* Inner Circle */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(34, 197, 94, 0.3)',
              }}
            >
              {/* Checkmark */}
              <Image
                src="/icons/check-success.svg"
                alt="Success"
                width={32}
                height={32}
              />
            </div>
          </div>
        </div>

        {/* Success Message */}
        <h2 className={`text-3xl font-bold mb-3 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>Upload Complete</h2>
        <p className={`text-center mb-8 max-w-md ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Your document has been successfully uploaded to our secure server and is
          now available for review.
        </p>

        {/* Document Info Card */}
        <div
          className="w-full rounded-2xl p-6 mb-6 border"
          style={
            isDarkMode
              ? {
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }
              : {
                  background: 'rgba(241, 203, 104, 0.2)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                }
          }
        >
          <div className="flex items-center gap-4">
            {/* File Icon */}
            <div
              className="w-16 h-16 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: isDarkMode
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(241, 203, 104, 0.2)',
              }}
            >
              <Image
                src="/icons/file-text.svg"
                alt="Document"
                width={32}
                height={32}
              />
            </div>

            {/* File Details */}
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-lg mb-2 truncate ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {file?.name || 'document.pdf'}
              </h3>
              <div className={`flex flex-wrap gap-3 text-sm mb-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <span>Type: {getFileType(file?.name)}</span>
                <span>Size: {file?.size ? formatFileSize(file.size) : '2.4 MB'}</span>
                <span>
                  Uploaded: {new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: '#22C55E' }}
                />
                <span className="text-green-500 text-sm font-medium">
                  Ready for Review
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full text-base font-bold transition-all hover:opacity-90 cursor-pointer mb-4"
          style={{
            background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
            color: '#000000',
          }}
        >
          <Image
            src="/icons/share-icon.svg"
            alt="Share"
            width={20}
            height={20}
          />
          Share Document
        </button>

        {/* Return to Dashboard Link */}
        <button
          onClick={handleReturnToDashboard}
          className={`flex items-center gap-2 transition-colors cursor-pointer text-sm ${
            isDarkMode
              ? 'text-gray-400 hover:text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <span>Return to dashboard</span>
          <Image
            src="/icons/arrow-right.svg"
            alt="Arrow"
            width={16}
            height={16}
          />
        </button>
      </div>
    </Modal>
  );
};

export default UploadSuccessModal;

