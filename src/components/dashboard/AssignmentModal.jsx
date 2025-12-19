'use client';
import Image from 'next/image';
import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function AssignmentModal({
  isOpen,
  setIsOpen,
  onAssign,
  title = 'Assign to CRM User',
  itemName = 'task',
}) {
  const { isDarkMode } = useTheme();
  const [selectedUser, setSelectedUser] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [internalNote, setInternalNote] = useState('');

  // Mock CRM users - in production, this would come from an API
  const crmUsers = [
    { id: '1', name: 'Sarah Johnson', email: 'sarah.j@akunuba.com' },
    { id: '2', name: 'Monica H', email: 'monica.h@akunuba.com' },
    { id: '3', name: 'Viola D', email: 'viola.d@akunuba.com' },
    { id: '4', name: 'Judy Green', email: 'judy.g@akunuba.com' },
    { id: '5', name: 'Taylor B', email: 'taylor.b@akunuba.com' },
  ];

  const handleSubmit = e => {
    e.preventDefault();
    if (!selectedUser) return;

    const user = crmUsers.find(u => u.id === selectedUser);
    onAssign({
      userId: selectedUser,
      userName: user.name,
      dueDate,
      internalNote,
    });

    // Reset form
    setSelectedUser('');
    setDueDate('');
    setInternalNote('');
    setIsOpen(false);
  };

  const handleClose = () => {
    setSelectedUser('');
    setDueDate('');
    setInternalNote('');
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
        className={`w-full max-w-lg cursor-default relative overflow-hidden rounded-2xl my-auto max-h-[95vh] sm:max-h-[90vh] flex flex-col ${
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

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className='p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto flex-1 assignment-modal-scrollbar'
        >
          {/* Select CRM User */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Who do you want to assign this {itemName} to?{' '}
              <span className='text-red-500'>*</span>
            </label>
            <select
              required
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border text-sm transition-colors ${
                isDarkMode
                  ? 'bg-[#2C2C2E] border-[#FFFFFF14] text-white focus:border-[#F1CB68]'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-[#F1CB68]'
              } focus:outline-none`}
            >
              <option value='' className={isDarkMode ? 'bg-[#1a1a1d]' : ''}>
                Select a CRM user
              </option>
              {crmUsers.map(user => (
                <option
                  key={user.id}
                  value={user.id}
                  className={isDarkMode ? 'bg-[#1a1a1d]' : ''}
                >
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              When should it be completed?
            </label>
            <input
              type='date'
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 rounded-lg border text-sm transition-colors ${
                isDarkMode
                  ? 'bg-[#2C2C2E] border-[#FFFFFF14] text-white focus:border-[#F1CB68]'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-[#F1CB68]'
              } focus:outline-none`}
            />
          </div>

          {/* Internal Note */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Do you want to leave an internal note?
            </label>
            <textarea
              rows={4}
              value={internalNote}
              onChange={e => setInternalNote(e.target.value)}
              placeholder='Add any internal notes or instructions...'
              className={`w-full px-4 py-3 rounded-lg border text-sm transition-colors resize-none ${
                isDarkMode
                  ? 'bg-[#2C2C2E] border-[#FFFFFF14] text-white placeholder-gray-500 focus:border-[#F1CB68]'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#F1CB68]'
              } focus:outline-none`}
            />
          </div>
        </form>

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
            type='submit'
            onClick={handleSubmit}
            disabled={!selectedUser}
            className='px-8 py-2.5 md:py-3 rounded-full text-sm font-bold transition-all hover:opacity-90 cursor-pointer order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed'
            style={{
              background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
              color: '#000000',
            }}
          >
            Assign
          </button>
        </div>

        {/* Custom Styles */}
        <style jsx global>{`
          .assignment-modal-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .assignment-modal-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .assignment-modal-scrollbar::-webkit-scrollbar-thumb {
            background: ${isDarkMode
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.1)'};
            border-radius: 4px;
          }
          .assignment-modal-scrollbar::-webkit-scrollbar-thumb:hover {
            background: ${isDarkMode
              ? 'rgba(255, 255, 255, 0.2)'
              : 'rgba(0, 0, 0, 0.2)'};
          }
          .assignment-modal-scrollbar {
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

