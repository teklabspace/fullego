'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getKYCStatus, getKYCRejectionReason, resubmitKYC, startKYC, submitKYC, KYC_STATUS } from '@/utils/kycApi';
import { usePersonaVerification } from '@/components/verification/PersonaVerification';
import { toast } from 'react-toastify';

export default function KYCPage() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [kycStatus, setKycStatus] = useState(null);
  const [rejectionReason, setRejectionReason] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState('');
  const [verificationLevel, setVerificationLevel] = useState(null); // 'individual', 'family', '3rd'
  const [verificationType, setVerificationType] = useState(null); // 'kyc', 'kyb'
  const [showSelection, setShowSelection] = useState(false);
  const { startVerification } = usePersonaVerification();

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    setIsLoading(true);
    try {
      const status = await getKYCStatus();
      console.log('KYC Status:', status);
      setKycStatus(status);
      if (status.status === KYC_STATUS.REJECTED) {
        try {
          const reason = await getKYCRejectionReason();
          setRejectionReason(reason);
        } catch (err) {
          console.error('Failed to fetch rejection reason:', err);
        }
      }
    } catch (err) {
      if (err.status === 404) {
        setKycStatus({ status: KYC_STATUS.NOT_STARTED });
      } else {
        setError(err.data?.detail || 'Failed to fetch KYC status');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartKYC = async () => {
    // If no selection made, show selection UI
    if (!verificationLevel) {
      setShowSelection(true);
      return;
    }

    // Auto-determine verification type based on level
    let autoVerificationType = null;
    if (verificationLevel === 'institutional investor') {
      autoVerificationType = 'KYB';
    } else {
      autoVerificationType = 'KYC';
    }

    setIsStarting(true);
    setError('');
    try {
      let response = await startKYC(verificationLevel, autoVerificationType);
      console.log('KYC Started:', response);
      
      // Priority 1: If verification_url is available, redirect to Persona's hosted page
      if (response.verification_url) {
        console.log('Redirecting to Persona hosted verification:', response.verification_url);
        window.location.href = response.verification_url;
        return; // Don't set loading to false, we're redirecting
      }
      
      // If no persona_inquiry_id, try fetching status again (sometimes it takes a moment)
      if (!response.persona_inquiry_id) {
        console.log('No persona_inquiry_id in initial response, fetching status...');
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
        response = await getKYCStatus();
        console.log('KYC Status after retry:', response);
      }
      
      setKycStatus(response);
      if (response.verification_url) {
        // Redirect to Persona's hosted page
        window.location.href = response.verification_url;
      } else if (response.persona_inquiry_id) {
        launchPersonaFlow(response.persona_inquiry_id);
      } else {
        // If still no persona_inquiry_id or verification_url, redirect to kyc-verification page
        const errorMessage = 'Failed to initialize verification. Please try again.';
        router.push(`/kyc-verification?error=${encodeURIComponent(errorMessage)}`);
      }
    } catch (err) {
      console.error('Failed to start KYC:', err);
      const errorMessage = err.data?.detail || err.message || 'Failed to start verification';
      setError(errorMessage);
      setIsStarting(false);
      // Redirect to verification page with error
      router.push(`/kyc-verification?error=${encodeURIComponent(errorMessage)}`);
    }
  };

  const handleContinueKYC = async () => {
    setIsStarting(true);
    try {
      // Refresh status to get latest persona_inquiry_id
      const status = await getKYCStatus();
      setKycStatus(status);
      
      // Priority: Use verification_url if available (hosted flow)
      if (status.verification_url) {
        console.log('Redirecting to Persona hosted verification:', status.verification_url);
        window.location.href = status.verification_url;
        return;
      }
      
      if (status.persona_inquiry_id) {
        launchPersonaFlow(status.persona_inquiry_id);
      } else {
        // If no persona_inquiry_id, redirect to kyc-verification page
        const errorMessage = 'Failed to continue verification. Please try again.';
        router.push(`/kyc-verification?error=${encodeURIComponent(errorMessage)}`);
      }
    } catch (err) {
      console.error('Failed to continue KYC:', err);
      const errorMessage = err.data?.detail || err.message || 'Failed to continue verification';
      // Redirect to verification page with error
      router.push(`/kyc-verification?error=${encodeURIComponent(errorMessage)}`);
    }
  };

  const launchPersonaFlow = (inquiryId) => {
    console.log('Launching Persona with inquiry ID:', inquiryId);
    startVerification({
      inquiryId,
      onComplete: async ({ inquiryId, status, fields }) => {
        console.log('Persona completed:', { inquiryId, status, fields });
        try {
          await submitKYC();
          await fetchKYCStatus();
          // Show success toast
          toast.success('Verification completed successfully! Redirecting to dashboard...');
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);
        } catch (submitErr) {
          const errorMessage = submitErr.data?.detail || 'Failed to submit verification';
          setError(errorMessage);
          toast.error(errorMessage);
        } finally {
          setIsStarting(false);
          setIsResubmitting(false);
        }
      },
      onCancel: () => {
        const errorMessage = 'Verification cancelled. You can restart anytime.';
        setIsStarting(false);
        setIsResubmitting(false);
        toast.warning(errorMessage);
        // Redirect to verification page with error
        router.push(`/kyc-verification?error=${encodeURIComponent(errorMessage)}`);
      },
      onError: (err) => {
        const errorMessage = err?.message || 'Verification failed. Please try again.';
        setIsStarting(false);
        setIsResubmitting(false);
        toast.error(errorMessage);
        // Redirect to verification page with error
        router.push(`/kyc-verification?error=${encodeURIComponent(errorMessage)}`);
      },
    });
  };

  const handleResubmit = async () => {
    setIsResubmitting(true);
    setError('');
    try {
      let response = await resubmitKYC();
      setKycStatus(response);
      
      // Priority: Use verification_url if available (hosted flow)
      if (response.verification_url) {
        console.log('Redirecting to Persona hosted verification:', response.verification_url);
        window.location.href = response.verification_url;
        return;
      }
      
      // If no persona_inquiry_id, try fetching status again
      if (!response.persona_inquiry_id) {
        console.log('No persona_inquiry_id in resubmit response, fetching status...');
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
        response = await getKYCStatus();
        setKycStatus(response);
      }
      
      if (response.verification_url) {
        window.location.href = response.verification_url;
      } else if (response.persona_inquiry_id) {
        launchPersonaFlow(response.persona_inquiry_id);
      } else {
        // If still no persona_inquiry_id, redirect to kyc-verification page
        const errorMessage = 'Failed to resubmit verification. Please try again.';
        router.push(`/kyc-verification?error=${encodeURIComponent(errorMessage)}`);
      }
    } catch (err) {
      console.error('Failed to resubmit KYC:', err);
      const errorMessage = err.data?.detail || err.message || 'Failed to resubmit KYC';
      // Redirect to verification page with error
      router.push(`/kyc-verification?error=${encodeURIComponent(errorMessage)}`);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      [KYC_STATUS.NOT_STARTED]: { color: 'bg-gray-500', text: 'Not Started' },
      [KYC_STATUS.IN_PROGRESS]: { color: 'bg-yellow-500', text: 'In Progress' },
      [KYC_STATUS.PENDING_REVIEW]: { color: 'bg-blue-500', text: 'Pending Review' },
      [KYC_STATUS.APPROVED]: { color: 'bg-green-500', text: 'Approved' },
      [KYC_STATUS.REJECTED]: { color: 'bg-red-500', text: 'Rejected' },
      [KYC_STATUS.EXPIRED]: { color: 'bg-orange-500', text: 'Expired' },
    }[status] || { color: 'bg-gray-500', text: 'Unknown' };
    return <span className={`${config.color} text-white px-3 py-1 rounded-full text-sm font-medium`}>{config.text}</span>;
  };

  const Spinner = () => (
    <svg className='animate-spin h-5 w-5 inline mr-2' viewBox='0 0 24 24'>
      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' />
      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
    </svg>
  );

  const getTitle = () => {
    const titles = {
      [KYC_STATUS.APPROVED]: 'Verification Complete',
      [KYC_STATUS.REJECTED]: 'Verification Rejected',
      [KYC_STATUS.PENDING_REVIEW]: 'Verification Under Review',
      [KYC_STATUS.IN_PROGRESS]: 'Verification In Progress',
      [KYC_STATUS.NOT_STARTED]: 'Verify Your Identity',
      [KYC_STATUS.EXPIRED]: 'Verification Expired',
    };
    return titles[kycStatus?.status] || 'Verify Your Identity';
  };

  const getDescription = () => {
    const descriptions = {
      [KYC_STATUS.APPROVED]: 'Your identity has been verified. You now have full access to all features.',
      [KYC_STATUS.REJECTED]: 'Your verification was rejected. Please review the reason below and resubmit.',
      [KYC_STATUS.PENDING_REVIEW]: 'Your documents are being reviewed. This usually takes 1-2 business days.',
      [KYC_STATUS.IN_PROGRESS]: 'Please complete your verification process.',
      [KYC_STATUS.NOT_STARTED]: 'To ensure the security of your account, please complete your KYC verification.',
      [KYC_STATUS.EXPIRED]: 'Your verification has expired. Please restart the process.',
    };
    return descriptions[kycStatus?.status] || '';
  };

  return (
    <DashboardLayout>
      <div className='min-h-screen'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-white'>KYC Verification</h1>
          <p className='text-gray-400 mt-2'>Complete your identity verification to unlock all features</p>
        </div>
        {error && (
          <div className='mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm'>{error}</div>
        )}
        <div className='rounded-2xl p-8' style={{ background: 'linear-gradient(135deg, rgba(30, 30, 35, 0.8) 0%, rgba(20, 20, 25, 0.9) 100%)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          {isLoading ? (
            <div className='text-center py-12'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#F1CB68] mx-auto'></div>
              <p className='text-gray-400 mt-4'>Loading KYC status...</p>
            </div>
          ) : (
            <div className='max-w-2xl mx-auto text-center'>
              <div className='mb-6'>
                <Image src='/icons/user-check.svg' alt='KYC' width={64} height={64} className='mx-auto' style={{ filter: 'brightness(0) invert(1)' }} />
              </div>
              <div className='mb-4'>{kycStatus && getStatusBadge(kycStatus.status)}</div>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{getTitle()}</h2>
              <p className='text-gray-400 mb-6'>{getDescription()}</p>

              {kycStatus?.status === KYC_STATUS.REJECTED && rejectionReason && (
                <div className='mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-left'>
                  <h3 className='text-red-400 font-semibold mb-2'>Rejection Reason:</h3>
                  <p className='text-gray-300'>{rejectionReason.reason}</p>
                  {rejectionReason.persona_details && <p className='text-gray-400 text-sm mt-2'>{rejectionReason.persona_details}</p>}
                </div>
              )}
              {kycStatus?.verification_level && (
                <div className={`mb-6 ${kycStatus?.status === KYC_STATUS.APPROVED ? 'bg-green-500/10 border border-green-500/50 rounded-xl p-4' : 'text-gray-400'}`}>
                  <span className={kycStatus?.status === KYC_STATUS.APPROVED ? 'text-green-400 font-semibold' : ''}>
                    Verification Level: 
                  </span>
                  <span className={`${kycStatus?.status === KYC_STATUS.APPROVED ? 'text-white' : 'text-white'} font-medium capitalize ml-2`}>
                    {kycStatus.verification_level}
                  </span>
                </div>
              )}
              {kycStatus?.status === KYC_STATUS.NOT_STARTED && (
                <>
                  {showSelection ? (
                    <div className='mb-6 space-y-4'>
                      <div>
                        <label className='block text-white font-medium mb-2 text-left'>Select Verification Level:</label>
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
                        <div className='flex gap-2'>
                          <button
                            onClick={handleStartKYC}
                            disabled={isStarting}
                            className='flex-1 px-8 py-3 rounded-full text-base font-bold transition-all hover:opacity-90 cursor-pointer disabled:opacity-50'
                            style={{ background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)', color: '#000000' }}
                          >
                            {isStarting ? <><Spinner />Starting...</> : 'Start Verification'}
                          </button>
                          <button
                            onClick={() => {
                              setShowSelection(false);
                              setVerificationLevel(null);
                              setVerificationType(null);
                            }}
                            className='px-6 py-3 rounded-full text-base font-semibold transition-all bg-gray-700 text-gray-300 hover:bg-gray-600'
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button onClick={handleStartKYC} disabled={isStarting} className='px-8 py-3 rounded-full text-base font-bold transition-all hover:opacity-90 cursor-pointer disabled:opacity-50' style={{ background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)', color: '#000000' }}>
                      {isStarting ? <><Spinner />Starting...</> : 'Start Verification'}
                    </button>
                  )}
                </>
              )}
              {kycStatus?.status === KYC_STATUS.IN_PROGRESS && (
                <button onClick={handleContinueKYC} disabled={isStarting} className='px-8 py-3 rounded-full text-base font-bold transition-all hover:opacity-90 cursor-pointer disabled:opacity-50' style={{ background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)', color: '#000000' }}>
                  {isStarting ? <><Spinner />Loading...</> : 'Continue Verification'}
                </button>
              )}
              {kycStatus?.status === KYC_STATUS.REJECTED && (
                <button onClick={handleResubmit} disabled={isResubmitting} className='px-8 py-3 rounded-full text-base font-bold transition-all hover:opacity-90 cursor-pointer disabled:opacity-50' style={{ background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)', color: '#000000' }}>
                  {isResubmitting ? <><Spinner />Resubmitting...</> : 'Resubmit Verification'}
                </button>
              )}
              {kycStatus?.status === KYC_STATUS.EXPIRED && (
                <button onClick={handleResubmit} disabled={isResubmitting} className='px-8 py-3 rounded-full text-base font-bold transition-all hover:opacity-90 cursor-pointer disabled:opacity-50' style={{ background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)', color: '#000000' }}>
                  {isResubmitting ? <><Spinner />Restarting...</> : 'Restart Verification'}
                </button>
              )}
              <p className='text-gray-500 text-xs mt-6'>Powered by Persona. Your documents are securely processed and encrypted.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
