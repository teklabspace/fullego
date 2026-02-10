/**
 * Entity Structure API Service
 * Handles all entity structure-related API calls
 */

import { API_ENDPOINTS, API_BASE_URL, API_BASE_PATH } from '@/config/api';
import { apiGet, apiPost, apiPut, apiPatch, apiDelete, getDefaultHeaders } from '@/lib/api/client';

/**
 * Transform snake_case object keys to camelCase
 */
const snakeToCamel = (str) => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Recursively transform object keys from snake_case to camelCase
 */
const transformKeys = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(transformKeys);
  }
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const transformed = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = snakeToCamel(key);
      transformed[camelKey] = transformKeys(value);
    }
    return transformed;
  }
  return obj;
};

/**
 * 1. List Entities
 * GET /api/v1/entities
 */
export const listEntities = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.append('status', params.status);
  if (params.type) queryParams.append('type', params.type);
  if (params.jurisdiction) queryParams.append('jurisdiction', params.jurisdiction);
  if (params.search) queryParams.append('search', params.search);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.offset) queryParams.append('offset', params.offset);

  const endpoint = `${API_ENDPOINTS.ENTITIES.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  return transformKeys(response);
};

/**
 * 2. Get Entity Details
 * GET /api/v1/entities/{entity_id}
 */
export const getEntity = async (entityId) => {
  const endpoint = API_ENDPOINTS.ENTITIES.GET_ENTITY(entityId);
  const response = await apiGet(endpoint);
  return transformKeys(response);
};

/**
 * 3. Create Entity
 * POST /api/v1/entities
 */
export const createEntity = async (entityData) => {
  const endpoint = API_ENDPOINTS.ENTITIES.CREATE;
  const response = await apiPost(endpoint, {
    name: entityData.name,
    entity_type: entityData.entityType,
    jurisdiction: entityData.jurisdiction,
    location: entityData.location,
    registration_number: entityData.registrationNumber,
    formation_date: entityData.formationDate,
    parent_entity_id: entityData.parentEntityId,
    description: entityData.description,
  });
  return transformKeys(response);
};

/**
 * 4. Update Entity
 * PUT /api/v1/entities/{entity_id}
 */
export const updateEntity = async (entityId, entityData) => {
  const endpoint = API_ENDPOINTS.ENTITIES.UPDATE(entityId);
  const response = await apiPut(endpoint, {
    name: entityData.name,
    location: entityData.location,
    status: entityData.status,
    registration_number: entityData.registrationNumber,
    formation_date: entityData.formationDate,
  });
  return transformKeys(response);
};

/**
 * 5. Delete Entity
 * DELETE /api/v1/entities/{entity_id}
 */
export const deleteEntity = async (entityId) => {
  const endpoint = API_ENDPOINTS.ENTITIES.DELETE(entityId);
  const response = await apiDelete(endpoint);
  return transformKeys(response);
};

/**
 * 6. List Entity Types
 * GET /api/v1/entities/types
 */
export const listEntityTypes = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.jurisdiction) queryParams.append('jurisdiction', params.jurisdiction);

  const endpoint = `${API_ENDPOINTS.ENTITIES.TYPES}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  return transformKeys(response);
};

/**
 * 7. Get Entity Type Details
 * GET /api/v1/entities/types/{type_id}
 */
export const getEntityType = async (typeId) => {
  const endpoint = API_ENDPOINTS.ENTITIES.GET_TYPE(typeId);
  const response = await apiGet(endpoint);
  return transformKeys(response);
};

/**
 * 8. Get Entity Hierarchy
 * GET /api/v1/entities/{entity_id}/hierarchy
 */
export const getEntityHierarchy = async (entityId) => {
  const endpoint = API_ENDPOINTS.ENTITIES.HIERARCHY(entityId);
  const response = await apiGet(endpoint);
  return transformKeys(response);
};

/**
 * 9. Add Child Entity
 * POST /api/v1/entities/{entity_id}/children
 */
export const addChildEntity = async (entityId, childData) => {
  const endpoint = API_ENDPOINTS.ENTITIES.ADD_CHILD(entityId);
  const response = await apiPost(endpoint, {
    name: childData.name,
    entity_type: childData.entityType,
    jurisdiction: childData.jurisdiction,
    registration_number: childData.registrationNumber,
  });
  return transformKeys(response);
};

