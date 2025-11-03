'use client';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

export default function NewTicketModal({ isOpen, setIsOpen }) {
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    priority: '',
    description: '',
  });

  const handleSubmit = e => {
    e.preventDefault();
    console.log('New ticket:', formData);
    // Add your ticket creation logic here
    setIsOpen(false);
    // Reset form
    setFormData({
      subject: '',
      category: '',
      priority: '',
      description: '',
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className='bg-black/60 backdrop-blur-sm p-2 md:p-4 lg:p-6 fixed inset-0 z-50 grid place-items-center overflow-y-auto cursor-pointer'
        >
          <motion.div
            initial={{ scale: 0, rotate: '12.5deg' }}
            animate={{ scale: 1, rotate: '0deg' }}
            exit={{ scale: 0, rotate: '0deg' }}
            onClick={e => e.stopPropagation()}
            className='w-full max-w-2xl cursor-default relative overflow-hidden rounded-2xl'
            style={{
              background:
                'linear-gradient(135deg, rgba(30, 30, 35, 0.98) 0%, rgba(20, 20, 25, 0.98) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Header */}
            <div className='flex items-center justify-between p-4 md:p-6 border-b border-white/10'>
              <h2 className='text-lg md:text-2xl font-bold text-white'>Create New Ticket</h2>
              <button
                onClick={() => setIsOpen(false)}
                className='w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer shrink-0'
              >
                <Image
                  src='/icons/close-icon.svg'
                  alt='Close'
                  width={18}
                  height={18}
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className='p-4 md:p-6 space-y-4 md:space-y-6'>
              {/* Subject */}
              <div>
                <label className='block text-white text-sm font-medium mb-2'>
                  Subject <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  required
                  value={formData.subject}
                  onChange={e =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  placeholder='Enter ticket subject'
                  className='w-full px-4 py-3 rounded-lg bg-transparent border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors'
                />
              </div>

              {/* Category and Priority */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Category */}
                <div>
                  <label className='block text-white text-sm font-medium mb-2'>
                    Category <span className='text-red-500'>*</span>
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={e =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className='w-full px-4 py-3 rounded-lg bg-transparent border border-white/10 text-white focus:outline-none focus:border-[#D4AF37] transition-colors cursor-pointer'
                    style={{
                      backgroundImage: 'url(/icons/chevron-down.svg)',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '16px',
                    }}
                  >
                    <option value='' className='bg-[#1a1a1d]'>
                      Select category
                    </option>
                    <option value='technical' className='bg-[#1a1a1d]'>
                      Technical Issue
                    </option>
                    <option value='billing' className='bg-[#1a1a1d]'>
                      Billing & Payment
                    </option>
                    <option value='feature' className='bg-[#1a1a1d]'>
                      Feature Request
                    </option>
                    <option value='account' className='bg-[#1a1a1d]'>
                      Account Issue
                    </option>
                    <option value='other' className='bg-[#1a1a1d]'>
                      Other
                    </option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className='block text-white text-sm font-medium mb-2'>
                    Priority <span className='text-red-500'>*</span>
                  </label>
                  <select
                    required
                    value={formData.priority}
                    onChange={e =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className='w-full px-4 py-3 rounded-lg bg-transparent border border-white/10 text-white focus:outline-none focus:border-[#D4AF37] transition-colors cursor-pointer'
                    style={{
                      backgroundImage: 'url(/icons/chevron-down.svg)',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '16px',
                    }}
                  >
                    <option value='' className='bg-[#1a1a1d]'>
                      Select priority
                    </option>
                    <option value='low' className='bg-[#1a1a1d]'>
                      Low
                    </option>
                    <option value='medium' className='bg-[#1a1a1d]'>
                      Medium
                    </option>
                    <option value='high' className='bg-[#1a1a1d]'>
                      High
                    </option>
                    <option value='urgent' className='bg-[#1a1a1d]'>
                      Urgent
                    </option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className='block text-white text-sm font-medium mb-2'>
                  Description <span className='text-red-500'>*</span>
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder='Describe your issue in detail...'
                  className='w-full px-4 py-3 rounded-lg bg-transparent border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors resize-none'
                />
              </div>

              {/* Attachment */}
              <div>
                <label className='block text-white text-sm font-medium mb-2'>
                  Attachment (optional)
                </label>
                <div
                  className='border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-[#D4AF37] transition-colors cursor-pointer'
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  <input
                    id='file-upload'
                    type='file'
                    className='hidden'
                    accept='image/*,.pdf,.doc,.docx'
                  />
                  <Image
                    src='/icons/upload-cloud.svg'
                    alt='Upload'
                    width={40}
                    height={40}
                    className='mx-auto mb-3'
                    style={{ filter: 'brightness(0) invert(1) opacity(0.5)' }}
                  />
                  <p className='text-gray-400 text-sm mb-1'>
                    Click to upload or drag and drop
                  </p>
                  <p className='text-gray-500 text-xs'>
                    PNG, JPG, PDF up to 10MB
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4'>
                <button
                  type='button'
                  onClick={() => setIsOpen(false)}
                  className='px-6 py-2.5 md:py-3 rounded-full text-sm font-medium text-white hover:bg-white/10 transition-colors cursor-pointer order-2 sm:order-1'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-8 py-2.5 md:py-3 rounded-full text-sm font-bold transition-all hover:opacity-90 cursor-pointer order-1 sm:order-2'
                  style={{
                    background: 'linear-gradient(90deg, #FFFFFF 0%, #D4AF37 100%)',
                    color: '#000000',
                  }}
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </motion.div>

          {/* Custom Scrollbar Styles */}
          <style jsx global>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(212, 175, 55, 0.3);
              border-radius: 3px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(212, 175, 55, 0.5);
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

