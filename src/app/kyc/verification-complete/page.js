'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getKYCStatus, syncKYCStatus, KYC_STATUS } from '@/utils/kycApi';
import { toast } from 'react-toastify';

export default function VerificationCompletePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('loading');
  const [kycData, setKycData] = useState(null);
  const [error, setError] = useState(null);
  const [pollCount, setPollCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    handleVerificationComplete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Poll backend status with retries
   * @param {number} maxRetries - Maximum number of polling attempts
   * @param {number} delay - Delay between attempts in milliseconds
   * @returns {Promise<Object|null>} KYC status or null if polling exhausted
   */
  const pollStatus = async (maxRetries = 5, delay = 2000) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        setPollCount(i + 1);
        const kycStatus = await getKYCStatus();
        console.log(`Status poll attempt ${i + 1}/${maxRetries}:`, kycStatus);
        
        // Update kycData with latest info
        setKycData(kycStatus);

        // Check if status has been updated by webhook
        // Backend status values: 'approved', 'rejected', 'pending_review', 'in_progress', 'not_started', 'expired'
        if (kycStatus.status === KYC_STATUS.APPROVED || 
            kycStatus.status === KYC_STATUS.REJECTED || 
            kycStatus.status === KYC_STATUS.PENDING_REVIEW) {
          return kycStatus;
        }

        // If not updated yet and we have retries left, wait and try again
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (err) {
        console.error(`Status poll attempt ${i + 1} failed:`, err);
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    return null;
  };

  const handleVerificationComplete = async () => {
    try {
      // Get query parameters from Persona redirect
      const inquiryId = searchParams.get('inquiry-id');
      const personaStatus = searchParams.get('status');
      const referenceId = searchParams.get('reference-id');

      console.log('Verification complete params:', {
        inquiryId,
        personaStatus,
        referenceId,
      });

      if (!inquiryId) {
        throw new Error('Missing inquiry ID');
      }

      // Handle Persona "completed" status
      // Note: Persona "completed" can mean approved, pending, or failed based on verification-status
      // Backend will check verification-status and map correctly
      if (personaStatus === 'completed') {
        console.log('Persona status is completed - checking backend for final status');
        
        // Poll backend immediately to get the actual status (backend checks verification-status)
        // Don't assume success - backend will tell us if it's approved, pending, or rejected
        setTimeout(async () => {
          try {
            // Try sync first to get latest status
            let kycStatus;
            try {
              kycStatus = await syncKYCStatus();
              console.log('Status synced:', kycStatus);
            } catch (syncErr) {
              console.warn('Sync failed, polling status instead:', syncErr);
              kycStatus = await pollStatus(3, 3000);
            }
            
            if (kycStatus) {
              setKycData(kycStatus);
              
              // Handle based on backend status (which checks verification-status from Persona)
              // Backend maps: approved → APPROVED, pending → PENDING_REVIEW, failed → REJECTED
              if (kycStatus.status === KYC_STATUS.APPROVED) {
                setStatus('success');
                toast.success('Verification approved successfully!');
              } else if (kycStatus.status === KYC_STATUS.PENDING_REVIEW) {
                setStatus('pending');
                toast.info('Verification is under manual review. This may take 1-2 business days.');
              } else if (kycStatus.status === KYC_STATUS.REJECTED) {
                setStatus('failed');
                // Backend saves rejection_reason from Persona's failure-reason
                const reason = kycStatus.rejection_reason || 'Verification was rejected. Please check the details.';
                toast.error(reason);
              } else if (kycStatus.status === KYC_STATUS.IN_PROGRESS) {
                // Still processing - show pending
                setStatus('pending');
                toast.info('Verification is still being processed...');
              }
            } else {
              // Polling exhausted - show optimistic success but keep polling
              setStatus('success');
              toast.info('Verification completed. Finalizing details...');
              // Try one more time to get status
              try {
                const finalStatus = await getKYCStatus();
                setKycData(finalStatus);
                if (finalStatus.status === KYC_STATUS.REJECTED) {
                  setStatus('failed');
                  if (finalStatus.rejection_reason) {
                    toast.error(finalStatus.rejection_reason);
                  }
                } else if (finalStatus.status === KYC_STATUS.PENDING_REVIEW) {
                  setStatus('pending');
                }
              } catch (err) {
                console.error('Failed to get final status:', err);
              }
            }
          } catch (pollError) {
            console.error('Error checking backend status:', pollError);
            // Show optimistic success since Persona said completed
            setStatus('success');
            toast.success('Verification completed!');
          }
        }, 1000);
        
        // Show loading while checking
        setStatus('loading');
        return;
      }
      
      // If Persona says "failed", show failure immediately
      if (personaStatus === 'failed') {
        console.log('Persona status is failed - showing failure immediately');
        setStatus('failed');
        
        // Poll backend to get rejection reason
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          const kycStatus = await syncKYCStatus(); // Use sync to get latest status with rejection reason
          if (kycStatus) {
            setKycData(kycStatus);
            if (kycStatus.rejection_reason) {
              toast.error(kycStatus.rejection_reason);
            }
          }
        } catch (syncErr) {
          // Fallback to polling
          const kycStatus = await pollStatus(3, 2000);
          if (kycStatus) {
            setKycData(kycStatus);
            if (kycStatus.rejection_reason) {
              toast.error(kycStatus.rejection_reason);
            }
          }
        }
        return;
      }

      // If Persona status is not completed/failed, poll backend to get current status
      // This handles cases where status might be missing or other values
      await new Promise(resolve => setTimeout(resolve, 1000)); // Initial wait
      
      const kycStatus = await pollStatus(5, 2000);

      if (!kycStatus) {
        // If polling failed, use Persona's URL status as fallback
        if (personaStatus === 'completed') {
          setStatus('success');
          // Still try to get status for display
          try {
            const status = await getKYCStatus();
            setKycData(status);
          } catch (err) {
            console.error('Failed to get final status:', err);
          }
        } else if (personaStatus === 'failed') {
          setStatus('failed');
        } else {
          setStatus('pending');
        }
        return;
      }

      // Determine final status from backend response
      // Backend has already mapped Persona statuses correctly
      if (kycStatus.status === KYC_STATUS.APPROVED) {
        setStatus('success');
      } else if (kycStatus.status === KYC_STATUS.REJECTED) {
        setStatus('failed');
        // Show rejection reason if available
        if (kycStatus.rejection_reason) {
          toast.error(kycStatus.rejection_reason);
        }
      } else if (kycStatus.status === KYC_STATUS.PENDING_REVIEW) {
        setStatus('pending');
        toast.info('Verification requires manual review. This may take 1-2 business days.');
      } else {
        // Still in progress - show pending
        setStatus('pending');
      }
    } catch (err) {
      console.error('Verification complete error:', err);
      const errorMessage = err.data?.detail || err.message || 'Failed to verify status';
      setError(errorMessage);
      setStatus('error');
    }
  };

  /**
   * Manual refresh status button handler
   */
  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    setPollCount(0);
    
    try {
      const kycStatus = await pollStatus(3, 2000); // Fewer retries for manual refresh
      
        if (kycStatus) {
          setKycData(kycStatus);
          
          if (kycStatus.status === KYC_STATUS.APPROVED) {
            setStatus('success');
          } else if (kycStatus.status === KYC_STATUS.REJECTED) {
            setStatus('failed');
            if (kycStatus.rejection_reason) {
              toast.error(kycStatus.rejection_reason);
            }
          } else if (kycStatus.status === KYC_STATUS.PENDING_REVIEW) {
            setStatus('pending');
            toast.info('Verification requires manual review.');
          } else {
            setStatus('pending');
          }
        }
    } catch (err) {
      console.error('Failed to refresh status:', err);
      setError('Failed to refresh status. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRetry = () => {
    // Redirect to start verification page with error
    const errorMessage = error || 'Verification could not be completed. Please try again.';
    router.push(`/kyc-verification?error=${encodeURIComponent(errorMessage)}`);
  };

  const handleContinue = () => {
    router.push('/dashboard');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard/kyc');
  };

  // Auto-redirect to dashboard after successful verification (if details are loaded or after timeout)
  useEffect(() => {
    if (status === 'success') {
      // If we have verification details, redirect immediately
      // Otherwise wait a bit for details to load, then redirect
      const redirectTimer = setTimeout(() => {
        console.log('Auto-redirecting to dashboard after successful verification');
        router.push('/dashboard');
      }, kycData?.verification_level ? 2000 : 5000); // 2s if details loaded, 5s otherwise

      return () => clearTimeout(redirectTimer);
    }
  }, [status, kycData, router]);

  if (status === 'loading') {
    return (
      <div className='min-h-screen bg-[#0B0D12] flex items-center justify-center relative overflow-hidden p-4 md:p-8'>
        <div className='relative z-10 w-full max-w-md mx-auto px-4 flex flex-col items-center'>
          <div className='text-center'>
            <div className='mb-6'>
              <svg className='animate-spin h-12 w-12 text-[#F1CB68] mx-auto' viewBox='0 0 24 24'>
                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' />
                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
              </svg>
            </div>
            <h2 className='text-white text-xl font-semibold mb-2'>
              Verifying your submission...
            </h2>
            <p className='text-gray-400 text-sm mb-2'>
              Please wait while we process your verification.
            </p>
            {pollCount > 0 && (
              <p className='text-gray-500 text-xs'>
                Checking status... (attempt {pollCount}/5)
              </p>
            )}
            <div className='mt-4 w-full max-w-xs mx-auto'>
              <div className='h-1 bg-gray-700 rounded-full overflow-hidden'>
                <div 
                  className='h-full bg-gradient-to-r from-[#F1CB68] to-[#FFFFFF] transition-all duration-500'
                  style={{ width: `${(pollCount / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className='min-h-screen bg-[#0B0D12] flex items-center justify-center relative overflow-hidden p-4 md:p-8'>
        <div className='relative z-10 w-full max-w-md mx-auto px-4 flex flex-col items-center'>
          <div className='w-full bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm mb-6'>
            <div className='mb-2'>
              <strong>Verification Error</strong>
            </div>
            <p className='mb-4'>{error || 'An error occurred while processing your verification.'}</p>
            <div className='flex gap-2'>
              <button
                onClick={handleRetry}
                className='flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-colors'
              >
                Try Again
              </button>
              <button
                onClick={handleGoToDashboard}
                className='flex-1 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 px-4 py-2 rounded-lg transition-colors'
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    // Check if status is actually approved (not just optimistic)
    const isActuallyApproved = kycData?.status === KYC_STATUS.APPROVED;
    
    return (
      <div className='min-h-screen bg-[#0B0D12] flex items-center justify-center relative overflow-hidden p-4 md:p-8'>
        <div className='relative z-10 w-full max-w-md mx-auto px-4 flex flex-col items-center'>
          <div className='text-center'>
            <div className='mb-6'>
              <div className='w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7' />
                </svg>
              </div>
            </div>
            <h2 className='text-white text-2xl font-bold mb-2'>
              Verification {isActuallyApproved ? 'Approved' : 'Completed'}!
            </h2>
            <p className='text-gray-400 mb-4'>
              {isActuallyApproved 
                ? 'Your identity has been verified and approved successfully.'
                : 'Your verification has been completed. Finalizing details...'}
            </p>
            {/* Verification Details */}
            <div className='bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6 w-full'>
              {kycData?.verification_level ? (
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-gray-400 text-sm'>Verification Level:</span>
                    <span className='text-white font-semibold capitalize'>{kycData.verification_level}</span>
                  </div>
                  {kycData?.verification_type && (
                    <div className='flex items-center justify-between'>
                      <span className='text-gray-400 text-sm'>Verification Type:</span>
                      <span className='text-[#F1CB68] font-semibold'>{kycData.verification_type}</span>
                    </div>
                  )}
                  {kycData?.verified_at ? (
                    <div className='flex items-center justify-between pt-2 border-t border-gray-700'>
                      <span className='text-gray-400 text-sm'>Verified on:</span>
                      <span className='text-gray-300 text-sm'>{new Date(kycData.verified_at).toLocaleString()}</span>
                    </div>
                  ) : (
                    <div className='pt-2 border-t border-gray-700'>
                      <p className='text-gray-500 text-xs italic text-center'>
                        Finalizing verification details...
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className='text-center py-2'>
                  <div className='flex items-center justify-center space-x-2'>
                    <svg className='animate-spin h-4 w-4 text-[#F1CB68]' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' />
                      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                    </svg>
                    <p className='text-gray-400 text-sm italic'>Loading verification details...</p>
                  </div>
                </div>
              )}
            </div>
            <div className='text-center'>
              <p className='text-gray-400 text-sm mb-4'>
                Redirecting to dashboard automatically...
              </p>
              <button
                onClick={handleContinue}
                className='text-[#0B0D12] cursor-pointer font-semibold px-8 py-3 rounded-full transition-all text-base shadow-lg hover:shadow-xl transform hover:scale-105'
                style={{
                  background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
                }}
              >
                Continue to Dashboard Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    const rejectionReason = kycData?.rejection_reason || 'Your verification could not be completed. Please try again or contact support.';
    
    return (
      <div className='min-h-screen bg-[#0B0D12] flex items-center justify-center relative overflow-hidden p-4 md:p-8'>
        <div className='relative z-10 w-full max-w-md mx-auto px-4 flex flex-col items-center'>
          <div className='text-center w-full'>
            <div className='mb-6'>
              <div className='w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                </svg>
              </div>
            </div>
            <h2 className='text-white text-2xl font-bold mb-2'>
              Verification Rejected
            </h2>
            {/* Rejection Reason Display */}
            <div className='bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6 text-left'>
              <h3 className='text-red-400 font-semibold mb-2'>Rejection Reason:</h3>
              <p className='text-gray-300 text-sm'>{rejectionReason}</p>
              {kycData?.persona_response && (
                <p className='text-gray-500 text-xs mt-2 italic'>
                  Full details have been saved for review.
                </p>
              )}
            </div>
            <p className='text-gray-400 mb-6'>
              Please review the reason above and resubmit your verification with corrected information.
            </p>
            <div className='flex flex-col sm:flex-row gap-2'>
              <button
                onClick={handleRetry}
                className='flex-1 text-[#0B0D12] cursor-pointer font-semibold px-6 py-3 rounded-full transition-all text-base shadow-lg hover:shadow-xl transform hover:scale-105'
                style={{
                  background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/support')}
                className='flex-1 bg-transparent border-2 border-[#F1CB68] text-[#F1CB68] font-semibold px-6 py-3 rounded-full transition-all hover:bg-[#F1CB68] hover:text-[#0B0D12]'
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pending state (pending_review or in_progress)
  const isPendingReview = kycData?.status === KYC_STATUS.PENDING_REVIEW;
  
  return (
    <div className='min-h-screen bg-[#0B0D12] flex items-center justify-center relative overflow-hidden p-4 md:p-8'>
      <div className='relative z-10 w-full max-w-md mx-auto px-4 flex flex-col items-center'>
        <div className='text-center w-full'>
          <div className='mb-6'>
            <div className={`w-16 h-16 ${isPendingReview ? 'bg-blue-500/20 border-2 border-blue-500/50' : 'bg-yellow-500/20 border-2 border-yellow-500/50'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <svg className={`w-8 h-8 ${isPendingReview ? 'text-blue-400' : 'text-yellow-400'} animate-pulse`} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
          </div>
          <h2 className='text-white text-2xl font-bold mb-2'>
            {isPendingReview ? 'Verification Under Review' : 'Verification Pending'}
          </h2>
          <p className='text-gray-400 mb-4'>
            {isPendingReview 
              ? 'Your verification requires manual review. This usually takes 1-2 business days. You will be notified once the review is complete.'
              : 'Your verification is being processed. This may take a few moments.'}
          </p>
          {kycData?.verification_level && (
            <div className='bg-gray-800/50 border border-gray-700 rounded-xl p-3 mb-6'>
              <p className='text-gray-300 text-sm'>
                <span className='text-gray-400'>Level:</span>{' '}
                <span className='font-semibold capitalize'>{kycData.verification_level}</span>
              </p>
            </div>
          )}
          <div className='flex flex-col sm:flex-row gap-2'>
            <button
              onClick={handleRefreshStatus}
              disabled={isRefreshing}
              className='flex-1 text-[#0B0D12] cursor-pointer font-semibold px-6 py-3 rounded-full transition-all text-base shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
              style={{
                background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
              }}
            >
              {isRefreshing ? (
                <span className='flex items-center justify-center'>
                  <svg className='animate-spin h-4 w-4 mr-2' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' />
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                  </svg>
                  Refreshing...
                </span>
              ) : (
                'Refresh Status'
              )}
            </button>
            <button
              onClick={handleGoToDashboard}
              className='flex-1 bg-transparent border-2 border-[#F1CB68] text-[#F1CB68] font-semibold px-6 py-3 rounded-full transition-all hover:bg-[#F1CB68] hover:text-[#0B0D12]'
            >
              Go to Dashboard
            </button>
          </div>
          <p className='text-gray-500 text-xs mt-4'>
            You can refresh this page or check back later.
          </p>
        </div>
      </div>
    </div>
  );
}
