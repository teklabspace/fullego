'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useTheme } from '@/context/ThemeContext';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import {
  listEntities,
  getEntity,
  listEntityTypes,
  getEntityHierarchy,
  getComplianceStatus,
  listPeople,
  getAuditTrail,
  addAuditTrailEntry,
  deleteAuditTrailEntry,
  downloadCompliancePackage,
  uploadDocument,
  addPerson,
  removePerson,
} from '@/utils/entityApi';
import { toast } from 'react-toastify';

export default function EntityStructurePage() {
  const { isDarkMode } = useTheme();
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [activeTab, setActiveTab] = useState('people'); // 'people' or 'audit'
  const [manageMenuOpen, setManageMenuOpen] = useState(null);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingEntity, setLoadingEntity] = useState(false);
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [loadingAudit, setLoadingAudit] = useState(false);
  
  // Data states
  const [entities, setEntities] = useState([]);
  const [entityTypes, setEntityTypes] = useState([]);
  const [complianceStatus, setComplianceStatus] = useState([]);
  const [people, setPeople] = useState([]);
  const [auditTrailEntries, setAuditTrailEntries] = useState([]);
  const [hierarchy, setHierarchy] = useState(null);
  
  // Form states
  const [noteText, setNoteText] = useState('');
  const [uploadingDocument, setUploadingDocument] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch entities list
        const entitiesResponse = await listEntities({ limit: 100 });
        const entitiesList = entitiesResponse.data || entitiesResponse || [];
        setEntities(entitiesList);
        
        // Select first entity if available
        if (entitiesList.length > 0) {
          const firstEntity = entitiesList[0];
          setSelectedEntityId(firstEntity.id);
          setSelectedEntity(firstEntity);
        }
        
        // Fetch entity types (optional - may fail if backend route is misconfigured)
        try {
          const typesResponse = await listEntityTypes();
          const typesList = typesResponse.data || typesResponse || [];
          setEntityTypes(typesList);
        } catch (typesError) {
          // Silently handle entity types error - this is a backend routing issue
          // where /entities/types is being caught by /entities/{entity_id} route
          console.warn('Failed to fetch entity types (this is expected if backend route is misconfigured):', typesError);
          setEntityTypes([]);
        }
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        toast.error('Failed to load entity data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch entity details when selected entity changes
  useEffect(() => {
    const fetchEntityDetails = async () => {
      if (!selectedEntityId) return;

      try {
        setLoadingEntity(true);
        
        const [entityResponse, complianceResponse, hierarchyResponse] = await Promise.allSettled([
          getEntity(selectedEntityId),
          getComplianceStatus(selectedEntityId),
          getEntityHierarchy(selectedEntityId),
        ]);

        if (entityResponse.status === 'fulfilled') {
          const entityData = entityResponse.value.data || entityResponse.value;
          setSelectedEntity(entityData);
        }

        if (complianceResponse.status === 'fulfilled') {
          const compliance = complianceResponse.value.data || complianceResponse.value;
          // Transform compliance data to match UI format
          const complianceList = [
            { label: 'KYC/AML Status', value: compliance.kycAmlStatus || 'Pending', color: getStatusColor(compliance.kycAmlStatus) },
            { label: 'Registered Agent', value: compliance.registeredAgent || 'Not Verified', color: compliance.registeredAgent === 'verified' ? 'text-green-400' : 'text-red-400' },
            { label: 'Tax Residency', value: compliance.taxResidency || 'N/A', color: 'text-gray-400' },
            { label: 'FATCA/CRS Compliance', value: compliance.fatcaCrsCompliance || 'Not Compliant', color: compliance.fatcaCrsCompliance === 'compliant' ? 'text-green-400' : 'text-gray-400' },
          ];
          setComplianceStatus(complianceList);
        }

        if (hierarchyResponse.status === 'fulfilled') {
          const hierarchyData = hierarchyResponse.value.data || hierarchyResponse.value;
          setHierarchy(hierarchyData);
        }
      } catch (error) {
        console.error('Failed to fetch entity details:', error);
        toast.error('Failed to load entity details.');
      } finally {
        setLoadingEntity(false);
      }
    };

    fetchEntityDetails();
  }, [selectedEntityId]);

  // Fetch people when people tab is active
  useEffect(() => {
    const fetchPeople = async () => {
      if (!selectedEntityId || activeTab !== 'people') return;

      try {
        setLoadingPeople(true);
        const response = await listPeople(selectedEntityId);
        const peopleList = response.data || response || [];
        setPeople(peopleList);
      } catch (error) {
        console.error('Failed to fetch people:', error);
        toast.error('Failed to load people and roles.');
      } finally {
        setLoadingPeople(false);
      }
    };

    fetchPeople();
  }, [selectedEntityId, activeTab]);

  // Fetch audit trail when audit tab is active
  useEffect(() => {
    const fetchAuditTrail = async () => {
      if (!selectedEntityId || activeTab !== 'audit') return;

      try {
        setLoadingAudit(true);
        const response = await getAuditTrail(selectedEntityId, { limit: 100 });
        const auditList = response.data || response || [];
        // Transform audit trail entries to match UI format
        const transformedAudit = auditList.map(entry => ({
          id: entry.id,
          timestamp: entry.timestamp ? new Date(entry.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' }) : '',
          user: entry.user || entry.userName || 'Unknown',
          role: entry.role || 'User',
          action: entry.actionDisplay || entry.action || 'Updated',
          document: entry.document || entry.documentName || '',
          status: entry.statusDisplay || entry.status || '',
          statusColor: getStatusColor(entry.status),
          notes: entry.notes || '',
        }));
        setAuditTrailEntries(transformedAudit);
      } catch (error) {
        console.error('Failed to fetch audit trail:', error);
        toast.error('Failed to load audit trail.');
      } finally {
        setLoadingAudit(false);
      }
    };

    fetchAuditTrail();
  }, [selectedEntityId, activeTab]);

  // Close manage menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedElement = event.target;
      const isManageButton = clickedElement.closest('[data-manage-button]');
      const isManageMenu = clickedElement.closest('[data-manage-menu]');
      
      if (!isManageButton && !isManageMenu) {
        setManageMenuOpen(null);
      }
    };

    if (manageMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [manageMenuOpen]);

  // Helper function to get status color
  const getStatusColor = (status) => {
    if (!status) return 'text-gray-400';
    const statusLower = status.toLowerCase();
    if (statusLower === 'approved' || statusLower === 'verified' || statusLower === 'active' || statusLower === 'compliant') {
      return 'text-green-400';
    }
    if (statusLower === 'pending') {
      return 'text-[#F1CB68]';
    }
    if (statusLower === 'rejected' || statusLower === 'inactive') {
      return 'text-red-400';
    }
    return 'text-gray-400';
  };

  // Handlers
  const handleDownloadCompliancePackage = async () => {
    if (!selectedEntityId) {
      toast.error('No entity selected');
      return;
    }

    try {
      const blob = await downloadCompliancePackage(selectedEntityId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-package-${selectedEntityId}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Compliance package downloaded successfully!');
    } catch (error) {
      console.error('Failed to download compliance package:', error);
      const errorMsg = error.data?.detail || error.message || 'Failed to download compliance package. Please try again.';
      toast.error(errorMsg);
    }
  };

  const handleAddEntity = () => {
    toast.info('Add entity functionality coming soon');
  };

  const handleAddNote = async () => {
    if (!selectedEntityId || !noteText.trim()) {
      toast.error('Please enter a note');
      return;
    }

    try {
      await addAuditTrailEntry(selectedEntityId, {
        action: 'note_added',
        notes: noteText.trim(),
      });
      toast.success('Note added successfully!');
      setNoteText('');
      // Refresh audit trail
      const response = await getAuditTrail(selectedEntityId, { limit: 100 });
      const auditList = response.data || response || [];
      const transformedAudit = auditList.map(entry => ({
        id: entry.id,
        timestamp: entry.timestamp ? new Date(entry.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' }) : '',
        user: entry.user || entry.userName || 'Unknown',
        role: entry.role || 'User',
        action: entry.actionDisplay || entry.action || 'Updated',
        document: entry.document || entry.documentName || '',
        status: entry.statusDisplay || entry.status || '',
        statusColor: getStatusColor(entry.status),
        notes: entry.notes || '',
      }));
      setAuditTrailEntries(transformedAudit);
    } catch (error) {
      console.error('Failed to add note:', error);
      const errorMsg = error.data?.detail || error.message || 'Failed to add note. Please try again.';
      toast.error(errorMsg);
    }
  };

  const handleDeleteAuditEntry = async (entryId) => {
    if (!selectedEntityId) return;

    try {
      await deleteAuditTrailEntry(selectedEntityId, entryId);
      toast.success('Entry deleted successfully!');
      setManageMenuOpen(null);
      // Refresh audit trail
      const response = await getAuditTrail(selectedEntityId, { limit: 100 });
      const auditList = response.data || response || [];
      const transformedAudit = auditList.map(entry => ({
        id: entry.id,
        timestamp: entry.timestamp ? new Date(entry.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' }) : '',
        user: entry.user || entry.userName || 'Unknown',
        role: entry.role || 'User',
        action: entry.actionDisplay || entry.action || 'Updated',
        document: entry.document || entry.documentName || '',
        status: entry.statusDisplay || entry.status || '',
        statusColor: getStatusColor(entry.status),
        notes: entry.notes || '',
      }));
      setAuditTrailEntries(transformedAudit);
    } catch (error) {
      console.error('Failed to delete entry:', error);
      const errorMsg = error.data?.detail || error.message || 'Failed to delete entry. Please try again.';
      toast.error(errorMsg);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !selectedEntityId) return;

    try {
      setUploadingDocument(true);
      await uploadDocument(selectedEntityId, file, {
        documentType: 'supporting_document',
      });
      toast.success('Document uploaded successfully!');
      // Refresh entity details to get updated document list
      const entityResponse = await getEntity(selectedEntityId);
      const entityData = entityResponse.data || entityResponse;
      setSelectedEntity(entityData);
    } catch (error) {
      console.error('Failed to upload document:', error);
      const errorMsg = error.data?.detail || error.message || 'Failed to upload document. Please try again.';
      toast.error(errorMsg);
    } finally {
      setUploadingDocument(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleAddPerson = () => {
    toast.info('Add person functionality coming soon');
  };

  // Show loading state with skeleton
  if (loading) {
    return (
      <DashboardLayout>
        <div className='space-y-6'>
          {/* Header Skeleton */}
          <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6'>
            <div className='space-y-3'>
              <div className={`h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse`}></div>
              <div className={`h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse`}></div>
              <div className={`h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse`}></div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Left Sidebar Skeleton */}
            <div className='lg:col-span-1 space-y-4'>
              <div className={`rounded-2xl p-6 border ${isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'}`}>
                <div className={`h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse`}></div>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className='mb-4'>
                    <div className={`h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse`}></div>
                    <div className={`h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse`}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Content Skeleton */}
            <div className='lg:col-span-2 space-y-4'>
              {/* Tabs Skeleton */}
              <div className='flex gap-2 border-b border-gray-200 dark:border-[#FFFFFF14]'>
                <div className={`h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-t animate-pulse`}></div>
                <div className={`h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-t animate-pulse`}></div>
              </div>

              {/* Content Cards Skeleton */}
              <div className={`rounded-2xl p-6 border ${isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'}`}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className='mb-4 last:mb-0'>
                    <div className={`h-5 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse`}></div>
                    <div className={`h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse`}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show message if no entities
  if (!selectedEntity && entities.length === 0) {
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center h-64'>
          <div className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            No entities found. Please create an entity first.
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Header Section */}
        <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6'>
          <div>
            <h1
              className={`text-3xl md:text-4xl font-bold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
          Entity Structure
        </h1>
            <h2
              className={`text-xl md:text-2xl font-semibold mb-1 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {selectedEntity?.name || 'No Entity Selected'}
            </h2>
            <p className='text-[#F1CB68] text-sm md:text-base'>
              {selectedEntity?.location || ''}
            </p>
          </div>
          <button
            onClick={handleDownloadCompliancePackage}
            className={`px-4 md:px-6 py-2.5 md:py-3 rounded-full text-sm md:text-base font-medium transition-all hover:opacity-90 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap border border-[#F1CB68] bg-transparent hover:bg-[#F1CB68]/10 ${
              isDarkMode ? 'text-[#F1CB68]' : 'text-gray-900'
            }`}
          >
            <Image
              src='/icons/download.svg'
              alt='Download'
              width={18}
              height={18}
              className='w-4 h-4 md:w-5 md:h-5'
            />
            Compliance Package
          </button>
        </div>

        {/* Entity Type Overview Card */}
        <div
          className={`rounded-2xl p-4 md:p-6 border overflow-hidden ${
            isDarkMode
              ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
              : 'bg-white border-gray-200'
          }`}
        >
          <h3
            className={`text-lg md:text-xl font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Entity Type Overview
          </h3>
          <div className='overflow-x-auto'>
            {loadingEntity ? (
              <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Loading entity types...
              </div>
            ) : entityTypes.length === 0 ? (
              <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No entity types available
              </div>
            ) : (
              <table className='w-full'>
                <thead>
                  <tr
                    className={`border-b ${
                      isDarkMode ? 'border-white/10' : 'border-gray-200'
                    }`}
                  >
                    <th
                      className={`text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold uppercase ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Type
                    </th>
                    <th
                      className={`text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold uppercase ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Jurisdiction
                    </th>
                    <th
                      className={`text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold uppercase ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Formation Rates
                    </th>
                    <th
                      className={`text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold uppercase ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Status
                    </th>
                    <th
                      className={`text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold uppercase ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {entityTypes.map((entity, index) => (
                    <tr
                      key={entity.type || index}
                      className={`border-b transition-colors ${
                        isDarkMode
                          ? 'border-white/5 hover:bg-white/5'
                          : 'border-gray-200 hover:bg-gray-50'
                      } ${index === entityTypes.length - 1 ? 'border-0' : ''}`}
                    >
                      <td
                        className={`px-4 md:px-6 py-4 text-sm md:text-base ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {entity.fullName || entity.type}
                      </td>
                      <td
                        className={`px-4 md:px-6 py-4 text-sm md:text-base ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {entity.jurisdiction}
                      </td>
                      <td
                        className={`px-4 md:px-6 py-4 text-sm md:text-base ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {entity.formationRates}
                      </td>
                      <td className='px-4 md:px-6 py-4'>
                        <span className={`text-sm md:text-base font-medium ${getStatusColor(entity.status)}`}>
                          {entity.status || 'N/A'}
                        </span>
                      </td>
                      <td className='px-4 md:px-6 py-4'>
                        <button
                          className={`text-sm md:text-base font-medium transition-colors ${
                            isDarkMode
                              ? 'text-[#F1CB68] hover:text-[#E5C158]'
                              : 'text-gray-900 hover:text-[#F1CB68]'
                          }`}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Entity Structure Diagram Card */}
          <div
            className={`rounded-2xl p-4 md:p-6 border ${
              isDarkMode
                ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
                : 'bg-white border-gray-200'
            }`}
          >
            <h3
              className={`text-lg md:text-xl font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Entity Structure
            </h3>
            <div className='space-y-4'>
              {/* Parent Entity */}
              {hierarchy?.parent && (
                <>
                  <div
                    className={`rounded-lg border-2 border-[#F1CB68] p-4 ${
                      isDarkMode ? 'bg-white/5' : 'bg-[#F1CB68]/10'
                    }`}
                  >
                    <p
                      className={`text-center font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {hierarchy.parent.name}
                    </p>
                  </div>
                  {/* Connection Line */}
                  <div className='flex justify-center'>
                    <div className='w-0.5 h-8 border-l-2 border-dashed border-[#F1CB68]'></div>
                  </div>
                </>
              )}

              {/* Current Entity */}
              {selectedEntity && (
                <div
                  className={`rounded-lg border-2 border-[#F1CB68] p-4 ${
                    isDarkMode ? 'bg-white/5' : 'bg-[#F1CB68]/10'
                  }`}
                >
                  <p
                    className={`text-center font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {selectedEntity.name}
                  </p>
                </div>
              )}

              {/* Child Entities */}
              {hierarchy?.children && hierarchy.children.length > 0 && (
                <>
                  {hierarchy.children.map((child, index) => (
                    <div key={child.id || index}>
                      {/* Connection Line */}
                      <div className='flex justify-center'>
                        <div className='w-0.5 h-8 border-l-2 border-dashed border-[#F1CB68]'></div>
                      </div>
                      <div
                        className={`rounded-lg border-2 border-[#F1CB68] p-4 ${
                          isDarkMode ? 'bg-white/5' : 'bg-[#F1CB68]/10'
                        }`}
                      >
                        <p
                          className={`text-center font-semibold ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {child.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Add Entity Button */}
              <div
                className={`rounded-lg border-2 border-[#F1CB68] p-4 cursor-pointer hover:opacity-80 transition-opacity ${
                  isDarkMode ? 'bg-white/5' : 'bg-[#F1CB68]/10'
                }`}
                onClick={handleAddEntity}
              >
                <p
                  className={`text-center font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  + Add Entity
                </p>
              </div>
            </div>
          </div>

          {/* Compliance Status & Documentation Card */}
          <div
            className={`rounded-2xl p-4 md:p-6 border ${
              isDarkMode
                ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
                : 'bg-white border-gray-200'
            }`}
          >
            <h3
              className={`text-lg md:text-xl font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Compliance Status & Documentation
            </h3>
            <div className='space-y-4'>
              {loadingEntity ? (
                <div className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Loading compliance status...
                </div>
              ) : complianceStatus.length === 0 ? (
                <div className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No compliance data available
                </div>
              ) : (
                complianceStatus.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between py-3 border-b ${
                      isDarkMode ? 'border-white/10' : 'border-gray-200'
                    } ${index === complianceStatus.length - 1 ? 'border-0' : ''}`}
                  >
                    <span
                      className={`text-sm md:text-base ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {item.label}
                    </span>
                    <span className={`text-sm md:text-base font-medium ${item.color}`}>
                      {item.value}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Document Upload Section */}
            <div className='mt-6 pt-6 border-t border-white/10'>
              <h4
                className={`text-sm md:text-base font-semibold mb-3 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Supporting Documents
              </h4>
              <div className='space-y-2'>
                <label
                  className={`w-full px-4 py-2 rounded-lg border border-dashed transition-colors cursor-pointer flex items-center justify-center ${
                    isDarkMode
                      ? 'border-white/20 hover:border-[#F1CB68] text-gray-400 hover:text-white'
                      : 'border-gray-300 hover:border-[#F1CB68] text-gray-600 hover:text-gray-900'
                  } ${uploadingDocument ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type='file'
                    className='hidden'
                    onChange={handleFileUpload}
                    disabled={uploadingDocument || !selectedEntityId}
                    accept='.pdf,.doc,.docx,.xls,.xlsx'
                  />
                  {uploadingDocument ? 'Uploading...' : '+ Upload Document'}
                </label>
                <p
                  className={`text-xs md:text-sm text-center ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}
                >
                  Articles of Incorporation, Trust Deeds, Operating Agreements, etc.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* People & Roles / Audit Trail & Notes - Tabbed Section */}
        <div
          className={`rounded-2xl p-4 md:p-6 border ${
            isDarkMode
              ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
              : 'bg-white border-gray-200'
          }`}
        >
          {/* Tabs */}
          <div className='flex gap-2 md:gap-4 mb-6 border-b border-white/10'>
            <button
              onClick={() => setActiveTab('people')}
              className={`px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base font-medium transition-all relative ${
                activeTab === 'people'
                  ? isDarkMode
                    ? 'text-white'
                    : 'text-gray-900'
                  : isDarkMode
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              People & Roles
              {activeTab === 'people' && (
                <div
                  className='absolute bottom-0 left-0 right-0 h-0.5'
                  style={{
                    background: isDarkMode
                      ? 'linear-gradient(90deg, #F1CB68 0%, #F1CB68 100%)'
                      : '#F1CB68',
                  }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base font-medium transition-all relative ${
                activeTab === 'audit'
                  ? isDarkMode
                    ? 'text-white'
                    : 'text-gray-900'
                  : isDarkMode
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Audit Trail & Notes
              {activeTab === 'audit' && (
                <div
                  className='absolute bottom-0 left-0 right-0 h-0.5'
                  style={{
                    background: isDarkMode
                      ? 'linear-gradient(90deg, #F1CB68 0%, #F1CB68 100%)'
                      : '#F1CB68',
                  }}
                />
              )}
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'people' ? (
            <div className='space-y-4'>
              {loadingPeople ? (
                <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Loading people and roles...
                </div>
              ) : people.length === 0 ? (
                <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No people assigned to this entity
                </div>
              ) : (
                <>
                  {people.map((person, index) => (
                    <div
                      key={person.id || index}
                      className={`flex items-center justify-between py-3 border-b ${
                        isDarkMode ? 'border-white/10' : 'border-gray-200'
                      } ${index === people.length - 1 ? 'border-0' : ''}`}
                    >
                      <div>
                        <p
                          className={`text-sm md:text-base font-medium mb-1 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {person.name}
                        </p>
                        <p
                          className={`text-xs md:text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {person.roleDisplay || person.role}
                        </p>
                      </div>
                      <button
                        className={`text-xs md:text-sm font-medium transition-colors ${
                          isDarkMode
                            ? 'text-[#F1CB68] hover:text-[#E5C158]'
                            : 'text-[#F1CB68] hover:text-[#E5C158]'
                        }`}
                      >
                        Manage
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleAddPerson}
                    className={`w-full mt-4 px-4 py-2 rounded-lg border border-dashed transition-colors ${
                      isDarkMode
                        ? 'border-white/20 hover:border-[#F1CB68] text-gray-400 hover:text-white'
                        : 'border-gray-300 hover:border-[#F1CB68] text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    + Add Person
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className='space-y-4'>
              {/* Audit Trail Entries */}
              <div className='space-y-4 max-h-[600px] overflow-y-auto'>
                {loadingAudit ? (
                  <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Loading audit trail...
                  </div>
                ) : auditTrailEntries.length === 0 ? (
                  <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No audit trail entries found
                  </div>
                ) : (
                  auditTrailEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`rounded-lg p-4 border ${
                      isDarkMode
                        ? 'bg-white/5 border-white/10'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className='flex items-start justify-between mb-2'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <span
                            className={`text-sm md:text-base font-semibold ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {entry.user}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              entry.role === 'Compliance Officer'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-[#F1CB68]/20 text-[#F1CB68]'
                            }`}
                          >
                            {entry.role}
                          </span>
                        </div>
                        <p
                          className={`text-xs md:text-sm mb-2 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {entry.timestamp}
                        </p>
                        <div className='flex items-center gap-2 mb-2'>
                          <span
                            className={`text-sm md:text-base font-medium ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {entry.action}:
                          </span>
                          <span
                            className={`text-sm md:text-base ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}
                          >
                            {entry.document}
                          </span>
                          <span
                            className={`text-xs md:text-sm font-medium ${entry.statusColor}`}
                          >
                            ({entry.status})
                          </span>
                        </div>
                        <p
                          className={`text-xs md:text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {entry.notes}
                        </p>
                      </div>
                      <div className='relative ml-4'>
                        <button
                          data-manage-button
                          onClick={() =>
                            setManageMenuOpen(
                              manageMenuOpen === entry.id ? null : entry.id
                            )
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                            isDarkMode
                              ? 'text-[#F1CB68] hover:bg-white/5 border border-white/10'
                              : 'text-[#F1CB68] hover:bg-gray-100 border border-gray-300'
                          }`}
                        >
                          Manage
                        </button>
                        {manageMenuOpen === entry.id && (
                          <div
                            data-manage-menu
                            className={`absolute right-0 mt-2 w-48 rounded-lg border shadow-lg z-10 ${
                              isDarkMode
                                ? 'bg-[#1A1A1D] border-white/10'
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            <button
                              onClick={() => setManageMenuOpen(null)}
                              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                isDarkMode
                                  ? 'text-white hover:bg-white/5'
                                  : 'text-gray-900 hover:bg-gray-50'
                              }`}
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => setManageMenuOpen(null)}
                              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                isDarkMode
                                  ? 'text-white hover:bg-white/5'
                                  : 'text-gray-900 hover:bg-gray-50'
                              }`}
                            >
                              Edit Note
                            </button>
                            <button
                              onClick={() => setManageMenuOpen(null)}
                              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                isDarkMode
                                  ? 'text-white hover:bg-white/5'
                                  : 'text-gray-900 hover:bg-gray-50'
                              }`}
                            >
                              Download Document
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this entry?')) {
                                  handleDeleteAuditEntry(entry.id);
                                }
                              }}
                              className={`w-full text-left px-4 py-2 text-sm transition-colors border-t ${
                                isDarkMode
                                  ? 'text-red-400 hover:bg-white/5 border-white/10'
                                  : 'text-red-600 hover:bg-gray-50 border-gray-200'
                              }`}
                            >
                              Delete Entry
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>

              {/* Add Note Section */}
              <div
                className={`mt-6 pt-6 border-t ${
                  isDarkMode ? 'border-white/10' : 'border-gray-200'
                }`}
              >
                <h4
                  className={`text-sm md:text-base font-semibold mb-3 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Add Note
                </h4>
                <textarea
                  placeholder='Add a note or comment...'
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-[#F1CB68] ${
                    isDarkMode
                      ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                />
                <div className='flex items-center gap-3 mt-3'>
                  <button
                    onClick={handleAddNote}
                    disabled={!noteText.trim()}
                    className='px-4 py-2 bg-[#F1CB68] text-[#101014] rounded-lg font-medium hover:bg-[#E5C158] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Add Note
                  </button>
                  <button
                    onClick={() => setNoteText('')}
                    className={`px-4 py-2 rounded-lg font-medium border transition-colors ${
                      isDarkMode
                        ? 'border-white/10 text-white hover:bg-white/5'
                        : 'border-gray-300 text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* File Upload Section */}
              <div
                className={`mt-6 pt-6 border-t ${
                  isDarkMode ? 'border-white/10' : 'border-gray-200'
                }`}
              >
                <h4
                  className={`text-sm md:text-base font-semibold mb-3 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Upload Document
                </h4>
                <div
                  className={`rounded-lg border border-dashed p-6 flex flex-col items-center justify-center ${
                    isDarkMode
                      ? 'border-white/20 bg-white/5'
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <p
                    className={`text-sm md:text-base mb-2 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Drag & drop files here or
                  </p>
                  <label
                    className='px-4 md:px-6 py-2.5 md:py-3 rounded-full text-sm md:text-base font-medium transition-all hover:opacity-90 cursor-pointer inline-block'
                    style={{
                      background:
                        'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
                      color: '#000000',
                    }}
                  >
                    <input
                      type='file'
                      className='hidden'
                      onChange={handleFileUpload}
                      disabled={uploadingDocument || !selectedEntityId}
                      accept='.pdf,.doc,.docx,.xls,.xlsx'
                    />
                    {uploadingDocument ? 'Uploading...' : 'Browse Files'}
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
