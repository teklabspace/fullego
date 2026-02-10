/**
 * KYC/KYB API Service
 * Handles all KYC and KYB verification-related API calls with comprehensive logging
 */

import { API_ENDPOINTS, API_BASE_URL, API_BASE_PATH } from '@/config/api';
import { apiGet, apiPost, apiLogger, getDefaultHeaders } from '@/lib/api/client';

/**
 * Logger utility for API calls (aliased for consistency)
 */
const logger = apiLogger;

// ==================== KYC APIs ====================

/**
 * 1. Start KYC Verification
 * POST /api/v1/kyc/start
 * Initiates KYC verification process with Persona
 * @param {string} verificationLevel - 'individual', 'family office', or 'institutional investor'
 * @param {string} verificationType - 'KYC' or 'KYB' (auto-determined: KYC for individual/family, KYB for institutional)
 */
export const startKYC = async (verificationLevel = null, verificationType = null) => {
  try {
    logger.info('Starting KYC verification', {
      verificationLevel,
      verificationType,
    });
    
    const requestBody = {};
    if (verificationLevel) {
      requestBody.verification_level = verificationLevel;
    }
    if (verificationType) {
      requestBody.verification_type = verificationType;
    }
    
    const response = await apiPost(API_ENDPOINTS.KYC.START, Object.keys(requestBody).length > 0 ? requestBody : undefined);

    logger.success('KYC verification started successfully', {
      status: response.status,
      personaInquiryId: response.persona_inquiry_id,
      verificationLevel: response.verification_level,
    });

    return response;
  } catch (error) {
    logger.error('Failed to start KYC verification', {
      error: error.message,
      status: error.status,
    });
    throw error;
  }
};

/**
 * 2. Get KYC Status
 * GET /api/v1/kyc/status
 * Returns current KYC verification status
 */
export const getKYCStatus = async () => {
  try {
    logger.info('Fetching KYC status');
    const response = await apiGet(API_ENDPOINTS.KYC.STATUS);

    logger.success('KYC status fetched successfully', {
      status: response.status,
      verificationLevel: response.verification_level,
    });

    return response;
  } catch (error) {
    logger.error('Failed to fetch KYC status', {
      error: error.message,
      status: error.status,
    });
    throw error;
  }
};

/**
 * 3. Submit KYC
 * POST /api/v1/kyc/submit
 * Submits KYC inquiry to Persona for review
 */
export const submitKYC = async () => {
  try {
    logger.info('Submitting KYC for review');
    const response = await apiPost(API_ENDPOINTS.KYC.SUBMIT);

    logger.success('KYC submitted successfully', {
      message: response.message,
      status: response.status,
    });

    return response;
  } catch (error) {
    logger.error('Failed to submit KYC', {
      error: error.message,
      status: error.status,
    });
    throw error;
  }
};

/**
 * 4. Upload KYC Document
 * POST /api/v1/kyc/upload-document
 * Uploads document for KYC verification (multipart/form-data)
 */
