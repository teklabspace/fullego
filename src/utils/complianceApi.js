/**
 * Compliance Center API Service
 * Handles all compliance-related API calls
 */

import { API_ENDPOINTS } from '@/config/api';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/client';

/**
 * Transform snake_case keys to camelCase
 */
const transformKeys = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(transformKeys);
  
  const transformed = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    transformed[camelKey] = transformKeys(value);
  }
  return transformed;
};

// ==================== Dashboard APIs ====================

/**
 * Get Compliance Dashboard Summary
 * GET /api/v1/compliance/dashboard
 */
export const getComplianceDashboard = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.dateFrom) queryParams.append('date_from', params.dateFrom);
  if (params.dateTo) queryParams.append('date_to', params.dateTo);
  if (params.entityId) queryParams.append('entity_id', params.entityId);

  const endpoint = `${API_ENDPOINTS.COMPLIANCE.DASHBOARD}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  return transformKeys(response);
};

// ==================== Task APIs ====================

/**
 * List Compliance Tasks
 * GET /api/v1/compliance/tasks
 */
export const listComplianceTasks = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.append('status', params.status);
  if (params.assigneeId) queryParams.append('assignee_id', params.assigneeId);
  if (params.dueDateFrom) queryParams.append('due_date_from', params.dueDateFrom);
  if (params.dueDateTo) queryParams.append('due_date_to', params.dueDateTo);
  if (params.priority) queryParams.append('priority', params.priority);
  if (params.entityId) queryParams.append('entity_id', params.entityId);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.offset) queryParams.append('offset', params.offset);

  const endpoint = `${API_ENDPOINTS.COMPLIANCE.TASKS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  return transformKeys(response);
};

/**
 * Get Compliance Task Details
 * GET /api/v1/compliance/tasks/{task_id}
 */
export const getComplianceTask = async (taskId) => {
  const endpoint = API_ENDPOINTS.COMPLIANCE.GET_TASK(taskId);
  const response = await apiGet(endpoint);
  return transformKeys(response);
};

/**
 * Create Compliance Task
 * POST /api/v1/compliance/tasks
 */
export const createComplianceTask = async (taskData) => {
  const endpoint = API_ENDPOINTS.COMPLIANCE.CREATE_TASK;
  const requestBody = {
    task_name: taskData.taskName,
    description: taskData.description,
    assignee_id: taskData.assigneeId,
    due_date: taskData.dueDate,
    priority: taskData.priority,
    entity_id: taskData.entityId,
    category: taskData.category,
    related_document_ids: taskData.relatedDocumentIds || [],
  };
  const response = await apiPost(endpoint, requestBody);
  return transformKeys(response);
};

/**
 * Update Compliance Task
 * PATCH /api/v1/compliance/tasks/{task_id}
 */
export const updateComplianceTask = async (taskId, taskData) => {
  const endpoint = API_ENDPOINTS.COMPLIANCE.UPDATE_TASK(taskId);
  const requestBody = {};
  if (taskData.status !== undefined) requestBody.status = taskData.status;
  if (taskData.assigneeId !== undefined) requestBody.assignee_id = taskData.assigneeId;
  if (taskData.dueDate !== undefined) requestBody.due_date = taskData.dueDate;
  if (taskData.priority !== undefined) requestBody.priority = taskData.priority;
  if (taskData.taskName !== undefined) requestBody.task_name = taskData.taskName;
  if (taskData.description !== undefined) requestBody.description = taskData.description;

  const response = await apiPatch(endpoint, requestBody);
  return transformKeys(response);
};

/**
 * Reassign Compliance Task
 * POST /api/v1/compliance/tasks/{task_id}/reassign
 */
export const reassignComplianceTask = async (taskId, data) => {
  const endpoint = API_ENDPOINTS.COMPLIANCE.REASSIGN_TASK(taskId);
  const requestBody = {
    assignee_id: data.assigneeId,
    notes: data.notes,
  };
  const response = await apiPost(endpoint, requestBody);
  return transformKeys(response);
};

/**
 * Mark Task as Completed
 * POST /api/v1/compliance/tasks/{task_id}/complete
 */
export const completeComplianceTask = async (taskId, data = {}) => {
  const endpoint = API_ENDPOINTS.COMPLIANCE.COMPLETE_TASK(taskId);
  const requestBody = {
    completion_notes: data.completionNotes,
    completed_at: data.completedAt,
  };
  const response = await apiPost(endpoint, requestBody);
  return transformKeys(response);
};

