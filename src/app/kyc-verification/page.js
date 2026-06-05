'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { getKYCStatus, submitKYC, KYC_STATUS } from '@/utils/kycApi';
import {
  getKycErrorMessage,
  getKycUserFacingError,
  handleKycStartResponse,
  isPersonaInquiryCreateDisabledError,
  startKycWithHostedFlowFirst,
  tryClientHostedPersonaFallback,
} from '@/utils/kycFlow';
import PersonaVerification from '@/components/verification/PersonaVerification';
import { toast } from 'react-toastify';

function KYCVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [inquiryId, setInquiryId] = useState(null);
  const [personaReady, setPersonaReady] = useState(false);
  const [verificationLevel, setVerificationLevel] = useState(null); // 'individual', 'family', '3rd'
  const [verificationType, setVerificationType] = useState(null); // 'kyc', 'kyb'
  const [showSelection, setShowSelection] = useState(false);

  // Check for error in URL params (from redirect)
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      setIsLoading(false);
    }
  }, [searchParams]);

  // Automatically start Persona verification when page loads
  useEffect(() => {
    // Don't initialize if there's an error from URL params
    if (searchParams.get('error')) {
      return;
    }

    const initVerification = async () => {
      setIsLoading(true);
      setError('');

      try {
        // Check for profile selection from choose-profile page
        const profileData = localStorage.getItem('profileSelection');
        let selectedProfile = null;
        if (profileData) {
          try {
            const parsed = JSON.parse(profileData);
            selectedProfile = parsed.selectedProfile;
            console.log('Profile selected from choose-profile:', selectedProfile);
          } catch (e) {
            console.error('Failed to parse profile selection:', e);
          }
        }

        // Map profile to verification level
        const profileToLevelMap = {
          'individual': 'individual',
          'family-office': 'family office',
          'institutional': 'institutional investor'
        };
        
        if (selectedProfile && profileToLevelMap[selectedProfile]) {
          const mappedLevel = profileToLevelMap[selectedProfile];
          setVerificationLevel(mappedLevel);
          // Auto-set verification type: institutional → KYB, others → KYC
          if (selectedProfile === 'institutional') {
            setVerificationType('KYB');
          } else {
            setVerificationType('KYC');
          }
        }

        // First check if KYC already exists
        let kycResponse;
        try {
          kycResponse = await getKYCStatus();
          console.log('Existing KYC Status:', kycResponse);
        } catch (err) {
          // If 404, show selection UI (or use profile if available)
          if (err.status === 404) {
            if (selectedProfile && profileToLevelMap[selectedProfile]) {
              const mappedLevel = profileToLevelMap[selectedProfile];
              const autoType =
                selectedProfile === 'institutional' ? 'KYB' : 'KYC';
              const started = await startKycWithHostedFlowFirst({
                verificationLevel: mappedLevel,
                verificationType: autoType,
                onEmbeddedInquiryId: id => {
                  setInquiryId(id);
                  setIsLoading(false);
                },
              });
              if (started.outcome === 'redirected' || started.outcome === 'approved') {
                if (started.outcome === 'approved') router.push('/dashboard');
                return;
              }
              kycResponse = started.data;
            } else {
              // Show selection UI
              setShowSelection(true);
              setIsLoading(false);
              return;
            }
          } else {
            throw err;
          }
        }

        const applyResponse = response => {
          if (response?.status === KYC_STATUS.APPROVED) {
            router.push('/dashboard');
            return 'done';
          }
          return handleKycStartResponse(response, {
            onEmbeddedInquiryId: id => {
              setInquiryId(id);
              setIsLoading(false);
            },
          });
        };

        // Use existing hosted URL from GET /kyc/status before POST /kyc/start
        let flow = applyResponse(kycResponse);
        if (flow === 'done' || flow === 'redirected' || flow === 'embedded') return;

        const needsStart =
          kycResponse.status === KYC_STATUS.NOT_STARTED ||
          (kycResponse.status === KYC_STATUS.IN_PROGRESS &&
            !kycResponse.verification_url);

        if (needsStart) {
          if (selectedProfile && profileToLevelMap[selectedProfile]) {
            const mappedLevel = profileToLevelMap[selectedProfile];
            const autoType =
              selectedProfile === 'institutional' ? 'KYB' : 'KYC';
            const started = await startKycWithHostedFlowFirst({
              verificationLevel: mappedLevel,
              verificationType: autoType,
              onEmbeddedInquiryId: id => {
                setInquiryId(id);
                setIsLoading(false);
              },
            });
            if (started.outcome === 'approved') {
              router.push('/dashboard');
              return;
            }
            if (started.outcome === 'redirected' || started.outcome === 'embedded') {
              return;
            }
            kycResponse = started.data;
            flow = applyResponse(kycResponse);
            if (flow === 'done' || flow === 'redirected' || flow === 'embedded') {
              return;
            }
          } else if (kycResponse.status === KYC_STATUS.NOT_STARTED) {
            setShowSelection(true);
            setIsLoading(false);
            return;
          }
        }

        setShowSelection(true);
        setIsLoading(false);
      } catch (err) {
        if (isPersonaInquiryCreateDisabledError(err) && tryClientHostedPersonaFallback()) {
          return;
        }
        if (!isPersonaInquiryCreateDisabledError(err)) {
          console.error('Failed to start KYC:', err);
        }
        setError(getKycUserFacingError(err));
        setIsLoading(false);
      }
    };

    initVerification();
  }, [router, searchParams]);

  const handlePersonaComplete = async ({ inquiryId, status, fields }) => {
    console.log('Persona verification completed:', { inquiryId, status, fields });
    
    try {
      // Submit KYC to backend after Persona completes
      const submitResponse = await submitKYC();
      console.log('KYC Submitted:', submitResponse);
      
      // Show success toast
      toast.success('Verification completed successfully! Redirecting to dashboard...');
      
      // Small delay to show toast, then redirect directly to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (submitErr) {
      console.error('Failed to submit KYC:', submitErr);
      const errorMessage = submitErr.data?.detail || submitErr.message || 'Failed to submit verification';
      toast.error(errorMessage);
      // Redirect to start verification page with error
      router.push(`/kyc-verification?error=${encodeURIComponent(errorMessage)}`);
    }
  };

  const handlePersonaCancel = ({ inquiryId }) => {
    console.log('User cancelled Persona verification');
    const errorMessage = 'Verification cancelled. You can restart anytime.';
    // Redirect to start verification page with error
    router.push(`/kyc-verification?error=${encodeURIComponent(errorMessage)}`);
  };

  const handlePersonaError = (err) => {
    console.error('Persona error:', err);
    const errorMessage = err?.message || 'Verification failed. Please try again.';
    // Redirect to start verification page with error
    router.push(`/kyc-verification?error=${encodeURIComponent(errorMessage)}`);
  };

  const handlePersonaReady = () => {
    console.log('Persona is ready');
    setPersonaReady(true);
    setIsLoading(false);
  };

  const handleStartWithSelection = async () => {
    // Auto-determine verification type based on level
    let autoVerificationType = null;
    if (verificationLevel === 'institutional investor') {
      autoVerificationType = 'KYB';
    } else {
      autoVerificationType = 'KYC';
    }

    if (!verificationLevel) {
      setError('Please select verification level');
      return;
    }

    setIsLoading(true);
    setError('');
    setShowSelection(false);

    try {
      const started = await startKycWithHostedFlowFirst({
        verificationLevel,
        verificationType: autoVerificationType,
        onEmbeddedInquiryId: id => {
          setInquiryId(id);
          setIsLoading(false);
        },
      });

      if (started.outcome === 'approved') {
        router.push('/dashboard');
        return;
      }
      if (started.outcome === 'redirected' || started.outcome === 'embedded') {
        return;
      }

      setError(getKycErrorMessage(started.data));
      setIsLoading(false);
    } catch (err) {
      if (isPersonaInquiryCreateDisabledError(err) && tryClientHostedPersonaFallback()) {
        return;
      }
      if (!isPersonaInquiryCreateDisabledError(err)) {
        console.error('Failed to start KYC:', err);
      }
      setError(getKycUserFacingError(err));
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Persona Verification Component - Opens automatically when inquiryId is set */}
      {inquiryId && (
        <PersonaVerification
          inquiryId={inquiryId}
          onComplete={handlePersonaComplete}
          onCancel={handlePersonaCancel}
          onError={handlePersonaError}
          onReady={handlePersonaReady}
          autoOpen={true}
        />
      )}

      {/* Minimal loading/error state - Persona will open its own modal */}
      <div className='min-h-screen bg-[#0B0D12] flex items-center justify-center relative overflow-hidden p-4 md:p-8'>
        <div className='relative z-10 w-full max-w-md mx-auto px-4 flex flex-col items-center'>
          {isLoading && !error && (
            <div className='text-center'>
              <div className='mb-6'>
                <svg className='animate-spin h-12 w-12 text-[#F1CB68] mx-auto' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' />
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                </svg>
              </div>
              <h2 className='text-white text-xl font-semibold mb-2'>
                Starting Verification
              </h2>
              <p className='text-gray-400 text-sm'>
                Please wait while we prepare your verification...
              </p>
            </div>
          )}

          {/* Selection UI */}
          {showSelection && !error && (
            <div className='w-full max-w-md space-y-4'>
              <h2 className='text-white text-xl font-semibold mb-4 text-center'>
                Select Verification Options
              </h2>
              <div>
                <label className='block text-white font-medium mb-2 text-left'>Verification Level:</label>
                <div className='grid grid-cols-3 gap-2'>
                  {['individual', 'family office', 'institutional investor'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setVerificationLevel(level)}
                      className={`px-4 py-2 rounded-lg transition-all text-sm ${
                        verificationLevel === level
                          ? 'bg-[#F1CB68] text-[#0B0D12] font-semibold'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {level === 'family office' ? 'Family Office' : level === 'institutional investor' ? 'Institutional' : 'Individual'}
                    </button>
                  ))}
                </div>
              </div>
              {verificationLevel && (
                <div className='mb-4 p-3 bg-blue-500/10 border border-blue-500/50 rounded-lg'>
                  <p className='text-blue-300 text-sm'>
                    <strong>Verification Type:</strong>{' '}
                    {verificationLevel === 'institutional investor' ? 'KYB (Know Your Business)' : 'KYC (Know Your Customer)'}
                  </p>
                  <p className='text-gray-400 text-xs mt-1'>
                    {verificationLevel === 'institutional investor' 
                      ? 'Institutional investors require business verification (KYB)'
                      : 'Individual and Family Office require customer verification (KYC)'}
                  </p>
                </div>
              )}
              {verificationLevel && (
                <div className='flex gap-2 pt-2'>
                  <button
                    onClick={handleStartWithSelection}
                    disabled={isLoading}
                    className='flex-1 px-8 py-3 rounded-full text-base font-bold transition-all hover:opacity-90 cursor-pointer disabled:opacity-50'
                    style={{ background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)', color: '#000000' }}
                  >
                    {isLoading ? 'Starting...' : 'Start Verification'}
                  </button>
                  <button
                    onClick={() => {
                      setShowSelection(false);
                      setVerificationLevel(null);
                      setVerificationType(null);
                      router.push('/dashboard/kyc');
                    }}
                    className='px-6 py-3 rounded-full text-base font-semibold transition-all bg-gray-700 text-gray-300 hover:bg-gray-600'
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className='w-full bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm mb-6'>
              <div className='mb-2'>
                <strong>Error:</strong> {error}
              </div>
              <div className='flex gap-2 mt-4'>
                <button 
                  onClick={() => {
                    // Clear error from URL and reload
                    router.push('/kyc-verification');
                    window.location.reload();
                  }}
                  className='flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-colors'
                >
                  Try Again
                </button>
                <button 
                  onClick={() => router.push('/dashboard/kyc')}
                  className='flex-1 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 px-4 py-2 rounded-lg transition-colors'
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}

          {/* Info text - Only show when Persona is ready or if there's no error */}
          {!error && (personaReady || inquiryId) && (
            <p className='text-gray-500 text-xs mt-4 text-center max-w-md'>
              Powered by Persona. Your documents are securely processed and encrypted.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default function KYCVerificationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <KYCVerificationContent />
    </Suspense>
  );
}