export const uploadKYCDocument = async (file) => {
  try {
    logger.info('Uploading KYC document', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    const formData = new FormData();
    formData.append('file', file);

    const url = `${API_BASE_URL}${API_BASE_PATH}${API_ENDPOINTS.KYC.UPLOAD_DOCUMENT}`;
    const headers = getDefaultHeaders();
    // Remove Content-Type for FormData (browser sets it automatically with boundary)
    delete headers['Content-Type'];

    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    const duration = Date.now() - startTime;
    const responseData = await response.json();

    if (!response.ok) {
      logger.error(`KYC document upload failed (${response.status}) - ${duration}ms`, {
        error: responseData,
      });
      const error = new Error(responseData.detail || 'Document upload failed');
      error.status = response.status;
      error.data = responseData;
      throw error;
    }

    logger.success(`KYC document uploaded successfully - ${duration}ms`, {
      filePath: responseData.file_path,
    });

    return responseData;
  } catch (error) {
    logger.error('Failed to upload KYC document', {
      error: error.message,
      status: error.status,
    });
    throw error;
  }
};

/**
 * 5. List KYC Documents
 * GET /api/v1/kyc/documents
 * Lists all KYC documents
 */
export const getKYCDocuments = async () => {
  try {
    logger.info('Fetching KYC documents');
    const response = await apiGet(API_ENDPOINTS.KYC.DOCUMENTS);

    logger.success('KYC documents fetched successfully', {
      localDocumentsCount: response.local_documents?.length || 0,
      personaDocumentsCount: response.persona_documents?.length || 0,
    });

    return response;
  } catch (error) {
    logger.error('Failed to fetch KYC documents', {
      error: error.message,
      status: error.status,
    });
    throw error;
  }
};

/**
 * 6. Resubmit KYC
 * POST /api/v1/kyc/resubmit
 * Resubmits rejected KYC verification
 */
export const resubmitKYC = async () => {
  try {
    logger.info('Resubmitting KYC verification');
    const response = await apiPost(API_ENDPOINTS.KYC.RESUBMIT);

    logger.success('KYC resubmitted successfully', {
      status: response.status,
      personaInquiryId: response.persona_inquiry_id,
    });

    return response;
  } catch (error) {
    logger.error('Failed to resubmit KYC', {
      error: error.message,
      status: error.status,
    });
    throw error;
  }
};

/**
 * 7. Get KYC Rejection Reason
 * GET /api/v1/kyc/rejection-reason
 * Gets detailed rejection reason for failed KYC
 */
export const getKYCRejectionReason = async () => {
  try {
    logger.info('Fetching KYC rejection reason');
    const response = await apiGet(API_ENDPOINTS.KYC.REJECTION_REASON);

    logger.success('KYC rejection reason fetched successfully', {
      reason: response.reason,
      status: response.status,
    });

    return response;
  } catch (error) {
    logger.error('Failed to fetch KYC rejection reason', {
      error: error.message,
      status: error.status,
    });
    throw error;
  }
};

/**
 * 8. Sync KYC Status
 * POST /api/v1/kyc/sync-status
 * Manually syncs KYC status with Persona API
 * Useful for debugging or forcing a status refresh
 */
export const syncKYCStatus = async () => {
  try {
    logger.info('Syncing KYC status with Persona API');
    const response = await apiPost(API_ENDPOINTS.KYC.SYNC_STATUS);

    logger.success('KYC status synced successfully', {
      status: response.status,
      verificationLevel: response.verification_level,
      verifiedAt: response.verified_at,
    });

    return response;
  } catch (error) {
    logger.error('Failed to sync KYC status', {
      error: error.message,
      status: error.status,
    });
    throw error;
  }
};

// ==================== KYB APIs ====================

/**
 * 1. Start KYB Verification
 * POST /api/v1/kyb/start
 * Initiates KYB verification for business accounts
 */
export const startKYB = async (businessData) => {
  try {
    logger.info('Starting KYB verification', {
      businessName: businessData.business_name,
    });

    const response = await apiPost(API_ENDPOINTS.KYB.START, {
      business_name: businessData.business_name,
      business_registration_number: businessData.business_registration_number,
      business_address: businessData.business_address,
    });

    logger.success('KYB verification started successfully', {
      status: response.status,
      verificationType: response.verification_type,
    });

    return response;
  } catch (error) {
    logger.error('Failed to start KYB verification', {
      error: error.message,
      status: error.status,
    });
    throw error;
  }
};

/**
 * 2. Get KYB Status
 * GET /api/v1/kyb/status
 * Returns current KYB verification status
 */
export const getKYBStatus = async () => {
  try {
    logger.info('Fetching KYB status');
    const response = await apiGet(API_ENDPOINTS.KYB.STATUS);

    logger.success('KYB status fetched successfully', {
      status: response.status,
      businessName: response.business_name,
      documentsSubmitted: response.documents_submitted,
    });

    return response;
  } catch (error) {
    logger.error('Failed to fetch KYB status', {
      error: error.message,
      status: error.status,
    });
    throw error;
  }
};

/**
 * 3. Upload KYB Document
 * POST /api/v1/kyb/upload-document
 * Uploads business verification document (multipart/form-data)
 */
export const uploadKYBDocument = async (file, documentType) => {
  try {
    logger.info('Uploading KYB document', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      documentType,
    });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);

    const url = `${API_BASE_URL}${API_BASE_PATH}${API_ENDPOINTS.KYB.UPLOAD_DOCUMENT}`;
    const headers = getDefaultHeaders();
    // Remove Content-Type for FormData (browser sets it automatically with boundary)
    delete headers['Content-Type'];

    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    const duration = Date.now() - startTime;
    const responseData = await response.json();

    if (!response.ok) {
      logger.error(`KYB document upload failed (${response.status}) - ${duration}ms`, {
        error: responseData,
      });
      const error = new Error(responseData.detail || 'Document upload failed');
      error.status = response.status;
      error.data = responseData;
      throw error;
    }

    logger.success(`KYB document uploaded successfully - ${duration}ms`, {
      documentId: responseData.document_id,
    });

    return responseData;
  } catch (error) {
    logger.error('Failed to upload KYB document', {
      error: error.message,
      status: error.status,
    });
    throw error;
  }
};

/**
 * 4. Submit KYB
 * POST /api/v1/kyb/submit
 * Submits KYB verification for review
 */
export const submitKYB = async () => {
  try {
    logger.info('Submitting KYB for review');
    const response = await apiPost(API_ENDPOINTS.KYB.SUBMIT);

    logger.success('KYB submitted successfully', {
      message: response.message,
      status: response.status,
    });

    return response;
  } catch (error) {
    logger.error('Failed to submit KYB', {
      error: error.message,
      status: error.status,
    });
    throw error;
  }
};

// ==================== KYC Status Constants ====================

/**
 * KYC Status Constants
 * These match the backend enum values (lowercase with underscores)
 * Backend maps Persona statuses:
 * - approved → 'approved'
 * - pending → 'pending_review'  
 * - failed → 'rejected'
 * - processing → 'in_progress'
 */
export const KYC_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
};

export const KYB_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  PENDING_REVIEW: 'PENDING_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
};
