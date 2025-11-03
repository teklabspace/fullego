'use client';
import Image from 'next/image';
import { useState } from 'react';
import Modal from '../ui/Modal';

const FileUploadModal = ({ isOpen, setIsOpen, onPreview }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [tags, setTags] = useState(['Bank Statements', 'Bond List']);
  const [tagInput, setTagInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = e => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = e => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileSelect = e => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleAddTag = e => {
    if (e.key === 'Enter' && tagInput.trim() && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = tagToRemove => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = () => {
    if (selectedFile) {
      console.log('Preview file:', selectedFile);
      console.log('Tags:', tags);
      // Close this modal and open preview
      setIsOpen(false);
      if (onPreview) {
        onPreview(selectedFile, tags);
      }
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedFile(null);
    setTags(['Bank Statements', 'Bond List']);
  };

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} maxWidth='max-w-2xl'>
      {/* Header */}
      <div
        className='flex justify-between items-center px-4 md:px-6 py-3 md:py-4'
        style={{
          borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
        }}
      >
        <h2 className='text-xl md:text-2xl font-bold text-white'>
          File Upload
        </h2>
        <button
          onClick={handleClose}
          className='text-white hover:text-gray-300 transition-colors cursor-pointer'
        >
          <Image
            src='/icons/close-x.svg'
            alt='Close'
            width={24}
            height={24}
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </button>
      </div>

      {/* Content */}
      <div
        className='px-4 md:px-6 py-4 md:py-6 max-h-[calc(100vh-150px)] md:max-h-[calc(90vh-150px)] lg:max-h-[700px] overflow-y-auto custom-modal-scroll'
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'transparent transparent',
        }}
      >
        <style jsx>{`
          .custom-modal-scroll::-webkit-scrollbar {
            width: 6px;
          }
          .custom-modal-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-modal-scroll::-webkit-scrollbar-thumb {
            background: rgba(212, 175, 55, 0.3);
            border-radius: 3px;
          }
          .custom-modal-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(212, 175, 55, 0.5);
          }
        `}</style>
        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 md:p-12 mb-4 transition-all cursor-pointer ${
            isDragging
              ? 'border-[#D4AF37] bg-[#D4AF37]/10'
              : 'border-gray-600 hover:border-[#D4AF37]/50'
          }`}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <input
            id='fileInput'
            type='file'
            className='hidden'
            accept='.doc,.docx,.pdf,.xls,.xlsx,.csv'
            onChange={handleFileSelect}
          />
          <div className='text-center'>
            <div className='mb-4 flex justify-center'>
              <Image
                src='/icons/upload-icon.svg'
                alt='Upload'
                width={48}
                height={48}
                className='w-9 h-9 md:w-12 md:h-12'
              />
            </div>
            {selectedFile ? (
              <p className='text-white font-medium mb-2 text-sm md:text-base'>
                Selected: {selectedFile.name}
              </p>
            ) : (
              <p className='text-white font-medium mb-2 text-sm md:text-base'>
                Click or drag file to this area to upload
              </p>
            )}
          </div>
        </div>
        <p className='text-gray-400 text-xs md:text-sm mb-4'>
          Formats accepted are .doc(x), .pdf, .xls(x), .csv
        </p>

        {/* Download Template */}
        <div
          className='mb-6 pb-6'
          style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}
        >
          <p className='text-gray-300 text-xs md:text-sm mb-3'>
            If you do not have a file, you can use the template below:
          </p>
          <button
            className='flex items-center gap-2 px-4 py-2 rounded-full transition-all cursor-pointer text-sm'
            style={{
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              color: '#D4AF37',
            }}
          >
            <Image
              src='/icons/download-template.svg'
              alt='Download'
              width={20}
              height={20}
            />
            Download Doc Template
          </button>
        </div>

        {/* Add Tags */}
        <div className='mb-6'>
          <div className='flex justify-between items-center mb-3'>
            <label className='text-white font-medium text-sm md:text-base'>
              Add Tags (optional)
            </label>
            <span className='text-gray-400 text-xs md:text-sm'>
              {5 - tags.length} tags remaining
            </span>
          </div>
          <input
            type='text'
            placeholder='Type to search...'
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            disabled={tags.length >= 5}
            className='w-full px-4 py-3 rounded-full text-white text-sm placeholder-gray-500 focus:outline-none transition-all mb-3 cursor-text'
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
          <div className='flex flex-wrap gap-2'>
            {tags.map((tag, index) => (
              <div
                key={index}
                className='flex items-center gap-2 px-4 py-2 rounded-full text-sm'
                style={{
                  background: 'rgba(212, 175, 55, 0.1)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  color: '#D4AF37',
                }}
              >
                <span>{tag}</span>
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className='hover:text-gray-300 transition-colors cursor-pointer'
                >
                  <Image
                    src='/icons/tag-close.svg'
                    alt='Remove'
                    width={14}
                    height={14}
                    style={{ filter: 'brightness(0) invert(1)' }}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Preview Button */}
        <div className='pb-4'>
          <button
            onClick={handleSubmit}
            disabled={!selectedFile}
            className='flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
            style={{
              background: selectedFile
                ? 'linear-gradient(90deg, #FFFFFF 0%, #D4AF37 100%)'
                : 'rgba(255, 255, 255, 0.1)',
              color: selectedFile ? '#000000' : '#9CA3AF',
              width: '271px',
            }}
          >
            <Image
              src='/icons/eye-preview.svg'
              alt='Preview'
              width={20}
              height={20}
              style={{
                filter: selectedFile ? 'none' : 'grayscale(100%)',
              }}
            />
            Preview Document
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default FileUploadModal;

