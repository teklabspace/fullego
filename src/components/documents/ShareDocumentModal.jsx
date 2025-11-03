'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Modal from '../ui/Modal';

const ShareDocumentModal = ({ isOpen, setIsOpen, file, onShare }) => {
  const [activeTab, setActiveTab] = useState('invite');
  const [viewOnly, setViewOnly] = useState(true);
  const [restrictDownload, setRestrictDownload] = useState(false);
  const [requireSignIn, setRequireSignIn] = useState(false);
  const [shareLink] = useState('https://fullego.com/share/abc123');
  const [copied, setCopied] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [invitedUsers, setInvitedUsers] = useState([
    { id: 1, email: 'johndoe@example.com', permission: 'view', initials: 'JD' },
    {
      id: 2,
      email: 'annastone@example.com',
      permission: 'view',
      initials: 'AS',
    },
  ]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (
        openDropdownId !== null &&
        !event.target.closest('.permission-dropdown')
      ) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdownId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddEmail = () => {
    if (emailInput && emailInput.includes('@')) {
      const initials = emailInput
        .split('@')[0]
        .split('.')
        .map(n => n[0].toUpperCase())
        .join('')
        .substring(0, 2);

      setInvitedUsers([
        ...invitedUsers,
        {
          id: Date.now(),
          email: emailInput,
          permission: 'view',
          initials: initials,
        },
      ]);
      setEmailInput('');
    }
  };

  const handleRemoveUser = id => {
    setInvitedUsers(invitedUsers.filter(user => user.id !== id));
  };

  const handlePermissionChange = (id, permission) => {
    setInvitedUsers(
      invitedUsers.map(user =>
        user.id === id ? { ...user, permission } : user
      )
    );
    setOpenDropdownId(null);
  };

  const getPermissionLabel = permission => {
    const labels = {
      view: 'Can view',
      edit: 'Can edit',
      comment: 'Can comment',
    };
    return labels[permission] || 'Can view';
  };

  const handleShare = () => {
    console.log('Share settings:', {
      viewOnly,
      restrictDownload,
      requireSignIn,
      shareLink,
      invitedUsers,
    });
    if (onShare) {
      onShare();
    }
    setIsOpen(false);
  };

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} maxWidth='max-w-xl'>
      {/* Header */}
      <div className='p-6 pb-0'>
        <div className='flex items-center gap-3 mb-6'>
          <Image
            src='/icons/Shear.svg'
            alt='Share'
            width={24}
            height={24}
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <h2 className='text-2xl font-bold text-white'>Share Document</h2>
        </div>

        {/* Document Info */}
        <div
          className='flex items-center gap-3 px-4 py-3 rounded-lg mb-6'
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Image
            src='/icons/file-text.svg'
            alt='Document'
            width={20}
            height={20}
          />
          <span className='text-white text-sm truncate'>
            {file?.name || 'Q2 Portfolio Summary.pdf'}
          </span>
        </div>

        {/* Tabs */}
        <div className='flex gap-2 mb-6'>
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${
              activeTab === 'link' ? 'text-white' : 'text-gray-400'
            }`}
            style={{
              borderBottom:
                activeTab === 'link'
                  ? '2px solid #D4AF37'
                  : '2px solid transparent',
            }}
          >
            Get shareable link
          </button>
          <button
            onClick={() => setActiveTab('invite')}
            className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${
              activeTab === 'invite' ? 'text-white' : 'text-gray-400'
            }`}
            style={{
              borderBottom:
                activeTab === 'invite'
                  ? '2px solid #D4AF37'
                  : '2px solid transparent',
            }}
          >
            Invite Specific People
          </button>
        </div>
      </div>

      {/* Content */}
      <div className='px-6 pb-6'>
        {activeTab === 'link' ? (
          <div>
            {/* Permission Options */}
            <h3 className='text-white font-semibold mb-4'>
              Permission Options
            </h3>

            {/* View Only */}
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-2'>
                <span className='text-white text-sm'>View only</span>
                <button
                  className='w-4 h-4 rounded-full flex items-center justify-center cursor-pointer'
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                  title='View only means users can see the document but cannot edit it'
                >
                  <span className='text-white text-xs'>i</span>
                </button>
              </div>
              <button
                onClick={() => setViewOnly(!viewOnly)}
                className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                  viewOnly
                    ? 'bg-gradient-to-r from-white to-[#D4AF37]'
                    : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full transition-transform ${
                    viewOnly
                      ? 'translate-x-6 bg-gray-900'
                      : 'translate-x-0.5 bg-gray-300'
                  }`}
                />
              </button>
            </div>

            {/* Restrict Download */}
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-2'>
                <span className='text-white text-sm'>Restrict Download</span>
                <button
                  className='w-4 h-4 rounded-full flex items-center justify-center cursor-pointer'
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                  title='Prevent users from downloading the document'
                >
                  <span className='text-white text-xs'>i</span>
                </button>
              </div>
              <button
                onClick={() => setRestrictDownload(!restrictDownload)}
                className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                  restrictDownload
                    ? 'bg-gradient-to-r from-white to-[#D4AF37]'
                    : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full transition-transform ${
                    restrictDownload
                      ? 'translate-x-6 bg-gray-900'
                      : 'translate-x-0.5 bg-gray-300'
                  }`}
                />
              </button>
            </div>

            {/* Share Link */}
            <div
              className='flex items-center gap-3 px-4 py-3 rounded-lg mb-4'
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Image
                src='/icons/Shear.svg'
                alt='Link'
                width={16}
                height={16}
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <input
                type='text'
                value={shareLink}
                readOnly
                className='flex-1 bg-transparent text-gray-400 text-sm outline-none'
              />
              <button
                onClick={handleCopyLink}
                className='flex items-center gap-2 text-[#D4AF37] text-sm font-medium cursor-pointer hover:text-[#E5C158] transition-colors'
              >
                <Image
                  src='/icons/file-text.svg'
                  alt='Copy'
                  width={16}
                  height={16}
                  style={{
                    filter:
                      'brightness(0) saturate(100%) invert(73%) sepia(48%) saturate(418%) hue-rotate(6deg) brightness(94%) contrast(87%)',
                  }}
                />
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>

            {/* Require Sign-in */}
            <div
              className='flex items-center justify-between pt-4'
              style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <div className='flex items-center gap-2'>
                <Image
                  src='/icons/shield.svg'
                  alt='Security'
                  width={20}
                  height={20}
                  style={{
                    filter:
                      'brightness(0) saturate(100%) invert(73%) sepia(48%) saturate(418%) hue-rotate(6deg) brightness(94%) contrast(87%)',
                  }}
                />
                <span className='text-white text-sm'>
                  Require sign-in to view
                </span>
              </div>
              <button
                onClick={() => setRequireSignIn(!requireSignIn)}
                className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                  requireSignIn
                    ? 'bg-gradient-to-r from-white to-[#D4AF37]'
                    : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full transition-transform ${
                    requireSignIn
                      ? 'translate-x-6 bg-gray-900'
                      : 'translate-x-0.5 bg-gray-300'
                  }`}
                />
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Permission Options */}
            <h3 className='text-white font-semibold mb-4'>
              Permission Options
            </h3>

            {/* Email Input */}
            <div
              className='flex items-center gap-3 px-4 py-3 rounded-lg mb-4'
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Image
                src='/icons/user-icon.svg'
                alt='User'
                width={20}
                height={20}
              />
              <input
                type='email'
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleAddEmail()}
                placeholder='Enter email addresses...'
                className='flex-1 bg-transparent text-white text-sm outline-none placeholder:text-gray-500'
              />
              <button
                onClick={handleAddEmail}
                className='w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-[#D4AF37]/20'
                style={{
                  border: '1px solid #D4AF37',
                }}
              >
                <span className='text-[#D4AF37] text-lg leading-none'>+</span>
              </button>
            </div>

            {/* Invited Users List */}
            {invitedUsers.length > 0 && (
              <div className='space-y-3 mb-6'>
                {invitedUsers.map(user => (
                  <div key={user.id} className='flex items-center gap-3'>
                    {/* Avatar */}
                    <div
                      className='w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0'
                      style={{
                        background: '#333333',
                      }}
                    >
                      {user.initials}
                    </div>

                    {/* Email */}
                    <span className='flex-1 text-white text-sm'>
                      {user.email}
                    </span>

                    {/* Permission Dropdown */}
                    <div className='relative permission-dropdown'>
                      <button
                        onClick={() =>
                          setOpenDropdownId(
                            openDropdownId === user.id ? null : user.id
                          )
                        }
                        className='flex items-center gap-2 text-[#D4AF37] text-sm font-medium cursor-pointer hover:text-[#E5C158] transition-colors'
                      >
                        {getPermissionLabel(user.permission)}
                        <Image
                          src='/icons/chevron-down.svg'
                          alt='Dropdown'
                          width={12}
                          height={12}
                          className={`transition-transform ${
                            openDropdownId === user.id ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {/* Custom Dropdown Menu */}
                      {openDropdownId === user.id && (
                        <div
                          className='absolute right-0 top-full mt-2 rounded-lg overflow-hidden shadow-xl z-50 min-w-[140px]'
                          style={{
                            background:
                              'linear-gradient(135deg, #1a1a1d 0%, #0f0f11 100%)',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                          }}
                        >
                          <button
                            onClick={() =>
                              handlePermissionChange(user.id, 'view')
                            }
                            className={`w-full px-4 py-2.5 text-left text-sm transition-all cursor-pointer ${
                              user.permission === 'view'
                                ? 'bg-gradient-to-r from-[#D4AF37]/20 to-transparent text-[#D4AF37] font-medium'
                                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            Can view
                          </button>
                          <button
                            onClick={() =>
                              handlePermissionChange(user.id, 'edit')
                            }
                            className={`w-full px-4 py-2.5 text-left text-sm transition-all cursor-pointer ${
                              user.permission === 'edit'
                                ? 'bg-gradient-to-r from-[#D4AF37]/20 to-transparent text-[#D4AF37] font-medium'
                                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            Can edit
                          </button>
                          <button
                            onClick={() =>
                              handlePermissionChange(user.id, 'comment')
                            }
                            className={`w-full px-4 py-2.5 text-left text-sm transition-all cursor-pointer ${
                              user.permission === 'comment'
                                ? 'bg-gradient-to-r from-[#D4AF37]/20 to-transparent text-[#D4AF37] font-medium'
                                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            Can comment
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveUser(user.id)}
                      className='text-gray-400 hover:text-white transition-colors cursor-pointer'
                    >
                      <Image
                        src='/icons/close-icon.svg'
                        alt='Remove'
                        width={16}
                        height={16}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Checkboxes */}
            <div
              className='space-y-4 pt-4'
              style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              {/* View Only Checkbox */}
              <div className='flex items-center gap-3'>
                <button
                  onClick={() => setViewOnly(!viewOnly)}
                  className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer transition-all ${
                    viewOnly
                      ? 'bg-gradient-to-r from-white to-[#D4AF37]'
                      : 'bg-transparent'
                  }`}
                  style={{
                    border: viewOnly
                      ? 'none'
                      : '2px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  {viewOnly && (
                    <Image
                      src='/icons/check-small.svg'
                      alt='Check'
                      width={12}
                      height={12}
                    />
                  )}
                </button>
                <span className='text-white text-sm'>View only</span>
              </div>

              {/* Restrict Download Checkbox */}
              <div className='flex items-center gap-3'>
                <button
                  onClick={() => setRestrictDownload(!restrictDownload)}
                  className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer transition-all ${
                    restrictDownload
                      ? 'bg-gradient-to-r from-white to-[#D4AF37]'
                      : 'bg-transparent'
                  }`}
                  style={{
                    border: restrictDownload
                      ? 'none'
                      : '2px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  {restrictDownload && (
                    <Image
                      src='/icons/check-small.svg'
                      alt='Check'
                      width={12}
                      height={12}
                    />
                  )}
                </button>
                <span className='text-white text-sm'>Restrict Download</span>
              </div>

              {/* Require Sign-in Checkbox */}
              <div className='flex items-center gap-3'>
                <button
                  onClick={() => setRequireSignIn(!requireSignIn)}
                  className={`w-5 h-5 rounded flex items-center justify-center cursor-pointer transition-all ${
                    requireSignIn
                      ? 'bg-gradient-to-r from-white to-[#D4AF37]'
                      : 'bg-transparent'
                  }`}
                  style={{
                    border: requireSignIn
                      ? 'none'
                      : '2px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  {requireSignIn && (
                    <Image
                      src='/icons/check-small.svg'
                      alt='Check'
                      width={12}
                      height={12}
                    />
                  )}
                </button>
                <div className='flex items-center gap-2'>
                  <span className='text-white text-sm'>
                    Require sign-in to view
                  </span>
                  <button
                    className='w-4 h-4 rounded-full flex items-center justify-center cursor-pointer'
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                    title='Users must sign in to view the document'
                  >
                    <span className='text-white text-xs'>i</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className='flex justify-end gap-3 px-6 py-4'
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <button
          onClick={() => setIsOpen(false)}
          className='px-6 py-2.5 rounded-full text-sm font-medium text-white transition-colors cursor-pointer hover:bg-white/10'
        >
          Cancel
        </button>
        <button
          onClick={handleShare}
          className='px-6 py-2.5 rounded-full text-sm font-bold transition-all hover:opacity-90 cursor-pointer'
          style={{
            background: 'linear-gradient(90deg, #FFFFFF 0%, #D4AF37 100%)',
            color: '#000000',
          }}
        >
          Share
        </button>
      </div>
    </Modal>
  );
};

export default ShareDocumentModal;
