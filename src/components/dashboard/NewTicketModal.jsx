'use client';
import Image from 'next/image';
import { useState } from 'react';
import { createTicket, uploadTicketDocumentsWithProgress } from '@/utils/supportTicketsApi';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { COMMON_SPECS, sanitizeText, validateForSpec } from '@/utils/validation';

const formatFileSize = bytes => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export default function NewTicketModal({ isOpen, setIsOpen, onTicketCreated }) {
  // The ticket's requester is always the person filing it — the backend sets
  // it from the authenticated caller regardless of what's sent, so this is
  // display-only. There is no "file on someone else's behalf" flow here.
  const { user } = useAuth();
  const loggedInName =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    user?.name ||
    user?.email ||
    '';
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    priority: '',
    description: '',
    channel: 'web',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [attachments, setAttachments] = useState([]);
  // null = not uploading attachments yet; a ticket must exist before the
  // upload endpoint (POST /tickets/{id}/documents) has anywhere to send to.
  const [uploadProgress, setUploadProgress] = useState(null);

  const handleFileChange = e => {
    const selected = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...selected]);
    // Reset the input so picking the same file again after removing it fires
    // onChange (the browser otherwise treats it as an unchanged selection).
    e.target.value = '';
  };

  const handleRemoveAttachment = index => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // support_tickets.subject is String(255) and description is Text; both are
  // NOT NULL, and a one-word description helps nobody triage the ticket.
  const ticketErrors = {
    subject: validateForSpec(COMMON_SPECS.ticketSubject, formData.subject),
    description: validateForSpec(
      COMMON_SPECS.ticketDescription,
      formData.description
    ),
  };
  const hasTicketError = Boolean(ticketErrors.subject || ticketErrors.description);

  const ticketFieldMsg = key =>
    ticketErrors[key] ? (
      <p className='mt-1.5 text-xs text-red-400'>{ticketErrors[key]}</p>
    ) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (hasTicketError) {
      setError(ticketErrors.subject || ticketErrors.description);
      return;
    }

    setIsSubmitting(true);

    try {
      const ticketData = {
        subject: formData.subject,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        channel: formData.channel || 'web',
      };

      const response = await createTicket(ticketData);
      const newTicketId = response?.id || response?.ticketId;

      if (attachments.length > 0 && newTicketId) {
        setUploadProgress(0);
        try {
          await uploadTicketDocumentsWithProgress(newTicketId, attachments, setUploadProgress);
        } catch (uploadErr) {
          console.error('Failed to upload attachments:', uploadErr);
          // The ticket itself was created successfully — don't block on this,
          // just tell the user the attachment specifically didn't make it.
          toast.error(
            uploadErr?.data?.detail || uploadErr?.message || 'Ticket created, but the attachment failed to upload.'
          );
        }
        setUploadProgress(null);
      }

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
        channel: 'web',
      });
      setAttachments([]);
    } catch (err) {
      console.error('Failed to create ticket:', err);
      const errorMsg = err.data?.detail || err.message || 'Failed to create ticket. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
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
              value={formData.subject}
              onChange={e =>
                setFormData({
                  ...formData,
                  subject: sanitizeText(e.target.value, { maxLen: 255 }),
                })
              }
              maxLength={255}
              placeholder='Enter ticket subject'
              className={`w-full px-4 py-3 rounded-lg bg-transparent border text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors ${
                ticketErrors.subject && formData.subject
                  ? 'border-red-500'
                  : 'border-white/10'
              }`}
            />
            {formData.subject ? ticketFieldMsg('subject') : null}
          </div>

          {/* Issuer — always the logged-in user filing this ticket */}
          <div>
            <label className='block text-white text-sm font-medium mb-2'>
              Issuer
            </label>
            <div className='w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-gray-300'>
              {loggedInName || 'You'}
            </div>
            <p className='text-gray-500 text-xs mt-1'>
              Tickets are filed under your account
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
              rows={6}
              value={formData.description}
              onChange={e =>
                setFormData({
                  ...formData,
                  description: sanitizeText(e.target.value, { maxLen: 5000 }),
                })
              }
              maxLength={5000}
              placeholder='Describe your issue in detail...'
              className={`w-full px-4 py-3 rounded-lg bg-transparent border text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors resize-none ${
                ticketErrors.description && formData.description
                  ? 'border-red-500'
                  : 'border-white/10'
              }`}
            />
            {formData.description ? ticketFieldMsg('description') : null}
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
                multiple
                className='hidden'
                accept='image/*,.pdf,.doc,.docx'
                onChange={handleFileChange}
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

            {/* Selected files */}
            {attachments.length > 0 && (
              <div className='space-y-2 mt-3'>
                {attachments.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className='flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5'
                  >
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-white truncate'>
                        {file.name}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <button
                      type='button'
                      onClick={() => handleRemoveAttachment(index)}
                      disabled={isSubmitting}
                      className='p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed'
                      title='Remove attachment'
                    >
                      <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                        <path d='M18 6L6 18M6 6l12 12' />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload progress — only shown once the ticket exists and the
                attachment upload call is actually in flight */}
            {uploadProgress !== null && (
              <div className='mt-3'>
                <div className='flex items-center justify-between mb-1.5'>
                  <span className='text-xs font-medium text-gray-300'>
                    Uploading attachment…
                  </span>
                  <span className='text-xs font-semibold text-[#F1CB68]'>
                    {uploadProgress}%
                  </span>
                </div>
                <div className='h-2 rounded-full overflow-hidden bg-white/10'>
                  <div
                    className='h-full bg-[#F1CB68] transition-all duration-150'
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
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
            {uploadProgress !== null
              ? `Uploading ${uploadProgress}%`
              : isSubmitting
              ? 'Creating...'
              : 'Submit Ticket'}
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