/**
 * 10. Update Entity Relationship
 * PATCH /api/v1/entities/{entity_id}/parent
 */
export const updateEntityRelationship = async (entityId, parentEntityId) => {
  const endpoint = API_ENDPOINTS.ENTITIES.UPDATE_PARENT(entityId);
  const response = await apiPatch(endpoint, {
    parent_entity_id: parentEntityId,
  });
  return transformKeys(response);
};

/**
 * 11. Get Compliance Status
 * GET /api/v1/entities/{entity_id}/compliance
 */
export const getComplianceStatus = async (entityId) => {
  const endpoint = API_ENDPOINTS.ENTITIES.COMPLIANCE(entityId);
  const response = await apiGet(endpoint);
  return transformKeys(response);
};

/**
 * 12. Update Compliance Status
 * PATCH /api/v1/entities/{entity_id}/compliance
 */
export const updateComplianceStatus = async (entityId, complianceData) => {
  const endpoint = API_ENDPOINTS.ENTITIES.UPDATE_COMPLIANCE(entityId);
  const response = await apiPatch(endpoint, {
    kyc_aml_status: complianceData.kycAmlStatus,
    fatca_crs_compliance: complianceData.fatcaCrsCompliance,
    registered_agent: complianceData.registeredAgent,
    tax_residency: complianceData.taxResidency,
  });
  return transformKeys(response);
};

/**
 * 13. Download Compliance Package
 * GET /api/v1/entities/{entity_id}/compliance-package
 */
export const downloadCompliancePackage = async (entityId, format = 'zip') => {
  const endpoint = `${API_ENDPOINTS.ENTITIES.COMPLIANCE_PACKAGE(entityId)}?format=${format}`;
  const response = await apiGet(endpoint, { responseType: 'blob' });
  return response;
};

/**
 * 14. List People & Roles
 * GET /api/v1/entities/{entity_id}/people
 */
export const listPeople = async (entityId, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.role) queryParams.append('role', params.role);

  const endpoint = `${API_ENDPOINTS.ENTITIES.PEOPLE(entityId)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  return transformKeys(response);
};

/**
 * 15. Add Person to Entity
 * POST /api/v1/entities/{entity_id}/people
 */
export const addPerson = async (entityId, personData) => {
  const endpoint = API_ENDPOINTS.ENTITIES.ADD_PERSON(entityId);
  const response = await apiPost(endpoint, {
    name: personData.name,
    role: personData.role,
    email: personData.email,
    phone: personData.phone,
    notes: personData.notes,
  });
  return transformKeys(response);
};

/**
 * 16. Update Person Role
 * PATCH /api/v1/entities/{entity_id}/people/{person_id}
 */
export const updatePerson = async (entityId, personId, personData) => {
  const endpoint = API_ENDPOINTS.ENTITIES.UPDATE_PERSON(entityId, personId);
  const response = await apiPatch(endpoint, {
    role: personData.role,
    name: personData.name,
    email: personData.email,
    phone: personData.phone,
  });
  return transformKeys(response);
};

/**
 * 17. Remove Person from Entity
 * DELETE /api/v1/entities/{entity_id}/people/{person_id}
 */
export const removePerson = async (entityId, personId) => {
  const endpoint = API_ENDPOINTS.ENTITIES.DELETE_PERSON(entityId, personId);
  const response = await apiDelete(endpoint);
  return transformKeys(response);
};

/**
 * 18. Get Audit Trail
 * GET /api/v1/entities/{entity_id}/audit-trail
 */
export const getAuditTrail = async (entityId, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.action) queryParams.append('action', params.action);
  if (params.user) queryParams.append('user', params.user);
  if (params.dateFrom) queryParams.append('date_from', params.dateFrom);
  if (params.dateTo) queryParams.append('date_to', params.dateTo);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.offset) queryParams.append('offset', params.offset);

  const endpoint = `${API_ENDPOINTS.ENTITIES.AUDIT_TRAIL(entityId)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  return transformKeys(response);
};

/**
 * 19. Add Audit Trail Entry
 * POST /api/v1/entities/{entity_id}/audit-trail
 */
