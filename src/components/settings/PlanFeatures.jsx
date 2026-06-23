'use client';

// Normalize the permissions payload (array OR object map) into string labels.
const toFeatureList = (permissions) => {
  if (!permissions) return [];
  if (Array.isArray(permissions)) {
    return permissions.map((p) => (typeof p === 'string' ? p : p?.label || p?.name || p?.permission)).filter(Boolean);
  }
  if (typeof permissions === 'object') {
    return Object.entries(permissions)
      .filter(([, v]) => Boolean(v))
      .map(([k]) => k);
  }
  return [];
};

export default function PlanFeatures({ permissions, loading, isDarkMode }) {
  const features = toFeatureList(permissions);

  return (
    <div
      className={`rounded-2xl p-4 md:p-6 border ${
        isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
      }`}
    >
      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Plan features
      </h3>

      {loading ? (
        <div className="animate-pulse space-y-2">
          <div className={`h-3 w-48 rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
          <div className={`h-3 w-40 rounded ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`} />
        </div>
      ) : features.length === 0 ? (
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Feature details are not available for your current plan.
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {features.map((f, i) => (
            <li
              key={i}
              className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
            >
              <span className="text-[#F1CB68]">✓</span>
              <span className="capitalize">{String(f).replace(/[:_]/g, ' ')}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