/**
 * Delete Compliance Task
 * DELETE /api/v1/compliance/tasks/{task_id}
 */
export const deleteComplianceTask = async (taskId) => {
  const endpoint = API_ENDPOINTS.COMPLIANCE.DELETE_TASK(taskId);
  const response = await apiDelete(endpoint);
  return transformKeys(response);
};

// ==================== Audit APIs ====================

/**
 * List Compliance Audits
 * GET /api/v1/compliance/audits
 */
export const listComplianceAudits = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.append('status', params.status);
  if (params.auditType) queryParams.append('audit_type', params.auditType);
  if (params.entityId) queryParams.append('entity_id', params.entityId);
  if (params.dateFrom) queryParams.append('date_from', params.dateFrom);
  if (params.dateTo) queryParams.append('date_to', params.dateTo);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.offset) queryParams.append('offset', params.offset);

  const endpoint = `${API_ENDPOINTS.COMPLIANCE.AUDITS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  return transformKeys(response);
};

/**
 * Get Compliance Audit Details
 * GET /api/v1/compliance/audits/{audit_id}
 */
export const getComplianceAudit = async (auditId) => {
  const endpoint = API_ENDPOINTS.COMPLIANCE.GET_AUDIT(auditId);
  const response = await apiGet(endpoint);
  return transformKeys(response);
};

/**
 * Create Compliance Audit
 * POST /api/v1/compliance/audits
 */
export const createComplianceAudit = async (auditData) => {
  const endpoint = API_ENDPOINTS.COMPLIANCE.CREATE_AUDIT;
  const requestBody = {
    audit_name: auditData.auditName,
    audit_type: auditData.auditType,
    scheduled_date: auditData.scheduledDate,
    due_date: auditData.dueDate,
    entity_id: auditData.entityId,
    auditor_id: auditData.auditorId,
    scope: auditData.scope || [],
    description: auditData.description,
  };
  const response = await apiPost(endpoint, requestBody);
  return transformKeys(response);
};

/**
 * Update Compliance Audit
 * PATCH /api/v1/compliance/audits/{audit_id}
 */
export const updateComplianceAudit = async (auditId, auditData) => {
  const endpoint = API_ENDPOINTS.COMPLIANCE.UPDATE_AUDIT(auditId);
  const requestBody = {};
  if (auditData.status !== undefined) requestBody.status = auditData.status;
  if (auditData.scheduledDate !== undefined) requestBody.scheduled_date = auditData.scheduledDate;
  if (auditData.dueDate !== undefined) requestBody.due_date = auditData.dueDate;
  if (auditData.auditName !== undefined) requestBody.audit_name = auditData.auditName;
  if (auditData.description !== undefined) requestBody.description = auditData.description;
  if (auditData.scope !== undefined) requestBody.scope = auditData.scope;

  const response = await apiPatch(endpoint, requestBody);
  return transformKeys(response);
};

// ==================== Alert APIs ====================

/**
 * List Compliance Alerts
 * GET /api/v1/compliance/alerts
 */
export const listComplianceAlerts = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.severity) queryParams.append('severity', params.severity);
  if (params.status) queryParams.append('status', params.status);
  if (params.alertType) queryParams.append('alert_type', params.alertType);
  if (params.entityId) queryParams.append('entity_id', params.entityId);
  if (params.dateFrom) queryParams.append('date_from', params.dateFrom);
  if (params.dateTo) queryParams.append('date_to', params.dateTo);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.offset) queryParams.append('offset', params.offset);

  const endpoint = `${API_ENDPOINTS.COMPLIANCE.ALERTS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  return transformKeys(response);
};

/**
 * Get Compliance Alert Details
 * GET /api/v1/compliance/alerts/{alert_id}
 */
export const getComplianceAlert = async (alertId) => {
  const endpoint = API_ENDPOINTS.COMPLIANCE.GET_ALERT(alertId);
  const response = await apiGet(endpoint);
  return transformKeys(response);
};

/**
 * Acknowledge Compliance Alert
 * POST /api/v1/compliance/alerts/{alert_id}/acknowledge
 */
export const acknowledgeComplianceAlert = async (alertId, data = {}) => {
  const endpoint = API_ENDPOINTS.COMPLIANCE.ACKNOWLEDGE_ALERT(alertId);
  const requestBody = {
    notes: data.notes,
  };
  const response = await apiPost(endpoint, requestBody);
  return transformKeys(response);
};

