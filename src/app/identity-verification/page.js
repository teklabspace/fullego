'use client';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

const steps = [
  { id: 1, title: 'Account Setup', status: 'completed' },
  { id: 2, title: 'Document Verification', status: 'completed' },
  { id: 3, title: 'Identity Confirmation', status: 'active' },
  { id: 4, title: 'Complete', status: 'pending' },
];

export default function IdentityVerificationPage() {
  const router = useRouter();
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleUploadPhoto = event => {
    const file = event.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Log to console
      console.log('Identity Photo Uploaded:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: new Date().toISOString(),
      });
      console.log('Uploaded File Object:', file);
    }
  };

  const handleCapturePhoto = async () => {
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      // Create a video element to capture the photo
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Wait for video to be ready
      video.onloadedmetadata = () => {
        // Create canvas to capture the frame
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        // Draw the current video frame to canvas
        ctx.drawImage(video, 0, 0);
        
        // Convert canvas to blob
        canvas.toBlob(blob => {
          const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' });
          
          // Set the photo state
          setPhoto(file);
          
          // Create preview URL
          const reader = new FileReader();
          reader.onloadend = () => {
            setPhotoPreview(reader.result);
          };
          reader.readAsDataURL(file);
          
          // Log to console
          console.log('Photo Captured:', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            capturedAt: new Date().toISOString(),
          });
          console.log('Captured File Object:', file);
          
          // Stop camera stream
          stream.getTracks().forEach(track => track.stop());
        }, 'image/jpeg');
      };
    } catch (error) {
      console.error('Camera access error:', error);
      alert('Unable to access camera. Please use Upload Photo instead or check camera permissions.');
    }
  };

  const handleCompleteVerification = () => {
    // Collect all steps data from localStorage
    const step1Data = localStorage.getItem('profileSelection');
    const step2Data = localStorage.getItem('documentsData');

    const allStepsData = {
      step1_profileSelection: step1Data ? JSON.parse(step1Data) : null,
      step2_documents: step2Data ? JSON.parse(step2Data) : null,
      step3_identityPhoto: {
        photoUploaded: !!photo,
        photoDetails: photo
          ? {
              name: photo.name,
              size: photo.size,
              type: photo.type,
            }
          : null,
        timestamp: new Date().toISOString(),
      },
    };

    console.log('=== ALL VERIFICATION STEPS DATA ===');
    console.log(
      'Step 1 - Profile Selection:',
      allStepsData.step1_profileSelection
    );
    console.log('Step 2 - Documents:', allStepsData.step2_documents);
    console.log('Step 3 - Identity Photo:', allStepsData.step3_identityPhoto);
    console.log('===================================');
    console.log('Complete Data Object:', allStepsData);

    // Clear localStorage after collecting data
    localStorage.removeItem('profileSelection');
    localStorage.removeItem('documentsData');

    // Navigate to verification success page
    router.push('/verification-success');
  };

  return (
    <div className='min-h-screen bg-[#0B0D12] text-white'>
      {/* Header with Logo and Stepper */}
      <div className='border-b border-gray-800'>
        {/* Logo */}
        <div className='max-w-7xl mx-auto px-4 md:px-8 py-6'>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => router.back()}
              className='mr-4 text-white hover:text-gray-300 transition-colors'
            >
              <svg
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <path d='M19 12H5M12 19l-7-7 7-7' />
              </svg>
            </button>
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
                    className={`text-sm text-center ${
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
      <div className='max-w-2xl mx-auto px-4 md:px-8 py-8 md:py-12'>
        {/* Page Title */}
        <div className='text-center mb-8 md:mb-12'>
          <h1 className='text-2xl md:text-3xl lg:text-4xl font-bold mb-2'>
            Identity Verification
          </h1>
          <p className='text-gray-400 text-sm md:text-base'>
            Take a selfie to complete your verification
          </p>
        </div>

        {/* Camera/Upload Area */}
        <div className='mb-8'>
          <div
            className='relative w-full max-w-md mx-auto aspect-square rounded-3xl flex items-center justify-center overflow-hidden'
            style={{
              background: 'rgba(30, 30, 35, 0.6)',
              border: '2px solid #F1CB68',
            }}
          >
            {photoPreview ? (
              <img
                src={photoPreview}
                alt='Captured selfie'
                className='w-full h-full object-cover'
              />
            ) : (
              <>
                {/* Dotted Circle Guide */}
                <div
                  className='absolute w-3/4 h-3/4 rounded-full'
                  style={{
                    border: '2px dashed rgba(255, 255, 255, 0.3)',
                  }}
                />

                {/* Camera Icon and Text */}
                <div className='flex flex-col items-center justify-center z-10'>
                  <div className='w-16 h-16 md:w-20 md:h-20 bg-[#F1CB68] rounded-2xl flex items-center justify-center mb-4'>
                    <svg
                      width='32'
                      height='32'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#0B0D12'
                      strokeWidth='2'
                    >
                      <path d='M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z' />
                      <circle cx='12' cy='13' r='4' />
                    </svg>
                  </div>
                  <p className='text-white text-sm md:text-base font-medium'>
                    Position your face here
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center mb-8'>
          {!photo ? (
            <>
              {/* Show Capture and Upload buttons when no photo */}
              <button
                onClick={handleCapturePhoto}
                className='flex items-center justify-center gap-2 bg-white text-[#0B0D12] font-semibold px-6 md:px-8 py-3 rounded-lg transition-all hover:bg-gray-100 text-sm md:text-base'
              >
                <svg
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                >
                  <path d='M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z' />
                  <circle cx='12' cy='13' r='4' />
                </svg>
                Capture Photo
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className='flex items-center justify-center gap-2 bg-transparent border-2 border-[#F1CB68] text-[#F1CB68] font-semibold px-6 md:px-8 py-3 rounded-lg transition-all hover:bg-[#F1CB68] hover:text-[#0B0D12] text-sm md:text-base'
              >
                <svg
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                >
                  <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                  <polyline points='17 8 12 3 7 8' />
                  <line x1='12' y1='3' x2='12' y2='15' />
                </svg>
                Upload Photo
              </button>
            </>
          ) : (
            /* Show Complete Verification button when photo exists */
            <button
              onClick={handleCompleteVerification}
              className='w-full sm:w-auto text-[#0B0D12] cursor-pointer font-semibold px-8 md:px-12 py-3 md:py-4 rounded-full transition-all text-base md:text-lg shadow-lg hover:shadow-xl transform hover:scale-105'
              style={{
                background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
              }}
            >
              Complete Verification
            </button>
          )}

          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            className='hidden'
            onChange={handleUploadPhoto}
          />
        </div>
      </div>
    </div>
  );
}
