'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import VerificationLayout from '@/components/verification/VerificationLayout';
import GradientButton from '@/components/ui/GradientButton';
import OutlineButton from '@/components/ui/OutlineButton';
import { VERIFICATION_STEPS, STORAGE_KEYS } from '@/constants/verification';
import { saveToStorage, getFromStorage, removeFromStorage } from '@/utils/storage';

export default function IdentityVerificationPageRefactored() {
  const router = useRouter();
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleUploadPhoto = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);

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
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
          const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' });
          setPhoto(file);

          const reader = new FileReader();
          reader.onloadend = () => setPhotoPreview(reader.result);
          reader.readAsDataURL(file);

          console.log('Photo Captured:', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            capturedAt: new Date().toISOString(),
          });

          stream.getTracks().forEach((track) => track.stop());
        }, 'image/jpeg');
      };
    } catch (error) {
      console.error('Camera access error:', error);
      alert('Unable to access camera. Please use Upload Photo instead.');
    }
  };

  const handleCompleteVerification = () => {
    const step1Data = getFromStorage(STORAGE_KEYS.PROFILE_SELECTION);
    const step2Data = getFromStorage(STORAGE_KEYS.DOCUMENTS_DATA);

    const allStepsData = {
      step1_profileSelection: step1Data,
      step2_documents: step2Data,
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
    console.log('Step 1 - Profile Selection:', allStepsData.step1_profileSelection);
    console.log('Step 2 - Documents:', allStepsData.step2_documents);
    console.log('Step 3 - Identity Photo:', allStepsData.step3_identityPhoto);
    console.log('Complete Data Object:', allStepsData);

    // Clear storage
    removeFromStorage(STORAGE_KEYS.PROFILE_SELECTION);
    removeFromStorage(STORAGE_KEYS.DOCUMENTS_DATA);

    router.push('/verification-success');
  };

  return (
    <VerificationLayout
      steps={VERIFICATION_STEPS}
      currentStep={3}
      showBackButton
      onBack={() => router.back()}
    >
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
        <CaptureArea photoPreview={photoPreview} />

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center mb-8'>
          {!photo ? (
            <>
              <OutlineButton onClick={handleCapturePhoto} className='flex items-center justify-center gap-2'>
                <CameraIcon />
                Capture Photo
              </OutlineButton>
              <OutlineButton onClick={() => fileInputRef.current?.click()} className='flex items-center justify-center gap-2'>
                <UploadIcon />
                Upload Photo
              </OutlineButton>
            </>
          ) : (
            <GradientButton onClick={handleCompleteVerification}>
              Complete Verification
            </GradientButton>
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
    </VerificationLayout>
  );
}

// Sub-components
function CaptureArea({ photoPreview }) {
  return (
    <div className='mb-8'>
      <div
        className='relative w-full max-w-md mx-auto aspect-square rounded-3xl flex items-center justify-center overflow-hidden border-2 border-akunuba-gold bg-akunuba-cardDark'
      >
        {photoPreview ? (
          <img src={photoPreview} alt='Captured selfie' className='w-full h-full object-cover' />
        ) : (
          <>
            <div className='absolute w-3/4 h-3/4 rounded-full border-2 border-dashed border-white/30' />
            <div className='flex flex-col items-center justify-center z-10'>
              <div className='w-16 h-16 md:w-20 md:h-20 bg-akunuba-gold rounded-2xl flex items-center justify-center mb-4'>
                <CameraIcon className='text-akunuba-dark' size={32} />
              </div>
              <p className='text-white text-sm md:text-base font-medium'>
                Position your face here
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CameraIcon({ className = '', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}>
      <path d='M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z' />
      <circle cx='12' cy='13' r='4' />
    </svg>
  );
}

function UploadIcon({ className = '', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className={className}>
      <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
      <polyline points='17 8 12 3 7 8' />
      <line x1='12' y1='3' x2='12' y2='15' />
    </svg>
  );
}

