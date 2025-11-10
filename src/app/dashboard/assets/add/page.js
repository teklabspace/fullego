'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import {
  allCategories,
  getCategoryGroup,
  getFormFieldsForCategory,
  getCategoriesByGroup,
  getCategoryGroups,
} from '@/config/assetConfig';
import { getCategoryIcon } from '@/utils/categoryIcons';

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
  if (lowerName.includes('price') || lowerName.includes('value') || lowerName.includes('cost') || lowerName.includes('owed')) return 'currency';
  if (lowerName.includes('rate') || lowerName.includes('interest')) return 'percentage';
  if (lowerName.includes('description') || lowerName.includes('notes') || lowerName.includes('purpose')) return 'textarea';
  if (lowerName.includes('image')) return 'file';
  if (lowerName.includes('condition')) return 'select';
  if (lowerName.includes('ownership type')) return 'select';
  if (lowerName.includes('risk level')) return 'select';
  if (lowerName.includes('payment frequency')) return 'select';
  if (lowerName.includes('currency')) return 'select';
  if (lowerName.includes('type') && !lowerName.includes('ownership')) return 'select';
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

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit form - Step 3 is the final step
      console.log('Form Data:', {
        ...formData,
        category: selectedCategory,
        categoryGroup: selectedCategoryGroup,
        assetPhotos: assetPhotos.length,
        supportingDocs: supportingDocs.length,
        valuationType,
        estimatedValue,
      });
      // You can add API call here to save the asset
      router.push('/dashboard/assets');
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
      error: null,
    }));

    if (type === 'photo') {
      setAssetPhotos(prev => [...prev, ...newFiles]);
      // Simulate upload progress
      newFiles.forEach(fileObj => {
        simulateUpload(fileObj.id, type);
      });
    } else {
      setSupportingDocs(prev => [...prev, ...newFiles]);
      newFiles.forEach(fileObj => {
        simulateUpload(fileObj.id, type);
      });
    }
  };

  const simulateUpload = (fileId, type) => {
    const interval = setInterval(() => {
      if (type === 'photo') {
        setAssetPhotos(prev =>
          prev.map(file => {
            if (file.id === fileId) {
              const newProgress = Math.min(file.progress + 10, 100);
              if (newProgress === 100) clearInterval(interval);
              return { ...file, progress: newProgress };
            }
            return file;
          })
        );
      } else {
        setSupportingDocs(prev =>
          prev.map(file => {
            if (file.id === fileId) {
              const newProgress = Math.min(file.progress + 10, 100);
              if (newProgress === 100) clearInterval(interval);
              return { ...file, progress: newProgress };
            }
            return file;
          })
        );
      }
    }, 200);
  };

  const removeFile = (fileId, type) => {
    if (type === 'photo') {
      setAssetPhotos(prev => prev.filter(file => file.id !== fileId));
    } else {
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
        <div key={fieldKey} className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
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
            value={selectedCategory ? allCategories.find(c => c.id === selectedCategory)?.name || '' : ''}
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
              className='w-full px-4 py-3 rounded-lg bg-[#2A2A2D] border border-[#FFFFFF14] text-white focus:outline-none focus:border-[#F1CB68] transition-colors appearance-none cursor-pointer'
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
                <button className='px-6 py-3 rounded-xl bg-[#F1CB68] text-[#0B0D12] font-semibold hover:bg-[#d4b55a] transition-colors flex items-center gap-2 justify-center'>
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
            <div className='bg-gradient-to-r from-[#222126] to-[#111116] border border-[#FFFFFF14] rounded-2xl p-6 md:p-8 max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar'>
              {/* Category Groups */}
              {filteredCategoriesByGroup.map(({ groupName, categories }) => {
                const isExpanded = expandedGroups[groupName] ?? true; // Default to expanded
                    const hasSelectedCategory = categories.some(
                      cat => cat.id === selectedCategory
                    );

                // Get group display name
                const getGroupDisplayName = (name) => {
                  const groupMap = {
                    'Assets': 'Physical, Alternative, Lifestyle',
                    'Portfolio': 'Financial, Digital, Structured',
                    'Liabilities': 'Liabilities & Debts',
                    'Shadow Wealth': 'Shadow & Anticipated Wealth',
                    'Philanthropy': 'Philanthropy & Impact',
                    'Lifestyle': 'Lifestyle & Concierge',
                    'Governance': 'Compliance & Governance',
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
                                    filter: 'brightness(0) saturate(100%) invert(77%) sepia(48%) saturate(1352%) hue-rotate(358deg) brightness(101%) contrast(96%)',
                                  }}
                                    />
                                  ) : (
                                <div className='w-12 h-12 flex items-center justify-center text-[#F1CB68] transition-transform group-hover:scale-110'>
                                  {(() => {
                                    const IconComponent = getCategoryIcon(category.id);
                                    return <IconComponent className='w-12 h-12' />;
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
                      const category = allCategories.find(c => c.id === selectedCategory);
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
                        return <IconComponent className='w-6 h-6 text-[#F1CB68]' />;
                      }
                    })()}
                      </div>
                      <div className='flex-1'>
                        <p className='text-xs text-gray-400 mb-1'>
                          Selected Category
                        </p>
                        <p className='text-white font-semibold'>
                          {
                            allCategories.find(c => c.id === selectedCategory)
                              ?.name
                          }
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
                  disabled={!selectedCategory}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    selectedCategory
                      ? 'bg-[#F1CB68] text-[#0B0D12] hover:bg-[#d4b55a]'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Next Step
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
                <h3 className='text-xl font-semibold text-white mb-2'>
                  Upload Photos & Documents
                </h3>
                <p className='text-gray-400 text-sm mb-6'>
                  Provide clear photos of proof of ownership for your asset.
                  High-resolution images are recommended.
                </p>

                {/* Drag & Drop Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={e => handleDrop(e, 'photo')}
                  className={`border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-colors ${
                    isDragging
                      ? 'border-[#F1CB68] bg-[#F1CB68]/5'
                      : 'border-[#FFFFFF14] hover:border-[#F1CB68]/50'
                  }`}
                >
                  <div className='flex flex-col items-center'>
                    {/* Cloud Icon */}
                    <div className='mb-4'>
                      <svg
                        width='64'
                        height='64'
                        viewBox='0 0 64 64'
                        fill='none'
                        stroke='#F1CB68'
                        strokeWidth='2'
                      >
                        <path d='M32 20v24M32 20l-8 8M32 20l8 8' />
                        <path d='M16 40c-4 0-8-4-8-8s4-8 8-8c0-8 8-16 16-16s16 8 16 16c4 0 8 4 8 8s-4 8-8 8' />
                      </svg>
                    </div>

                    <p className='text-white text-lg mb-2'>
                      Drag & drop files here, or click to browser
                    </p>
                    <p className='text-gray-400 text-sm mb-6'>
                      Supports: JPG/PNG/PDF Max file size: 10MB
                    </p>

                    <input
                      type='file'
                      id='file-upload'
                      multiple
                      accept='image/*,application/pdf'
                      onChange={e => handleFileSelect(e, 'photo')}
                      className='hidden'
                    />
                    <label
                      htmlFor='file-upload'
                      className='px-6 py-3 bg-[#F1CB68] text-[#0B0D12] rounded-lg font-semibold cursor-pointer hover:bg-[#d4b55a] transition-colors'
                    >
                      Select files
                    </label>
                  </div>
                </div>
              </div>

              {/* Assets Photos Section */}
              {assetPhotos.length > 0 && (
                <div className='mb-8'>
                  <h4 className='text-lg font-semibold text-white mb-4'>
                    Assets Photos
                  </h4>
                  <div className='space-y-3'>
                    {assetPhotos.map(photo => (
                      <div
                        key={photo.id}
                        className='flex items-center gap-4 bg-[#2A2A2D] rounded-xl p-4'
                      >
                        {/* Thumbnail */}
                        <div className='w-16 h-16 rounded-lg overflow-hidden bg-[#1a1a1d] flex-shrink-0'>
                          <img
                            src={URL.createObjectURL(photo.file)}
                            alt={photo.name}
                            className='w-full h-full object-cover'
                          />
                        </div>

                        {/* File Info */}
                        <div className='flex-1 min-w-0'>
                          <p className='text-white font-medium truncate'>
                            {photo.name}
                          </p>
                          <p className='text-gray-400 text-sm'>
                            {photo.size} Mb
                          </p>

                          {/* Progress Bar */}
                          {photo.progress < 100 ? (
                            <div className='mt-2'>
                              <div className='flex items-center gap-2 mb-1'>
                                <span className='text-xs text-gray-400'>
                                  Uploading... ({photo.progress}%)
                                </span>
                              </div>
                              <div className='w-full h-1.5 bg-[#1a1a1d] rounded-full overflow-hidden'>
                                <div
                                  className='h-full bg-[#F1CB68] transition-all duration-300'
                                  style={{ width: `${photo.progress}%` }}
                                />
                              </div>
                            </div>
                          ) : null}
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => removeFile(photo.id, 'photo')}
                          className='text-red-500 hover:text-red-400 transition-colors p-2'
                        >
                          <svg
                            width='20'
                            height='20'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                          >
                            <path d='M3 6h18M8 6V4h8v2M19 6v14H5V6h14z' />
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
                  <h4 className='text-lg font-semibold text-white mb-4'>
                    Supporting Documents
                  </h4>
                  <div className='space-y-3'>
                    {supportingDocs.map(doc => (
                      <div
                        key={doc.id}
                        className='flex items-center gap-4 bg-[#2A2A2D] rounded-xl p-4'
                      >
                        {/* PDF Icon */}
                        <div className='w-16 h-16 rounded-lg bg-[#F1CB68]/10 flex items-center justify-center flex-shrink-0'>
                          <svg
                            width='32'
                            height='32'
                            viewBox='0 0 24 24'
                            fill='#F1CB68'
                          >
                            <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z' />
                            <path d='M14 2v6h6' stroke='#F1CB68' fill='none' />
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
                        </div>

                        {/* File Info */}
                        <div className='flex-1 min-w-0'>
                          <p className='text-white font-medium truncate'>
                            {doc.name}
                          </p>
                          <p className='text-gray-400 text-sm'>{doc.size} Mb</p>

                          {/* Progress Bar or Error */}
                          {doc.progress < 100 ? (
                            <div className='mt-2'>
                              <div className='flex items-center gap-2 mb-1'>
                                <span className='text-xs text-gray-400'>
                                  Uploading... ({doc.progress}%)
                                </span>
                              </div>
                              <div className='w-full h-1.5 bg-[#1a1a1d] rounded-full overflow-hidden'>
                                <div
                                  className='h-full bg-[#F1CB68] transition-all duration-300'
                                  style={{ width: `${doc.progress}%` }}
                                />
                              </div>
                            </div>
                          ) : doc.error ? (
                            <p className='text-xs text-red-500 mt-1'>
                              Error: File too large
                            </p>
                          ) : null}
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => removeFile(doc.id, 'doc')}
                          className='text-red-500 hover:text-red-400 transition-colors p-2'
                        >
                          <svg
                            width='20'
                            height='20'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                          >
                            <path d='M3 6h18M8 6V4h8v2M19 6v14H5V6h14z' />
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
                  className='px-6 py-3 rounded-lg bg-[#F1CB68] text-[#0B0D12] font-semibold hover:bg-[#d4b55a] transition-colors'
                >
                  Next Step
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
                <button
                  onClick={handleNext}
                  className='px-6 py-3 rounded-lg bg-[#F1CB68] text-[#0B0D12] font-semibold hover:bg-[#d4b55a] transition-colors'
                >
                  Finish
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