/**
 * Resolve Compliance Alert
 * POST /api/v1/compliance/alerts/{alert_id}/resolve
 */
export const resolveComplianceAlert = async (alertId, data = {}) => {
  const endpoint = API_ENDPOINTS.COMPLIANCE.RESOLVE_ALERT(alertId);
  const requestBody = {
    resolution_notes: data.resolutionNotes,
    resolved_at: data.resolvedAt,
  };
  const response = await apiPost(endpoint, requestBody);
  return transformKeys(response);
};

// ==================== Score & Metrics APIs ====================

/**
 * Get Compliance Score History
 * GET /api/v1/compliance/score/history
 */
export const getComplianceScoreHistory = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.dateFrom) queryParams.append('date_from', params.dateFrom);
  if (params.dateTo) queryParams.append('date_to', params.dateTo);
  if (params.entityId) queryParams.append('entity_id', params.entityId);
  if (params.granularity) queryParams.append('granularity', params.granularity);

  const endpoint = `${API_ENDPOINTS.COMPLIANCE.SCORE_HISTORY}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  return transformKeys(response);
};

/**
 * Get Compliance Metrics by Category
 * GET /api/v1/compliance/metrics
 */
export const getComplianceMetrics = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.entityId) queryParams.append('entity_id', params.entityId);

  const endpoint = `${API_ENDPOINTS.COMPLIANCE.METRICS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  return transformKeys(response);
};

// ==================== Report APIs ====================

/**
 * Generate Compliance Report
 * POST /api/v1/compliance/reports/generate
 */
export const generateComplianceReport = async (reportData) => {
  const endpoint = API_ENDPOINTS.COMPLIANCE.GENERATE_REPORT;
  const requestBody = {
    report_type: reportData.reportType,
    date_from: reportData.dateFrom,
    date_to: reportData.dateTo,
    entity_id: reportData.entityId,
    include_sections: reportData.includeSections || [],
    format: reportData.format || 'pdf',
  };
  const response = await apiPost(endpoint, requestBody);
  return transformKeys(response);
};

/**
 * Get Report Status
 * GET /api/v1/compliance/reports/{report_id}
 */
export const getComplianceReport = async (reportId) => {
  const endpoint = API_ENDPOINTS.COMPLIANCE.GET_REPORT(reportId);
  const response = await apiGet(endpoint);
  return transformKeys(response);
};

/**
 * Download Compliance Report
 * GET /api/v1/compliance/reports/{report_id}/download
 */
export const downloadComplianceReport = async (reportId) => {
  const endpoint = API_ENDPOINTS.COMPLIANCE.DOWNLOAD_REPORT(reportId);
  // This will return a blob/file, so we need to handle it differently
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/v1${endpoint}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to download report');
  }
  
  const blob = await response.blob();
  return blob;
};

// ==================== Policy APIs ====================

/**
 * List Compliance Policies
 * GET /api/v1/compliance/policies
 */
export const listCompliancePolicies = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.category) queryParams.append('category', params.category);
  if (params.status) queryParams.append('status', params.status);
  if (params.entityId) queryParams.append('entity_id', params.entityId);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.offset) queryParams.append('offset', params.offset);

  const endpoint = `${API_ENDPOINTS.COMPLIANCE.POLICIES}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiGet(endpoint);
  return transformKeys(response);
};

/**
 * Get Compliance Policy Details
 * GET /api/v1/compliance/policies/{policy_id}
 */
export const getCompliancePolicy = async (policyId) => {
  const endpoint = API_ENDPOINTS.COMPLIANCE.GET_POLICY(policyId);
  const response = await apiGet(endpoint);
  return transformKeys(response);
};

/**
 * Upload Compliance Policy
 * POST /api/v1/compliance/policies
 */
export const createCompliancePolicy = async (policyData) => {
  const endpoint = API_ENDPOINTS.COMPLIANCE.CREATE_POLICY;
  
  // Handle file upload with FormData
  const formData = new FormData();
  if (policyData.file) formData.append('file', policyData.file);
  formData.append('policy_name', policyData.policyName);
  formData.append('category', policyData.category);
  formData.append('version', policyData.version);
  formData.append('effective_date', policyData.effectiveDate);
  if (policyData.expiryDate) formData.append('expiry_date', policyData.expiryDate);
  if (policyData.entityId) formData.append('entity_id', policyData.entityId);
  if (policyData.description) formData.append('description', policyData.description);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/v1${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to upload policy');
  }

  const data = await response.json();
  return transformKeys(data);
};
