'use client';
import { useEffect, useRef, useCallback } from 'react';

/**
 * PersonaVerification Component
 * Embeds Persona's verification flow into the app
 * 
 * @param {string} inquiryId - The Persona inquiry ID from /kyc/start
 * @param {string} templateId - Optional template ID to create new inquiry
 * @param {function} onComplete - Callback when verification completes
 * @param {function} onCancel - Callback when user cancels
 * @param {function} onError - Callback when error occurs
 * @param {function} onReady - Callback when Persona is ready
 * @param {boolean} autoOpen - Whether to auto-open the flow (default: true)
 */
export default function PersonaVerification({
  inquiryId,
  templateId,
  onComplete,
  onCancel,
  onError,
  onReady,
  autoOpen = true,
}) {
  const clientRef = useRef(null);
  const isInitializedRef = useRef(false);

  const initPersona = useCallback(async () => {
    // Prevent double initialization
    if (isInitializedRef.current) return;
    
    // Persona only works in browser
    if (typeof window === 'undefined') return;

    // Need either inquiryId or templateId
    if (!inquiryId && !templateId) {
      console.error('[Persona] Either inquiryId or templateId is required');
      onError?.(new Error('Either inquiryId or templateId is required'));
      return;
    }

    try {
      // Dynamic import for client-side only
      const Persona = (await import('persona')).default;

      const config = {
        onReady: () => {
          console.log('[Persona] Client ready');
          onReady?.();
          if (autoOpen && clientRef.current) {
            clientRef.current.open();
          }
        },
        onComplete: ({ inquiryId, status, fields }) => {
          console.log('[Persona] Verification completed', {
            inquiryId,
            status,
            fields,
          });
          onComplete?.({ inquiryId, status, fields });
        },
        onCancel: ({ inquiryId, sessionToken }) => {
          console.log('[Persona] User cancelled', { inquiryId });
          onCancel?.({ inquiryId, sessionToken });
        },
        onError: (error) => {
          console.error('[Persona] Error', error);
          onError?.(error);
        },
      };

      // Add inquiryId or templateId based on what's provided
      if (inquiryId) {
        config.inquiryId = inquiryId;
      } else if (templateId) {
        config.templateId = templateId;
      }

      clientRef.current = new Persona.Client(config);
      isInitializedRef.current = true;

      console.log('[Persona] Client initialized', {
        inquiryId,
        templateId,
      });
    } catch (error) {
      console.error('[Persona] Failed to initialize', error);
      onError?.(error);
    }
  }, [inquiryId, templateId, onComplete, onCancel, onError, onReady, autoOpen]);

  useEffect(() => {
    initPersona();

    // Cleanup on unmount
    return () => {
      if (clientRef.current) {
        try {
          clientRef.current.destroy?.();
        } catch (e) {
          // Ignore cleanup errors
        }
        clientRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, [initPersona]);

  // Method to manually open the flow
  const open = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.open();
    } else {
      console.warn('[Persona] Client not initialized yet');
    }
  }, []);

  // This component doesn't render anything visible
  // Persona creates its own modal/iframe
  return null;
}

/**
 * Hook to use Persona verification imperatively
 */
export function usePersonaVerification() {
  const clientRef = useRef(null);

  const startVerification = useCallback(async ({
    inquiryId,
    templateId,
    onComplete,
    onCancel,
    onError,
  }) => {
    if (typeof window === 'undefined') return;

    try {
      const Persona = (await import('persona')).default;

      const config = {
        onReady: () => {
          console.log('[Persona] Client ready, opening...');
          clientRef.current?.open();
        },
        onComplete: ({ inquiryId, status, fields }) => {
          console.log('[Persona] Verification completed', { inquiryId, status, fields });
          onComplete?.({ inquiryId, status, fields });
        },
        onCancel: ({ inquiryId, sessionToken }) => {
          console.log('[Persona] User cancelled', { inquiryId });
          onCancel?.({ inquiryId, sessionToken });
        },
        onError: (error) => {
          console.error('[Persona] Error', error);
          onError?.(error);
        },
      };

      if (inquiryId) {
        config.inquiryId = inquiryId;
      } else if (templateId) {
        config.templateId = templateId;
      }

      clientRef.current = new Persona.Client(config);
    } catch (error) {
      console.error('[Persona] Failed to start verification', error);
      onError?.(error);
    }
  }, []);

  const cancelVerification = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.destroy?.();
      clientRef.current = null;
    }
  }, []);

  return { startVerification, cancelVerification };
}
