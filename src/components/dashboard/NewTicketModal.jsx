'use client';
import Image from 'next/image';
import { useState } from 'react';
import { createTicket } from '@/utils/supportTicketsApi';
import { toast } from 'react-toastify';

export default function NewTicketModal({ isOpen, setIsOpen, onTicketCreated }) {
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    priority: '',
    description: '',
    issuer: '',
    channel: 'web',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const ticketData = {
        subject: formData.subject,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        issuer: formData.issuer,
        channel: formData.channel || 'web',
      };

      const response = await createTicket(ticketData);
      
      toast.success('Ticket created successfully!');
      
      // Call callback to refresh tickets list
      if (onTicketCreated) {
        onTicketCreated(response);
      }
      
      setIsOpen(false);
      
      // Reset form
      setFormData({
        subject: '',
        category: '',
        priority: '',
        description: '',
        issuer: '',
        channel: 'web',
      });
    } catch (err) {
      console.error('Failed to create ticket:', err);
      const errorMsg = err.data?.detail || err.message || 'Failed to create ticket. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      onClick={() => setIsOpen(false)}
      className='bg-black/60 backdrop-blur-sm p-2 sm:p-4 fixed inset-0 z-50 flex items-center justify-center overflow-y-auto cursor-pointer'
      style={{ animation: 'fadeIn 0.2s ease-out' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className='w-full max-w-2xl cursor-default relative overflow-hidden rounded-2xl my-auto max-h-[95vh] sm:max-h-[90vh] flex flex-col'
        style={{
          background:
            'linear-gradient(135deg, rgba(30, 30, 35, 0.98) 0%, rgba(20, 20, 25, 0.98) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          animation: 'scaleIn 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div className='flex items-center justify-between p-4 md:p-6 border-b border-white/10 shrink-0'>
          <h2 className='text-lg md:text-2xl font-bold text-white'>
            Create New Ticket
          </h2>
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
        <form id='ticket-form' onSubmit={handleSubmit} className='p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto flex-1 ticket-modal-scrollbar'>
          {/* Error Message */}
          {error && (
            <div className='bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm'>
              {error}
            </div>
          )}
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
              className='w-full px-4 py-3 rounded-lg bg-transparent border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors'
            />
          </div>

          {/* Issuer Selection */}
          <div>
            <label className='block text-white text-sm font-medium mb-2'>
              Issuer <span className='text-red-500'>*</span>
            </label>
            <select
              required
              value={formData.issuer}
              onChange={e =>
                setFormData({ ...formData, issuer: e.target.value })
              }
              className='w-full px-4 py-3 rounded-lg bg-transparent border border-white/10 text-white focus:outline-none focus:border-[#F1CB68] transition-colors'
            >
              <option value='' className='bg-[#1a1a1d]'>
                Select issuer (person or business)
              </option>
              <option value='john-smith' className='bg-[#1a1a1d]'>
                John Smith
              </option>
              <option value='oakridge-family-office' className='bg-[#1a1a1d]'>
                Oakridge Family Office
              </option>
              <option value='isabella-w' className='bg-[#1a1a1d]'>
                Isabella W
              </option>
              <option value='ryan-green' className='bg-[#1a1a1d]'>
                Ryan Green
              </option>
              <option value='marta-diaz' className='bg-[#1a1a1d]'>
                Marta Diaz
              </option>
              <option value='matthew-m' className='bg-[#1a1a1d]'>
                Matthew M
              </option>
              <option value='brian-baker' className='bg-[#1a1a1d]'>
                Brian Baker
              </option>
            </select>
            <p className='text-gray-500 text-xs mt-1'>
              The person or business that raised this issue
            </p>
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
                className='w-full px-4 py-3 rounded-lg bg-transparent border border-white/10 text-white focus:outline-none focus:border-[#F1CB68] transition-colors'
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
                className='w-full px-4 py-3 rounded-lg bg-transparent border border-white/10 text-white focus:outline-none focus:border-[#F1CB68] transition-colors'
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
              className='w-full px-4 py-3 rounded-lg bg-transparent border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors resize-none'
            />
          </div>

          {/* Attachment */}
          <div>
            <label className='block text-white text-sm font-medium mb-2'>
              Attachment (optional)
            </label>
            <div
              className='border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-[#F1CB68] transition-colors cursor-pointer'
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
              <p className='text-gray-500 text-xs'>PNG, JPG, PDF up to 10MB</p>
            </div>
          </div>
        </form>

        {/* Buttons */}
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 p-4 md:p-6 border-t border-white/10 shrink-0'>
          <button
            type='button'
            onClick={() => setIsOpen(false)}
            className='px-6 py-2.5 md:py-3 rounded-full text-sm font-medium text-white hover:bg-white/10 transition-colors cursor-pointer order-2 sm:order-1'
          >
            Cancel
          </button>
          <button
            type='submit'
            form='ticket-form'
            disabled={isSubmitting}
            className='px-8 py-2.5 md:py-3 rounded-full text-sm font-bold transition-all hover:opacity-90 cursor-pointer order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed'
            style={{
              background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
              color: '#000000',
            }}
          >
            {isSubmitting ? 'Creating...' : 'Submit Ticket'}
          </button>
        </div>

        {/* Custom Styles and Animations */}
        <style jsx global>{`
          .ticket-modal-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .ticket-modal-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .ticket-modal-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
          }
          .ticket-modal-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2);
          }
          .ticket-modal-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
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