export const addAuditTrailEntry = async (entityId, entryData) => {
  const endpoint = API_ENDPOINTS.ENTITIES.ADD_AUDIT_ENTRY(entityId);
  const response = await apiPost(endpoint, {
    action: entryData.action,
    notes: entryData.notes,
    document_id: entryData.documentId,
    metadata: entryData.metadata,
  });
  return transformKeys(response);
};

/**
 * 20. Update Audit Trail Entry
 * PATCH /api/v1/entities/{entity_id}/audit-trail/{entry_id}
 */
export const updateAuditTrailEntry = async (entityId, entryId, entryData) => {
  const endpoint = API_ENDPOINTS.ENTITIES.UPDATE_AUDIT_ENTRY(entityId, entryId);
  const response = await apiPatch(endpoint, {
    notes: entryData.notes,
  });
  return transformKeys(response);
};

/**
 * 21. Delete Audit Trail Entry
 * DELETE /api/v1/entities/{entity_id}/audit-trail/{entry_id}
 */
export const deleteAuditTrailEntry = async (entityId, entryId) => {
  const endpoint = API_ENDPOINTS.ENTITIES.DELETE_AUDIT_ENTRY(entityId, entryId);
  const response = await apiDelete(endpoint);
  return transformKeys(response);
};

/**
 * 22. List Entity Documents
 * GET /api/v1/entities/{entity_id}/documents
 */
export const listDocuments = async (entityId, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.documentType) queryParams.append('document_type', params.documentType);
  if (params.status) queryParams.append('status', params.status);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.offset) queryParams.append('offset', params.offset);

  const endpoint = `${API_ENDPOINTS.ENTITIES.DOCUMENTS(entityId)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  return transformKeys(response);
};

/**
 * 23. Upload Entity Document
 * POST /api/v1/entities/{entity_id}/documents
 */
export const uploadDocument = async (entityId, file, documentData = {}) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (documentData.documentType) formData.append('document_type', documentData.documentType);
    if (documentData.description) formData.append('description', documentData.description);
    if (documentData.notes) formData.append('notes', documentData.notes);

    const endpoint = API_ENDPOINTS.ENTITIES.UPLOAD_DOCUMENT(entityId);
    const url = `${API_BASE_URL.replace(/\/$/, '')}/${API_BASE_PATH.replace(/^\//, '')}${endpoint}`;
    const headers = getDefaultHeaders();
    delete headers['Content-Type']; // Let browser set boundary for FormData

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.detail || 'Document upload failed');
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    const data = await response.json();
    return transformKeys(data);
  } catch (error) {
    console.error('Failed to upload document:', error);
    throw error;
  }
};

/**
 * 24. Get Document Details
 * GET /api/v1/entities/{entity_id}/documents/{document_id}
 */
export const getDocument = async (entityId, documentId) => {
  const endpoint = API_ENDPOINTS.ENTITIES.GET_DOCUMENT(entityId, documentId);
  const response = await apiGet(endpoint);
  return transformKeys(response);
};

/**
 * 25. Download Document
 * GET /api/v1/entities/{entity_id}/documents/{document_id}/download
 */
export const downloadDocument = async (entityId, documentId) => {
  const endpoint = API_ENDPOINTS.ENTITIES.DOWNLOAD_DOCUMENT(entityId, documentId);
  const response = await apiGet(endpoint, { responseType: 'blob' });
  return response;
};

/**
 * 26. Update Document Status
 * PATCH /api/v1/entities/{entity_id}/documents/{document_id}/status
 */
export const updateDocumentStatus = async (entityId, documentId, statusData) => {
  const endpoint = API_ENDPOINTS.ENTITIES.UPDATE_DOCUMENT_STATUS(entityId, documentId);
  const response = await apiPatch(endpoint, {
    status: statusData.status,
    notes: statusData.notes,
  });
  return transformKeys(response);
};

/**
 * 27. Delete Document
 * DELETE /api/v1/entities/{entity_id}/documents/{document_id}
 */
export const deleteDocument = async (entityId, documentId) => {
  const endpoint = API_ENDPOINTS.ENTITIES.DELETE_DOCUMENT(entityId, documentId);
  const response = await apiDelete(endpoint);
  return transformKeys(response);
};
