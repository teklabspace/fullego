'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const steps = [
  { id: 1, title: 'Account Setup', status: 'completed' },
  { id: 2, title: 'Document Verification', status: 'active' },
  { id: 3, title: 'Identity Confirmation', status: 'pending' },
  { id: 4, title: 'Complete', status: 'pending' },
];

export default function DocumentVerificationPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState({
    governmentId1: { file: null, status: 'pending' },
    governmentId2: { file: null, status: 'pending' },
    selfie: { file: null, status: 'pending' },
  });

  const handleFileUpload = (documentType, event) => {
    const file = event.target.files[0];
    if (file) {
      setDocuments(prev => ({
        ...prev,
        [documentType]: { file, status: 'added' },
      }));
      console.log(`${documentType} uploaded:`, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });
    }
  };

  const handleNext = () => {
    // Save documents data to localStorage
    const documentsData = {
      documents: documents,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('documentsData', JSON.stringify(documentsData));
    
    console.log('Step 2 - Document Verification Data:', documents);
    // Navigate to next step
    router.push('/identity-verification');
  };

  return (
    <div className='min-h-screen bg-[#0B0D12] text-white'>
      {/* Header with Logo and Stepper */}
      <div className='border-b border-gray-800'>
        {/* Logo */}
        <div className='max-w-7xl mx-auto px-4 md:px-8 py-6'>
          <div className='flex items-center justify-center gap-2'>
            <div className='w-10 h-10 bg-[#F1CB68] rounded-lg flex items-center justify-center'>
              <span className='text-[#0B0D12] text-xl font-bold'>F</span>
            </div>
            <span className='text-white text-xl font-semibold'>Fullego</span>
          </div>
        </div>

        {/* Stepper - Desktop */}
        <div className='hidden md:block max-w-4xl mx-auto px-8 pb-8'>
          <div className='relative flex items-center justify-between'>
            {steps.map((step, index) => (
              <div key={step.id} className='flex-1 relative flex items-center'>
                {/* Step Circle and Info */}
                <div className='flex flex-col items-center flex-1'>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm mb-2 transition-all ${
                      step.status === 'completed'
                        ? 'bg-gray-600 text-gray-400'
                        : step.status === 'active'
                        ? 'bg-[#F1CB68] text-[#0B0D12]'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {step.id}
                  </div>
                  <span
                    className={`text-sm text-nowrap text-center ${
                      step.status === 'active' ? 'text-white' : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className='h-[2px] flex-1 mx-4'
                    style={{
                      background:
                        step.status === 'completed'
                          ? 'rgba(107, 114, 128, 0.5)'
                          : step.status === 'active'
                          ? '#F1CB68'
                          : 'rgba(255, 255, 255, 0.1)',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stepper - Mobile */}
        <div className='md:hidden px-4 pb-6'>
          <div className='flex items-center justify-center'>
            {steps.map((step, index) => (
              <div key={step.id} className='flex items-center'>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                    step.status === 'completed'
                      ? 'bg-gray-600 text-gray-400'
                      : step.status === 'active'
                      ? 'bg-[#F1CB68] text-[#0B0D12]'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {step.id}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className='w-8 h-[2px] mx-1'
                    style={{
                      background:
                        step.status === 'completed'
                          ? 'rgba(107, 114, 128, 0.5)'
                          : step.status === 'active'
                          ? '#F1CB68'
                          : 'rgba(255, 255, 255, 0.1)',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12'>
        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Left Side - Upload Forms */}
          <div className='w-full lg:w-3/5'>
            {/* Page Title */}
            <div className='mb-6 md:mb-8'>
              <h1 className='text-2xl md:text-3xl lg:text-4xl font-bold mb-2'>
                Documents Verification
              </h1>
              <p className='text-gray-400 text-sm md:text-base'>
                Complete your verification by uploading the following documents
              </p>
            </div>

            {/* Document Upload Sections */}
            <div className='space-y-6'>
              {/* Government ID 1 */}
              <DocumentUploadCard
                title='Government-issued ID'
                description="Upload a valid passport, driver's license, or national ID card"
                status={documents.governmentId1.status}
                onFileChange={e => handleFileUpload('governmentId1', e)}
                acceptedFormats='JPG, PNG or PDF, max 10MB'
                buttonText='Upload ID'
                icon='document'
              />

              {/* Government ID 2 */}
              <DocumentUploadCard
                title='Government-issued ID'
                description="Upload a valid passport, driver's license, or national ID card"
                status={documents.governmentId2.status}
                onFileChange={e => handleFileUpload('governmentId2', e)}
                acceptedFormats='JPG, PNG or PDF, max 10MB'
                buttonText='Upload ID'
                icon='document'
              />

              {/* Selfie Verification */}
              <DocumentUploadCard
                title='Selfie Verification'
                description='Upload a clear photo of yourself holding your ID document'
                status={documents.selfie.status}
                onFileChange={e => handleFileUpload('selfie', e)}
                acceptedFormats='JPG or PNG, max 5MB'
                buttonText='Upload Selfie'
                icon='camera'
              />
            </div>
          </div>

          {/* Right Side - Info Cards */}
          <div className='w-full lg:w-2/5 space-y-6'>
            {/* Identity Card Mockup - Placeholder for image */}
            <div className=' p-6 md:p-8'>
              <img
                src='/FRAME (21) 1.png'
                alt='Identity Card Mockup'
                className='w-full'
              />
            </div>

            {/* Verification Notes */}
            <div
              className='rounded-2xl p-6'
              style={{
                background: 'rgba(30, 30, 35, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className='flex items-center gap-2 mb-4'>
                <span className='text-[#F1CB68] text-xl'>
                  <img src='Group.svg' alt='' />
                </span>
                <h3 className='text-white font-semibold'>Verification Notes</h3>
              </div>
              <ul className='space-y-3 text-sm text-gray-300'>
                <li className='flex items-start gap-2'>
                  <span className='mt-2'>
                    <img src='/Vector.svg' alt='' />
                  </span>
                  <span>All documents must be valid and not expired</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='mt-2'>
                    <img src='/Vector.svg' alt='' />
                  </span>
                  <span>Information must match your profile details</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='mt-2'>
                    <img src='/Vector.svg' alt='' />
                  </span>
                  <span>Documents must be clearly visible and complete</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='mt-2'>
                    <img src='/Vector.svg' alt='' />
                  </span>
                  <span>Files should be in color, not black and white</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Next Button */}
        <div className='flex justify-center md:justify-end mt-8 md:mt-12'>
          <button
            onClick={handleNext}
            className='w-full md:w-auto text-[#0B0D12] cursor-pointer font-semibold px-12 py-4 rounded-full transition-all text-base md:text-lg shadow-lg hover:shadow-xl transform hover:scale-105'
            style={{
              background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

// Reusable Document Upload Card Component
function DocumentUploadCard({
  title,
  description,
  status,
  onFileChange,
  acceptedFormats,
  buttonText,
  icon,
}) {
  const inputId = `file-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div
      className='rounded-2xl p-4 md:p-6'
      style={{
        background: 'rgba(30, 30, 35, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Header */}
      <div className='flex items-start justify-between mb-4'>
        <div className='flex items-center gap-2'>
          {icon === 'document' ? (
            <img
              src='/Clip path group.svg'
              alt='Document'
              className='w-5 h-5 md:w-6 md:h-6'
            />
          ) : (
            <img
              src='/camera.svg'
              alt='Camera'
              className='w-5 h-5 md:w-6 md:h-6'
            />
          )}
          <h3 className='text-white font-semibold text-base md:text-lg'>
            {title}
          </h3>
        </div>
        <span
          className={`text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1 ${
            status === 'added'
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              status === 'added' ? 'bg-green-400' : 'bg-red-400'
            }`}
          />
          {status === 'added' ? 'Added' : 'Pending'}
        </span>
      </div>

      <p className='text-gray-400 text-xs md:text-sm mb-4'>{description}</p>

      {/* Upload Area */}
      <div
        className='border-2 border-dashed border-gray-700 rounded-xl p-6 md:p-8 text-center hover:border-[#F1CB68] transition-colors cursor-pointer'
        onClick={() => document.getElementById(inputId).click()}
      >
        <div className='flex flex-col items-center'>
          <div className='w-12 h-12 bg-[#F1CB68]/20 rounded-full flex items-center justify-center mb-3'>
            <svg
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#F1CB68'
              strokeWidth='2'
            >
              <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
              <polyline points='17 8 12 3 7 8' />
              <line x1='12' y1='3' x2='12' y2='15' />
            </svg>
          </div>
          <p className='text-white text-sm md:text-base mb-1'>
            Drag & drop your file here, or click to browse
          </p>
          <p className='text-gray-500 text-xs'>{acceptedFormats}</p>
        </div>
        <input
          id={inputId}
          type='file'
          accept='image/*,.pdf'
          className='hidden'
          onChange={onFileChange}
        />
        {/* Upload Button */}
        <button
          onClick={() => document.getElementById(inputId).click()}
          className=' mt-4 bg-transparent border text-nowrap border-[#F1CB68] text-[#F1CB68] hover:bg-[#F1CB68] hover:text-[#0B0D12] font-medium w-auto px-5 py-2.5 rounded-lg transition-all text-sm md:text-base'
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
