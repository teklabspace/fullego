'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  allCategories,
  getCategoriesByGroup,
  getCategoryGroups,
  getFormFieldsForCategory,
} from '@/config/assetConfig';
import { useTheme } from '@/context/ThemeContext';
import { getCategoryIcon } from '@/utils/categoryIcons';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  createAsset,
  uploadFile,
  uploadAssetPhoto,
  uploadAssetDocument,
} from '@/utils/assetsApi';

const steps = [
  { id: 1, title: 'Basic Information' },
  { id: 2, title: 'Upload Documents' },
  { id: 3, title: 'Asset Valuation' },
];

const conditions = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];
const ownershipTypes = ['Sole', 'Joint', 'Trust', 'Corporate'];
const riskLevels = ['Low', 'Medium', 'High', 'Very High'];
const paymentFrequencies = ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual'];
const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'];

// Helper function to convert field name to form field key
const fieldNameToKey = fieldName => {
  return fieldName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

// Helper function to get field type based on field name
const getFieldType = fieldName => {
  const lowerName = fieldName.toLowerCase();
  if (lowerName.includes('date')) return 'date';
  if (
    lowerName.includes('price') ||
    lowerName.includes('value') ||
    lowerName.includes('cost') ||
    lowerName.includes('owed')
  )
    return 'currency';
  if (lowerName.includes('rate') || lowerName.includes('interest'))
    return 'percentage';
  if (
    lowerName.includes('description') ||
    lowerName.includes('notes') ||
    lowerName.includes('purpose')
  )
    return 'textarea';
  if (lowerName.includes('image')) return 'file';
  if (lowerName.includes('condition')) return 'select';
  if (lowerName.includes('ownership type')) return 'select';
  if (lowerName.includes('risk level')) return 'select';
  if (lowerName.includes('payment frequency')) return 'select';
  if (lowerName.includes('currency')) return 'select';
  if (lowerName.includes('type') && !lowerName.includes('ownership'))
    return 'select';
  return 'text';
};

// Helper function to get select options
const getSelectOptions = fieldName => {
  const lowerName = fieldName.toLowerCase();
  if (lowerName.includes('condition')) return conditions;
  if (lowerName.includes('ownership type')) return ownershipTypes;
  if (lowerName.includes('risk level')) return riskLevels;
  if (lowerName.includes('payment frequency')) return paymentFrequencies;
  if (lowerName.includes('currency')) return currencies;
  return [];
};

export default function AddAssetPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [formData, setFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [assetPhotos, setAssetPhotos] = useState([]);
  const [supportingDocs, setSupportingDocs] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [valuationType, setValuationType] = useState('manual');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [uploadPromises, setUploadPromises] = useState(new Map()); // Track active uploads

  // Get categories grouped by category group
  const categoriesByGroup = useMemo(() => {
    const groups = getCategoryGroups();
    return groups.map(group => ({
      groupName: group,
      categories: getCategoriesByGroup(group),
    }));
  }, []);

  // Filter categories based on search query
  const filteredCategoriesByGroup = useMemo(() => {
    if (!searchQuery.trim()) {
      return categoriesByGroup;
    }
    const query = searchQuery.toLowerCase();
    return categoriesByGroup
      .map(({ groupName, categories }) => ({
        groupName,
        categories: categories.filter(
          cat =>
            cat.name.toLowerCase().includes(query) ||
            cat.description.toLowerCase().includes(query) ||
            groupName.toLowerCase().includes(query)
        ),
      }))
      .filter(({ categories }) => categories.length > 0);
  }, [categoriesByGroup, searchQuery]);

  // Get form fields for selected category
  const formFields = useMemo(() => {
    if (!selectedCategory) return [];
    return getFormFieldsForCategory(selectedCategory);
  }, [selectedCategory]);

  // Toggle category group expansion
  const toggleGroup = groupName => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  // Initialize form data when category changes
  const handleCategorySelect = categoryId => {
    setSelectedCategory(categoryId);
    const category = allCategories.find(cat => cat.id === categoryId);
    if (category) {
      setSelectedCategoryGroup(category.categoryGroup);
      // Initialize form data with empty values for all fields
      const fields = getFormFieldsForCategory(categoryId);
      const initialData = {};
      fields.forEach(field => {
        const key = fieldNameToKey(field);
        if (getFieldType(field) === 'select') {
          const options = getSelectOptions(field);
          initialData[key] = options[0] || '';
        } else {
          initialData[key] = '';
        }
      });
      setFormData(initialData);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleNext = async () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit form - Step 3 is the final step
      try {
        setIsSubmitting(true);
        setSubmitError(null);

        console.log('🚀 Starting Asset Creation Process');
        console.log('📋 Form Data:', formData);
        console.log('📸 Photos:', assetPhotos.length);
        console.log('📄 Documents:', supportingDocs.length);

        // Wait for all uploads to complete first
        console.log('⏳ Waiting for all file uploads to complete...');
        
        // Get all active upload promises
        let activeUploads = Array.from(uploadPromises.values());
        if (activeUploads.length > 0) {
          console.log(`⏳ Waiting for ${activeUploads.length} active upload(s) to complete...`);
          try {
            await Promise.allSettled(activeUploads);
            console.log('✅ All active uploads completed');
            // Give a small delay for state updates
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (err) {
            console.error('❌ Some uploads failed:', err);
          }
        }

        // Re-check for any remaining active uploads (in case new ones started)
        let maxWaitTime = 30000; // 30 seconds max wait
        const startTime = Date.now();
        while (uploadPromises.size > 0 && (Date.now() - startTime) < maxWaitTime) {
          activeUploads = Array.from(uploadPromises.values());
          if (activeUploads.length > 0) {
            console.log(`⏳ Still waiting for ${activeUploads.length} upload(s)...`);
            await Promise.allSettled(activeUploads);
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }

        // Check upload status and collect IDs
        const photoIds = [];
        const documentIds = [];
        const uploadErrors = [];

        // Collect photo IDs from completed uploads
        console.log('📸 Checking photo upload status...');
        for (let i = 0; i < assetPhotos.length; i++) {
          const photo = assetPhotos[i];
          if (photo.status === 'completed' && photo.uploadedId) {
            photoIds.push(photo.uploadedId);
            console.log(`✅ Photo ${i + 1} ready: ${photo.uploadedId} (${photo.name})`);
          } else if (photo.status === 'error') {
            uploadErrors.push({
              type: 'photo',
              index: i,
              fileName: photo.name,
              error: new Error(photo.error || 'Upload failed'),
            });
            console.error(`❌ Photo ${i + 1} failed: ${photo.name} - ${photo.error}`);
          } else if (photo.status === 'uploading' || !photo.uploadedId) {
            // Still uploading or not started
            const statusMsg = photo.status === 'uploading' 
              ? 'Upload still in progress' 
              : 'Upload not completed';
            console.log(`⏳ Photo ${i + 1} not ready: ${photo.name} (${statusMsg})`);
            uploadErrors.push({
              type: 'photo',
              index: i,
              fileName: photo.name,
              error: new Error(statusMsg),
            });
          }
        }

        // Collect document IDs from completed uploads
        console.log('📄 Checking document upload status...');
        for (let i = 0; i < supportingDocs.length; i++) {
          const doc = supportingDocs[i];
          if (doc.status === 'completed' && doc.uploadedId) {
            documentIds.push(doc.uploadedId);
            console.log(`✅ Document ${i + 1} ready: ${doc.uploadedId} (${doc.name})`);
          } else if (doc.status === 'error') {
            uploadErrors.push({
              type: 'document',
              index: i,
              fileName: doc.name,
              error: new Error(doc.error || 'Upload failed'),
            });
            console.error(`❌ Document ${i + 1} failed: ${doc.name} - ${doc.error}`);
          } else if (doc.status === 'uploading' || !doc.uploadedId) {
            // Still uploading or not started
            const statusMsg = doc.status === 'uploading' 
              ? 'Upload still in progress' 
              : 'Upload not completed';
            console.log(`⏳ Document ${i + 1} not ready: ${doc.name} (${statusMsg})`);
            uploadErrors.push({
              type: 'document',
              index: i,
              fileName: doc.name,
              error: new Error(statusMsg),
            });
          }
        }

        // Validation: Check if any uploads failed or are still in progress
        if (uploadErrors.length > 0) {
          const errorSummary = uploadErrors.map(e => {
            const errorMsg = e.error.isCorsError 
              ? 'CORS Error (Backend configuration issue)'
              : e.error.message;
            return `${e.type} "${e.fileName}": ${errorMsg}`;
          }).join('\n');
          
          // Check if all errors are CORS errors
          const allCorsErrors = uploadErrors.every(e => e.error?.isCorsError);
          const errorMessage = allCorsErrors
            ? `CORS Error: Backend must allow requests from ${typeof window !== 'undefined' ? window.location.origin : 'frontend'}. Please configure CORS on backend server.\n\nFailed files:\n${uploadErrors.map(e => `- ${e.type}: ${e.fileName}`).join('\n')}`
            : `Failed to upload ${uploadErrors.length} file(s). Please wait for uploads to complete or fix errors before creating asset.\n\nErrors:\n${errorSummary}`;
          
          console.error('❌ Asset creation cancelled due to upload failures:', uploadErrors);
          setSubmitError(errorMessage);
          setIsSubmitting(false);
          return; // Stop here - don't create asset
        }

        // Log upload summary
        console.log('✅ All files uploaded successfully:', {
          photos: photoIds.length,
          documents: documentIds.length,
          photoIds,
          documentIds,
        });

        // Prepare asset data
        const categoryObj = allCategories.find(c => c.id === selectedCategory);
        const assetData = {
          name: formData.asset_name || formData.name || '',
          category: categoryObj?.name || selectedCategory,
          categoryGroup: selectedCategoryGroup || categoryObj?.categoryGroup || 'Assets',
          description: formData.description || '',
          location: formData.location || '',
          estimatedValue: estimatedValue ? parseFloat(estimatedValue.replace(/[^0-9.-]+/g, '')) : undefined,
          currentValue: estimatedValue ? parseFloat(estimatedValue.replace(/[^0-9.-]+/g, '')) : undefined,
          condition: formData.condition || undefined,
          ownershipType: formData.ownership_type || undefined,
          acquisitionDate: formData.acquisition_date || formData.purchase_date || undefined,
          purchasePrice: formData.purchase_price ? parseFloat(formData.purchase_price.replace(/[^0-9.-]+/g, '')) : undefined,
          currency: formData.currency || 'USD',
          valuationType: valuationType || 'manual',
          // Backend expects UUIDs (IDs), not URLs!
          // Send both 'images' and 'photos' arrays with IDs to support different backend expectations
          photos: photoIds.length > 0 ? photoIds : undefined,
          images: photoIds.length > 0 ? photoIds : undefined, // Some backends expect 'images'
          documents: documentIds.length > 0 ? documentIds : undefined,
          specifications: {
            // Include all category-specific fields
            ...formData,
            // Remove non-specification fields
            asset_name: undefined,
            name: undefined,
            category: undefined,
            categoryGroup: undefined,
            description: undefined,
            location: undefined,
            estimated_value: undefined,
            current_value: undefined,
            condition: undefined,
            ownership_type: undefined,
            acquisition_date: undefined,
            purchase_date: undefined,
            purchase_price: undefined,
            currency: undefined,
            valuation_type: undefined,
            photos: undefined,
            images: undefined,
            documents: undefined,
          },
        };

        // Remove undefined values
        Object.keys(assetData).forEach(key => {
          if (assetData[key] === undefined) {
            delete assetData[key];
          }
        });
        if (assetData.specifications) {
          Object.keys(assetData.specifications).forEach(key => {
            if (assetData.specifications[key] === undefined) {
              delete assetData.specifications[key];
            }
          });
        }

        // Log complete asset payload before creation
        console.log('📦 Complete Asset Creation Payload:', JSON.stringify(assetData, null, 2));
        console.log('📊 Payload Summary:', {
          name: assetData.name,
          category: assetData.category,
          categoryGroup: assetData.categoryGroup,
          estimatedValue: assetData.estimatedValue,
          currency: assetData.currency,
          photosCount: assetData.photos?.length || 0,
          photosIds: assetData.photos,
          imagesCount: assetData.images?.length || 0,
          imagesIds: assetData.images,
          documentsCount: assetData.documents?.length || 0,
          documentIds: assetData.documents,
          specificationsKeys: Object.keys(assetData.specifications || {}),
        });

        // Create the asset
        console.log('🔄 Creating asset...');
        const response = await createAsset(assetData);
        
        console.log('✅ Asset created successfully:', {
          assetId: response.data?.id,
          name: response.data?.name,
          category: response.data?.category,
        });

        // Asset created successfully with photo and document IDs
        if (response.data?.id) {
          const assetId = response.data.id;
          console.log('🔗 Asset ID received:', assetId);
          console.log('📎 Asset created with IDs:', {
            photos: photoIds.length,
            documents: documentIds.length,
            photoIds: photoIds,
            documentIds: documentIds,
          });
        }

        // Redirect to assets page
        console.log('✅ Asset creation complete. Redirecting...');
        router.push('/dashboard/assets');
      } catch (err) {
        console.error('❌ Error creating asset:', err);
        console.error('❌ Error details:', {
          message: err.message,
          status: err.status,
          data: err.data,
          fullError: err,
        });
        
        // Extract detailed error message
        let errorMessage = 'Failed to create asset. Please try again.';
        if (err.data) {
          if (Array.isArray(err.data.detail)) {
            // Backend validation errors (422)
            const validationErrors = err.data.detail.map(error => {
              if (typeof error === 'string') return error;
              if (error.msg) return `${error.loc?.join('.') || 'Field'}: ${error.msg}`;
              if (error.msg) return error.msg;
              return JSON.stringify(error);
            }).join('\n');
            errorMessage = `Validation Error:\n${validationErrors}`;
          } else if (typeof err.data.detail === 'string') {
            errorMessage = err.data.detail;
          } else if (err.data.message) {
            errorMessage = err.data.message;
          } else if (err.data.error) {
            errorMessage = err.data.error;
          }
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setSubmitError(errorMessage);
        setIsSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/assets');
  };

  const handleFileSelect = (event, type) => {
    const files = Array.from(event.target.files);
    handleFiles(files, type);
  };

  const handleDragOver = e => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = e => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files, type);
  };

  const handleFiles = (files, type) => {
    const validFiles = files.filter(file => {
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      if (type === 'photo') {
        return isValidSize && file.type.startsWith('image/');
      } else {
        return isValidSize && file.type === 'application/pdf';
      }
    });

    const newFiles = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2),
      progress: 0,
      status: 'uploading', // 'uploading', 'completed', 'error'
      error: null,
      uploadedId: null, // Store the UUID from backend after successful upload
    }));

    if (type === 'photo') {
      setAssetPhotos(prev => [...prev, ...newFiles]);
      // Start actual uploads immediately
      newFiles.forEach(fileObj => {
        startUpload(fileObj, type);
      });
    } else if (type === 'doc') {
      setSupportingDocs(prev => [...prev, ...newFiles]);
      newFiles.forEach(fileObj => {
        startUpload(fileObj, type);
      });
    }
  };

  const startUpload = async (fileObj, type) => {
    const fileId = fileObj.id;

    // Update status to uploading
    if (type === 'photo') {
      setAssetPhotos(prev =>
        prev.map(file =>
          file.id === fileId ? { ...file, status: 'uploading', progress: 0 } : file
        )
      );
    } else {
      setSupportingDocs(prev =>
        prev.map(file =>
          file.id === fileId ? { ...file, status: 'uploading', progress: 0 } : file
        )
      );
    }

    try {
      // Create upload promise
      const uploadPromise = uploadFileWithProgress(
        fileObj.file,
        type === 'photo' ? 'photo' : 'document',
        fileId,
        type
      );

      // Store the promise
      setUploadPromises(prev => {
        const newMap = new Map(prev);
        newMap.set(fileId, uploadPromise);
        return newMap;
      });

      // Wait for upload to complete
      const result = await uploadPromise;

      // Update with success
      if (type === 'photo') {
        setAssetPhotos(prev =>
          prev.map(file =>
            file.id === fileId
              ? {
                  ...file,
                  status: 'completed',
                  progress: 100,
                  uploadedId: result.id,
                  error: null,
                }
              : file
          )
        );
      } else {
        setSupportingDocs(prev =>
          prev.map(file =>
            file.id === fileId
              ? {
                  ...file,
                  status: 'completed',
                  progress: 100,
                  uploadedId: result.id,
                  error: null,
                }
              : file
          )
        );
      }

      // Remove from promises map
      setUploadPromises(prev => {
        const newMap = new Map(prev);
        newMap.delete(fileId);
        return newMap;
      });

      console.log(`✅ ${type === 'photo' ? 'Photo' : 'Document'} uploaded successfully:`, {
        fileId,
        uploadedId: result.id,
        fileName: fileObj.name,
      });
    } catch (error) {
      console.error(`❌ Upload failed for ${type}:`, error);
      
      // Update with error
      if (type === 'photo') {
        setAssetPhotos(prev =>
          prev.map(file =>
            file.id === fileId
              ? {
                  ...file,
                  status: 'error',
                  error: error.message || 'Upload failed',
                }
              : file
          )
        );
      } else {
        setSupportingDocs(prev =>
          prev.map(file =>
            file.id === fileId
              ? {
                  ...file,
                  status: 'error',
                  error: error.message || 'Upload failed',
                }
              : file
          )
        );
      }

      // Remove from promises map
      setUploadPromises(prev => {
        const newMap = new Map(prev);
        newMap.delete(fileId);
        return newMap;
      });
    }
  };

  const uploadFileWithProgress = async (file, fileType, fileId, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);

    const headers = {};
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }

    const { API_BASE_URL, API_BASE_PATH, API_ENDPOINTS } = await import('@/config/api');
    const url = `${API_BASE_URL.replace(/\/$/, '')}${API_BASE_PATH}${API_ENDPOINTS.FILES.UPLOAD}`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          // Update progress in state
          if (type === 'photo') {
            setAssetPhotos(prev =>
              prev.map(file =>
                file.id === fileId ? { ...file, progress } : file
              )
            );
          } else {
            setSupportingDocs(prev =>
              prev.map(file =>
                file.id === fileId ? { ...file, progress } : file
              )
            );
          }
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.data?.id) {
              resolve({ id: response.data.id, ...response.data });
            } else {
              reject(new Error('Upload succeeded but no ID returned'));
            }
          } catch (err) {
            reject(new Error('Failed to parse upload response'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.detail || error.message || 'Upload failed'));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });

      xhr.open('POST', url);
      Object.keys(headers).forEach(key => {
        xhr.setRequestHeader(key, headers[key]);
      });
      xhr.send(formData);
    });
  };

  const removeFile = (fileId, type) => {
    // Cancel upload if in progress
    const promise = uploadPromises.get(fileId);
    if (promise) {
      // Note: We can't actually cancel XMLHttpRequest easily, but we'll remove it from tracking
      setUploadPromises(prev => {
        const newMap = new Map(prev);
        newMap.delete(fileId);
        return newMap;
      });
    }

    if (type === 'photo') {
      setAssetPhotos(prev => prev.filter(file => file.id !== fileId));
    } else if (type === 'doc') {
      setSupportingDocs(prev => prev.filter(file => file.id !== fileId));
    }
  };

  const getStepStatus = stepId => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'active';
    return 'pending';
  };

  // Render form field based on field name
  const renderFormField = fieldName => {
    const fieldKey = fieldNameToKey(fieldName);
    const fieldType = getFieldType(fieldName);
    const value = formData[fieldKey] || '';

    // Skip Image field as it's handled in step 2
    if (fieldName.toLowerCase().includes('image')) {
      return null;
    }

    // Handle special fields
    if (fieldName === 'Make/Model/Year') {
      return (
        <div
          key={fieldKey}
          className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'
        >
          <div>
            <label className='block text-sm font-medium text-white mb-2'>
              Make
            </label>
            <input
              type='text'
              name='make'
              value={formData.make || ''}
              onChange={handleChange}
              placeholder='Enter make'
              className='w-full px-4 py-3 rounded-lg bg-[#2A2A2D] border border-[#FFFFFF14] text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-white mb-2'>
              Model
            </label>
            <input
              type='text'
              name='model'
              value={formData.model || ''}
              onChange={handleChange}
              placeholder='Enter model'
              className='w-full px-4 py-3 rounded-lg bg-[#2A2A2D] border border-[#FFFFFF14] text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-white mb-2'>
              Year
            </label>
            <input
              type='text'
              name='year'
              value={formData.year || ''}
              onChange={handleChange}
              placeholder='Enter year'
              className='w-full px-4 py-3 rounded-lg bg-[#2A2A2D] border border-[#FFFFFF14] text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors'
            />
          </div>
        </div>
      );
    }

    // Handle Category field - show as read-only if category is selected
    if (fieldName === 'Category') {
      return (
        <div key={fieldKey} className='mb-6'>
          <label className='block text-sm font-medium text-white mb-2'>
            {fieldName}
          </label>
          <input
            type='text'
            value={
              selectedCategory
                ? allCategories.find(c => c.id === selectedCategory)?.name || ''
                : ''
            }
            readOnly
            className='w-full px-4 py-3 rounded-lg bg-[#2A2A2D] border border-[#FFFFFF14] text-gray-400 cursor-not-allowed'
          />
        </div>
      );
    }

    switch (fieldType) {
      case 'date':
        return (
          <div key={fieldKey} className='mb-6'>
            <label className='block text-sm font-medium text-white mb-2'>
              {fieldName}
            </label>
            <input
              type='date'
              name={fieldKey}
              value={value}
              onChange={handleChange}
              className='w-full px-4 py-3 rounded-lg bg-[#2A2A2D] border border-[#FFFFFF14] text-white focus:outline-none focus:border-[#F1CB68] transition-colors'
            />
          </div>
        );

      case 'currency':
        return (
          <div key={fieldKey} className='mb-6'>
            <label className='block text-sm font-medium text-white mb-2'>
              {fieldName}
            </label>
            <div className='relative'>
              <span className='absolute left-4 top-1/2 -translate-y-1/2 text-[#F1CB68] font-semibold'>
                $
              </span>
              <input
                type='text'
                name={fieldKey}
                value={value}
                onChange={handleChange}
                placeholder='0.00'
                className='w-full pl-8 pr-4 py-3 rounded-lg bg-[#2A2A2D] border border-[#FFFFFF14] text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors'
              />
            </div>
          </div>
        );

      case 'percentage':
        return (
          <div key={fieldKey} className='mb-6'>
            <label className='block text-sm font-medium text-white mb-2'>
              {fieldName}
            </label>
            <div className='relative'>
              <input
                type='text'
                name={fieldKey}
                value={value}
                onChange={handleChange}
                placeholder='0.00'
                className='w-full px-4 py-3 rounded-lg bg-[#2A2A2D] border border-[#FFFFFF14] text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors'
              />
              <span className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400'>
                %
              </span>
            </div>
          </div>
        );

      case 'textarea':
        return (
          <div key={fieldKey} className='mb-6'>
            <label className='block text-sm font-medium text-white mb-2'>
              {fieldName}
            </label>
            <textarea
              name={fieldKey}
              value={value}
              onChange={handleChange}
              placeholder={`Enter ${fieldName.toLowerCase()}`}
              rows={4}
              className='w-full px-4 py-3 rounded-lg bg-[#2A2A2D] border border-[#FFFFFF14] text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors resize-none'
            />
          </div>
        );

      case 'select':
        const options = getSelectOptions(fieldName);
        return (
          <div key={fieldKey} className='mb-6'>
            <label className='block text-sm font-medium text-white mb-2'>
              {fieldName}
            </label>
            <select
              name={fieldKey}
              value={value}
              onChange={handleChange}
              className="w-full"
            >
              {options.length > 0 ? (
                options.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))
              ) : (
                <option value=''>Select {fieldName}</option>
              )}
            </select>
          </div>
        );

      default:
        return (
          <div key={fieldKey} className='mb-6'>
            <label className='block text-sm font-medium text-white mb-2'>
              {fieldName}
            </label>
            <input
              type='text'
              name={fieldKey}
              value={value}
              onChange={handleChange}
              placeholder={`Enter ${fieldName.toLowerCase()}`}
              className='w-full px-4 py-3 rounded-lg bg-[#2A2A2D] border border-[#FFFFFF14] text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors'
            />
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className='min-h-screen pb-20'>
        {/* Header */}
        <div className='mb-8'>
          <button
            onClick={handleCancel}
            className='text-gray-400 hover:text-white mb-4 flex items-center gap-2 transition-colors'
          >
            <svg
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            >
              <path d='M19 12H5M5 12l7-7M5 12l7 7' />
            </svg>
            Back to Assets
          </button>
          <h1
            className={`text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Add New Asset
          </h1>
          <p className='text-gray-400 mt-2'>
            Fill in the details to add a new asset to your portfolio
          </p>
        </div>

        {/* Stepper - Desktop */}
        <div className='hidden md:block max-w-4xl mx-auto mb-12'>
          <div className='relative flex items-center justify-between'>
            {steps.map((step, index) => {
              const status = getStepStatus(step.id);
              return (
                <div
                  key={step.id}
                  className='flex-1 relative flex items-center'
                >
                  {/* Step Circle and Info */}
                  <div className='flex flex-col items-center flex-1'>
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm mb-2 transition-all ${
                        status === 'completed'
                          ? 'bg-gray-600 text-gray-400'
                          : status === 'active'
                          ? 'bg-[#F1CB68] text-[#0B0D12]'
                          : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {status === 'completed' ? '✓' : step.id}
                    </div>
                    <span
                      className={`text-sm text-nowrap text-center ${
                        status === 'active' ? 'text-white' : 'text-gray-400'
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
                          status === 'completed'
                            ? 'rgba(107, 114, 128, 0.5)'
                            : status === 'active'
                            ? '#F1CB68'
                            : 'rgba(255, 255, 255, 0.1)',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stepper - Mobile */}
        <div className='md:hidden mb-8'>
          <div className='flex items-center justify-center gap-2'>
            {steps.map((step, index) => {
              const status = getStepStatus(step.id);
              return (
                <div key={step.id} className='flex items-center'>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                      status === 'completed'
                        ? 'bg-gray-600 text-gray-400'
                        : status === 'active'
                        ? 'bg-[#F1CB68] text-[#0B0D12]'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {status === 'completed' ? '✓' : step.id}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className='w-6 h-[2px] mx-1'
                      style={{
                        background:
                          status === 'completed'
                            ? 'rgba(107, 114, 128, 0.5)'
                            : status === 'active'
                            ? '#F1CB68'
                            : 'rgba(255, 255, 255, 0.1)',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <p className='text-center text-sm text-gray-400 mt-2'>
            Step {currentStep} of {steps.length}
          </p>
        </div>

        {/* Form Content */}
        {currentStep === 1 && (
          <div className='max-w-7xl mx-auto'>
            {/* Header Section */}
            <div className='mb-8'>
              <h2 className='text-4xl md:text-5xl font-bold text-white mb-2 leading-tight'>
                Discover More.
                <br />
                Browse Smarter.
              </h2>

              {/* Search Bar and Add Button */}
              <div className='flex flex-col sm:flex-row gap-4 mt-6'>
                <div className='flex-1 relative'>
                  <div className='absolute left-4 top-1/2 -translate-y-1/2'>
                    <svg
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#9CA3AF'
                      strokeWidth='2'
                    >
                      <circle cx='11' cy='11' r='8' />
                      <path d='m21 21-4.35-4.35' />
                    </svg>
                  </div>
                  <input
                    type='text'
                    placeholder='Search Category......'
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className='w-full pl-12 pr-4 py-3 rounded-xl bg-[#2A2A2D] border border-[#FFFFFF14] text-white placeholder-gray-500 focus:outline-none focus:border-[#F1CB68] transition-colors'
                  />
                </div>
                <button className='px-6 hidden py-3 rounded-xl bg-[#F1CB68] text-[#0B0D12] font-semibold hover:bg-[#d4b55a] transition-colors flex items-center gap-2 justify-center'>
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                  >
                    <path d='M12 5v14M5 12h14' />
                  </svg>
                  Add New Asset
                </button>
              </div>
            </div>

            {/* Main Content Container */}
            <div className='bg-gradient-to-r from-[#222126] to-[#111116] border border-[#FFFFFF14] rounded-2xl p-6 md:p-8 max-h-[calc(200vh-300px)] overflow-y-auto custom-scrollbar'>
              {/* Category Groups */}
              {filteredCategoriesByGroup.map(({ groupName, categories }) => {
                const isExpanded = expandedGroups[groupName] ?? true; // Default to expanded
                const hasSelectedCategory = categories.some(
                  cat => cat.id === selectedCategory
                );

                // Get group display name
                const getGroupDisplayName = name => {
                  const groupMap = {
                    Assets: 'Physical, Alternative, Lifestyle',
                    Portfolio: 'Financial, Digital, Structured',
                    Liabilities: 'Liabilities & Debts',
                    'Shadow Wealth': 'Shadow & Anticipated Wealth',
                    Philanthropy: 'Philanthropy & Impact',
                    Lifestyle: 'Lifestyle & Concierge',
                    Governance: 'Compliance & Governance',
                  };
                  return groupMap[name] || name;
                };

                return (
                  <div key={groupName} className='mb-8 last:mb-0'>
                    {/* Group Header */}
                    <div className='flex items-center justify-between mb-4'>
                      <div className='flex items-center gap-3'>
                        <h3 className='text-2xl font-bold text-white'>
                          {groupName}
                        </h3>
                        <span className='text-sm text-gray-400'>
                          {getGroupDisplayName(groupName)}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleGroup(groupName)}
                        className='text-gray-400 hover:text-white transition-colors p-1'
                      >
                        <svg
                          width='20'
                          height='20'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth='2'
                          className={`transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        >
                          <path d='M6 9l6 6 6-6' />
                        </svg>
                      </button>
                    </div>

                    {/* Category Cards Grid */}
                    {isExpanded && (
                      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                        {categories.map(category => (
                          <button
                            key={category.id}
                            onClick={() => handleCategorySelect(category.id)}
                            className={`group relative p-6 rounded-xl border-2 transition-all text-left ${
                              selectedCategory === category.id
                                ? 'bg-[#2A2A2D] border-[#F1CB68] shadow-lg shadow-[#F1CB68]/20'
                                : 'bg-[#2A2A2D] border-[#FFFFFF14] hover:border-[#F1CB68]/50 hover:bg-[#2A2A2D]/80'
                            }`}
                          >
                            {/* Icon - Yellow icon at top center */}
                            <div className='flex justify-center mb-4'>
                              {category.iconFile ? (
                                <img
                                  src={`/${category.iconFile}`}
                                  alt={category.name}
                                  className='w-12 h-12 object-contain'
                                  style={{
                                    filter:
                                      'brightness(0) saturate(100%) invert(77%) sepia(48%) saturate(1352%) hue-rotate(358deg) brightness(101%) contrast(96%)',
                                  }}
                                />
                              ) : (
                                <div className='w-12 h-12 flex items-center justify-center text-[#F1CB68] transition-transform group-hover:scale-110'>
                                  {(() => {
                                    const IconComponent = getCategoryIcon(
                                      category.id
                                    );
                                    return (
                                      <IconComponent className='w-12 h-12' />
                                    );
                                  })()}
                                </div>
                              )}
                            </div>

                            {/* Category Title */}
                            <h4
                              className={`text-lg font-bold mb-2 ${
                                selectedCategory === category.id
                                  ? 'text-[#F1CB68]'
                                  : 'text-white'
                              }`}
                            >
                              {category.name}
                            </h4>

                            {/* Description */}
                            <p className='text-sm text-gray-400 leading-relaxed line-clamp-2'>
                              {category.description}
                            </p>

                            {/* Selected Indicator */}
                            {selectedCategory === category.id && (
                              <div className='absolute top-4 right-4'>
                                <div className='w-6 h-6 rounded-full bg-[#F1CB68] flex items-center justify-center'>
                                  <svg
                                    width='14'
                                    height='14'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='#0B0D12'
                                    strokeWidth='3'
                                  >
                                    <path d='M20 6L9 17l-5-5' />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* No Results Message */}
              {filteredCategoriesByGroup.length === 0 && (
                <div className='text-center py-12'>
                  <p className='text-gray-400 text-lg'>
                    No categories found matching &quot;{searchQuery}&quot;
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className='mt-4 text-[#F1CB68] hover:text-[#d4b55a] transition-colors'
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>

            {/* Selected Category Display */}
            {selectedCategory && (
              <div className='mt-6 p-4 bg-[#F1CB68]/10 border border-[#F1CB68]/30 rounded-xl'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-lg bg-[#F1CB68]/20 flex items-center justify-center'>
                    {(() => {
                      const category = allCategories.find(
                        c => c.id === selectedCategory
                      );
                      if (category?.iconFile) {
                        return (
                          <img
                            src={`/${category.iconFile}`}
                            alt='Selected category'
                            className='w-6 h-6 object-contain'
                          />
                        );
                      } else {
                        const IconComponent = getCategoryIcon(selectedCategory);
                        return (
                          <IconComponent className='w-6 h-6 text-[#F1CB68]' />
                        );
                      }
                    })()}
                  </div>
                  <div className='flex-1'>
                    <p className='text-xs text-gray-400 mb-1'>
                      Selected Category
                    </p>
                    <p className='text-white font-semibold'>
                      {allCategories.find(c => c.id === selectedCategory)?.name}
                    </p>
                    <p className='text-xs text-gray-400 mt-1'>
                      {
                        allCategories.find(c => c.id === selectedCategory)
                          ?.description
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedCategoryGroup(null);
                      setFormData({});
                    }}
                    className='text-gray-400 hover:text-white transition-colors p-2'
                  >
                    <svg
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                    >
                      <path d='M18 6L6 18M6 6l12 12' />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Dynamic Form Fields */}
            {selectedCategory && formFields.length > 0 && (
              <div className='mt-8 bg-gradient-to-r from-[#222126] to-[#111116] border border-[#FFFFFF14] rounded-2xl p-6 md:p-8'>
                <h3 className='text-xl font-semibold text-white mb-6'>
                  Asset Details
                </h3>
                {formFields.map(field => renderFormField(field))}

                {/* Action Buttons */}
                <div className='flex flex-col sm:flex-row gap-4 justify-end mt-8'>
                  <button
                    onClick={handleCancel}
                    className='px-6 py-3 rounded-lg border border-[#FFFFFF14] text-white hover:bg-white/5 transition-colors'
                  >
                    Cancel
                  </button>
                <button
                  onClick={handleNext}
                  disabled={!selectedCategory || isSubmitting}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    selectedCategory && !isSubmitting
                      ? 'bg-[#F1CB68] text-[#0B0D12] hover:bg-[#d4b55a]'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? 'Processing...' : 'Next Step'}
                </button>
                </div>
              </div>
            )}

            {/* Action Buttons - Show when no category selected */}
            {!selectedCategory && (
              <div className='flex flex-col sm:flex-row gap-4 justify-end mt-6'>
                <button
                  onClick={handleCancel}
                  className='px-6 py-3 rounded-lg border border-[#FFFFFF14] text-white hover:bg-white/5 transition-colors'
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2 - Upload Photos & Documents */}
        {currentStep === 2 && (
          <div className='max-w-4xl mx-auto'>
            <div className='bg-gradient-to-r from-[#222126] to-[#111116] border border-[#FFFFFF14] rounded-2xl p-6 md:p-8'>
              {/* Upload Section */}
              <div className='mb-8'>
                <div className='flex items-center justify-between mb-2'>
                  <h3 className='text-xl font-semibold text-white'>
                    Upload Photos & Documents
                  </h3>
                  {(assetPhotos.length > 0 || supportingDocs.length > 0) && (
                    <div className='flex items-center gap-4'>
                      {assetPhotos.length > 0 && (
                        <div className='flex items-center gap-2 px-3 py-1 bg-[#F1CB68]/20 border border-[#F1CB68]/50 rounded-full'>
                          <span className='text-[#F1CB68] text-sm font-medium'>
                            {assetPhotos.length} Photo{assetPhotos.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                      {supportingDocs.length > 0 && (
                        <div className='flex items-center gap-2 px-3 py-1 bg-[#F1CB68]/20 border border-[#F1CB68]/50 rounded-full'>
                          <span className='text-[#F1CB68] text-sm font-medium'>
                            {supportingDocs.length} Document{supportingDocs.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className='text-gray-400 text-sm mb-6'>
                  Provide clear photos of proof of ownership for your asset.
                  High-resolution images are recommended.
                </p>

                {/* Upload Areas Grid */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                  {/* Photos Upload Area */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={e => handleDrop(e, 'photo')}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
                      isDragging
                        ? 'border-[#F1CB68] bg-[#F1CB68]/5'
                        : 'border-[#FFFFFF14] hover:border-[#F1CB68]/50'
                    }`}
                  >
                    <div className='flex flex-col items-center'>
                      {/* Image Icon */}
                      <div className='mb-4'>
                        <svg
                          width='48'
                          height='48'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='#F1CB68'
                          strokeWidth='2'
                        >
                          <rect x='3' y='3' width='18' height='18' rx='2' />
                          <circle cx='8.5' cy='8.5' r='1.5' />
                          <polyline points='21 15 16 10 5 21' />
                        </svg>
                      </div>
                      <p className='text-white font-medium mb-1'>Upload Photos</p>
                      <p className='text-gray-400 text-xs mb-4'>
                        JPG, PNG (Max 10MB)
                      </p>
                      <input
                        type='file'
                        id='photo-upload'
                        multiple
                        accept='image/*'
                        onChange={e => handleFileSelect(e, 'photo')}
                        className='hidden'
                      />
                      <label
                        htmlFor='photo-upload'
                        className='px-4 py-2 bg-[#F1CB68] text-[#0B0D12] rounded-lg text-sm font-semibold cursor-pointer hover:bg-[#d4b55a] transition-colors inline-block'
                      >
                        Select Photos
                      </label>
                    </div>
                  </div>

                  {/* Documents Upload Area */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={e => handleDrop(e, 'doc')}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
                      isDragging
                        ? 'border-[#F1CB68] bg-[#F1CB68]/5'
                        : 'border-[#FFFFFF14] hover:border-[#F1CB68]/50'
                    }`}
                  >
                    <div className='flex flex-col items-center'>
                      {/* Document Icon */}
                      <div className='mb-4'>
                        <svg
                          width='48'
                          height='48'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='#F1CB68'
                          strokeWidth='2'
                        >
                          <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                          <polyline points='14 2 14 8 20 8' />
                          <line x1='16' y1='13' x2='8' y2='13' />
                          <line x1='16' y1='17' x2='8' y2='17' />
                        </svg>
                      </div>
                      <p className='text-white font-medium mb-1'>Upload Documents</p>
                      <p className='text-gray-400 text-xs mb-4'>
                        PDF only (Max 10MB)
                      </p>
                      <input
                        type='file'
                        id='doc-upload'
                        multiple
                        accept='application/pdf'
                        onChange={e => handleFileSelect(e, 'doc')}
                        className='hidden'
                      />
                      <label
                        htmlFor='doc-upload'
                        className='px-4 py-2 bg-[#F1CB68] text-[#0B0D12] rounded-lg text-sm font-semibold cursor-pointer hover:bg-[#d4b55a] transition-colors inline-block'
                      >
                        Select Documents
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assets Photos Section */}
              {assetPhotos.length > 0 && (
                <div className='mb-8'>
                  <h4 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                    <svg
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#F1CB68'
                      strokeWidth='2'
                    >
                      <rect x='3' y='3' width='18' height='18' rx='2' />
                      <circle cx='8.5' cy='8.5' r='1.5' />
                      <polyline points='21 15 16 10 5 21' />
                    </svg>
                    Assets Photos ({assetPhotos.length})
                  </h4>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    {assetPhotos.map(photo => (
                      <div
                        key={photo.id}
                        className='flex items-center gap-4 bg-[#2A2A2D] border border-[#FFFFFF14] rounded-xl p-4 hover:border-[#F1CB68]/50 transition-colors relative group'
                      >
                        {/* Thumbnail */}
                        <div className='w-16 h-16 rounded-lg overflow-hidden bg-[#1a1a1d] flex-shrink-0 border border-[#FFFFFF14]'>
                          <img
                            src={URL.createObjectURL(photo.file)}
                            alt={photo.name}
                            className='w-full h-full object-cover'
                          />
                        </div>

                        {/* File Info */}
                        <div className='flex-1 min-w-0'>
                          <p className='text-white font-medium truncate text-sm'>
                            {photo.name}
                          </p>
                          <p className='text-gray-400 text-xs mt-1'>
                            {photo.size} MB
                          </p>
                          {photo.status === 'uploading' ? (
                            <div className='mt-2'>
                              <div className='flex items-center gap-2 mb-1'>
                                <div className='flex-1 h-1.5 bg-[#1a1a1d] rounded-full overflow-hidden'>
                                  <div
                                    className='h-full bg-[#F1CB68] transition-all duration-300'
                                    style={{ width: `${photo.progress}%` }}
                                  />
                                </div>
                                <span className='text-xs text-gray-400 min-w-[3rem] text-right'>
                                  {photo.progress}%
                                </span>
                              </div>
                              <span className='text-xs text-[#F1CB68]'>
                                Uploading...
                              </span>
                            </div>
                          ) : photo.status === 'completed' ? (
                            <div className='mt-2 flex items-center gap-2'>
                              <svg
                                width='14'
                                height='14'
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='#10B981'
                                strokeWidth='2'
                              >
                                <path d='M20 6L9 17l-5-5' />
                              </svg>
                              <span className='text-xs text-green-400'>
                                Uploaded
                              </span>
                            </div>
                          ) : photo.status === 'error' ? (
                            <div className='mt-2 flex items-center gap-2'>
                              <svg
                                width='14'
                                height='14'
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='#EF4444'
                                strokeWidth='2'
                              >
                                <circle cx='12' cy='12' r='10' />
                                <path d='M12 8v4M12 16h.01' />
                              </svg>
                              <span className='text-xs text-red-400'>
                                {photo.error || 'Upload failed'}
                              </span>
                            </div>
                          ) : (
                            <div className='mt-2 flex items-center gap-2'>
                              <span className='text-xs text-[#F1CB68]'>
                                Selected
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Remove Button - Cross Icon */}
                        <button
                          onClick={() => removeFile(photo.id, 'photo')}
                          className='text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-lg flex-shrink-0'
                          title='Remove photo'
                        >
                          <svg
                            width='18'
                            height='18'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2.5'
                            strokeLinecap='round'
                          >
                            <path d='M18 6L6 18M6 6l12 12' />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Supporting Documents Section */}
              {supportingDocs.length > 0 && (
                <div className='mb-8'>
                  <h4 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                    <svg
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#F1CB68'
                      strokeWidth='2'
                    >
                      <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                      <polyline points='14 2 14 8 20 8' />
                      <line x1='16' y1='13' x2='8' y2='13' />
                      <line x1='16' y1='17' x2='8' y2='17' />
                      <polyline points='10 9 9 9 8 9' />
                    </svg>
                    Supporting Documents ({supportingDocs.length})
                  </h4>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    {supportingDocs.map(doc => (
                      <div
                        key={doc.id}
                        className='flex items-center gap-4 bg-[#2A2A2D] border border-[#FFFFFF14] rounded-xl p-4 hover:border-[#F1CB68]/50 transition-colors relative group'
                      >
                        {/* PDF/Document Icon */}
                        <div className='w-16 h-16 rounded-lg bg-[#F1CB68]/10 border border-[#F1CB68]/30 flex items-center justify-center flex-shrink-0'>
                          {doc.file.type === 'application/pdf' ? (
                            <svg
                              width='32'
                              height='32'
                              viewBox='0 0 24 24'
                              fill='#F1CB68'
                            >
                              <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z' />
                              <path d='M14 2v6h6' stroke='#F1CB68' fill='none' strokeWidth='1.5' />
                              <text
                                x='12'
                                y='17'
                                fontSize='6'
                                fill='#0B0D12'
                                textAnchor='middle'
                                fontWeight='bold'
                              >
                                PDF
                              </text>
                            </svg>
                          ) : (
                            <svg
                              width='32'
                              height='32'
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='#F1CB68'
                              strokeWidth='2'
                            >
                              <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                              <polyline points='14 2 14 8 20 8' />
                            </svg>
                          )}
                        </div>

                        {/* File Info */}
                        <div className='flex-1 min-w-0'>
                          <p className='text-white font-medium truncate text-sm'>
                            {doc.name}
                          </p>
                          <p className='text-gray-400 text-xs mt-1'>
                            {doc.size} MB
                          </p>
                          {doc.status === 'uploading' ? (
                            <div className='mt-2'>
                              <div className='flex items-center gap-2 mb-1'>
                                <div className='flex-1 h-1.5 bg-[#1a1a1d] rounded-full overflow-hidden'>
                                  <div
                                    className='h-full bg-[#F1CB68] transition-all duration-300'
                                    style={{ width: `${doc.progress}%` }}
                                  />
                                </div>
                                <span className='text-xs text-gray-400 min-w-[3rem] text-right'>
                                  {doc.progress}%
                                </span>
                              </div>
                              <span className='text-xs text-[#F1CB68]'>
                                Uploading...
                              </span>
                            </div>
                          ) : doc.status === 'completed' ? (
                            <div className='mt-2 flex items-center gap-2'>
                              <svg
                                width='14'
                                height='14'
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='#10B981'
                                strokeWidth='2'
                              >
                                <path d='M20 6L9 17l-5-5' />
                              </svg>
                              <span className='text-xs text-green-400'>
                                Uploaded
                              </span>
                            </div>
                          ) : doc.status === 'error' ? (
                            <div className='mt-2 flex items-center gap-2'>
                              <svg
                                width='14'
                                height='14'
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='#EF4444'
                                strokeWidth='2'
                              >
                                <circle cx='12' cy='12' r='10' />
                                <path d='M12 8v4M12 16h.01' />
                              </svg>
                              <span className='text-xs text-red-400'>
                                {doc.error || 'Upload failed'}
                              </span>
                            </div>
                          ) : (
                            <div className='mt-2 flex items-center gap-2'>
                              <span className='text-xs text-[#F1CB68]'>
                                Selected
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Remove Button - Cross Icon */}
                        <button
                          onClick={() => removeFile(doc.id, 'doc')}
                          className='text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-lg flex-shrink-0'
                          title='Remove document'
                        >
                          <svg
                            width='18'
                            height='18'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2.5'
                            strokeLinecap='round'
                          >
                            <path d='M18 6L6 18M6 6l12 12' />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className='flex flex-col sm:flex-row gap-4 justify-end'>
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className='px-6 py-3 rounded-lg border border-[#FFFFFF14] text-white hover:bg-white/5 transition-colors'
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    isSubmitting
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-[#F1CB68] text-[#0B0D12] hover:bg-[#d4b55a]'
                  }`}
                >
                  {isSubmitting ? 'Processing...' : 'Next Step'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 - Asset Valuation */}
        {currentStep === 3 && (
          <div className='max-w-4xl mx-auto'>
            <div className='bg-gradient-to-r from-[#222126] to-[#111116] border border-[#FFFFFF14] rounded-2xl p-6 md:p-8'>
              {/* Title */}
              <div className='mb-8'>
                <h3 className='text-2xl font-semibold text-white mb-2'>
                  How would you like to determine the asset&apos;s value?
                </h3>
                <p className='text-gray-400 text-sm'>
                  Choose one of the two options below to set the current value
                  for your asset.
                </p>
              </div>

              {/* Option 1: Manual Value */}
              <div className='mb-6'>
                <div className='bg-[#2A2A2D] rounded-2xl p-6 border-2 border-transparent hover:border-[#F1CB68]/30 transition-colors'>
                  <h4 className='text-lg font-semibold text-white mb-2'>
                    Enter a Manual Value
                  </h4>
                  <p className='text-gray-400 text-sm mb-6'>
                    Provide your own estimated value for the asset. You can
                    update this later.
                  </p>

                  <div>
                    <label className='block text-sm font-medium text-gray-400 mb-2'>
                      Current Estimated Value ($)
                    </label>
                    <div className='relative'>
                      <span className='absolute left-4 top-1/2 -translate-y-1/2 text-[#F1CB68] font-semibold text-lg'>
                        $
                      </span>
                      <input
                        type='text'
                        value={estimatedValue}
                        onChange={e => setEstimatedValue(e.target.value)}
                        placeholder='00.0'
                        className='w-full pl-10 pr-4 py-3 rounded-lg bg-[#1a1a1d] border border-[#FFFFFF14] text-white text-lg placeholder-gray-600 focus:outline-none focus:border-[#F1CB68] transition-colors'
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* OR Divider */}
              <div className='flex items-center justify-center mb-6'>
                <div className='flex-1 h-px bg-[#FFFFFF14]'></div>
                <span className='px-4 text-gray-500 text-sm font-medium'>
                  OR
                </span>
                <div className='flex-1 h-px bg-[#FFFFFF14]'></div>
              </div>

              {/* Option 2: Professional Appraisal */}
              <div className='mb-8'>
                <div className='bg-[#2A2A2D] rounded-2xl p-6 border-2 border-transparent hover:border-[#F1CB68]/30 transition-colors'>
                  <h4 className='text-lg font-semibold text-white mb-2'>
                    Request a Professional Appraisal
                  </h4>
                  <p className='text-gray-400 text-sm mb-6'>
                    Initiate a formal appraisal process with a certified expert
                    to determine an accurate market value for your asset.
                  </p>

                  <div className='flex items-center gap-3'>
                    <button
                      onClick={() => setValuationType('appraisal')}
                      className='px-6 py-3 bg-[#F1CB68] text-[#0B0D12] rounded-lg font-semibold hover:bg-[#d4b55a] transition-colors'
                    >
                      Request Appraisal
                    </button>
                    <button className='w-8 h-8 rounded-full border border-[#FFFFFF14] flex items-center justify-center text-gray-400 hover:text-white hover:border-[#F1CB68] transition-colors'>
                      <svg
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                      >
                        <circle cx='12' cy='12' r='10' />
                        <path d='M12 16v-4M12 8h.01' />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-[#FFFFFF14]'>
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className='px-6 py-3 rounded-lg border border-[#FFFFFF14] text-white hover:bg-white/5 transition-colors'
                >
                  Back
                </button>
                {submitError && (
                  <div className={`p-4 rounded-lg mb-4 ${
                    isDarkMode ? 'bg-red-900/20 border border-red-500/50 text-red-400' : 'bg-red-50 border border-red-300 text-red-700'
                  }`}>
                    <div className='text-sm whitespace-pre-line'>{submitError}</div>
                  </div>
                )}
                <button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    isSubmitting
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-[#F1CB68] text-[#0B0D12] hover:bg-[#d4b55a]'
                  }`}
                >
                  {isSubmitting ? 'Creating Asset...' : 'Finish'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
