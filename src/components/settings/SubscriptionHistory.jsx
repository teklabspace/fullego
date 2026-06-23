'use client';

const rowDate = (r) => r.createdAt || r.created_at || r.date || '—';
const rowChange = (r) => r.action || r.changeType || r.change_type || r.event || '—';
const rowPlan = (r) => r.plan || r.planName || r.plan_name || r.toPlan || r.to_plan || '—';
const rowStatus = (r) => r.status || '—';

export default function SubscriptionHistory({ history, loading, isDarkMode }) {
  return (
    <div
      className={`rounded-2xl p-4 md:p-6 border ${
        isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
      }`}
    >
      <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Subscription history
      </h3>

      {loading && (
        <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Loading history…
        </p>
      )}

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b ${isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'}`}>
              {['Date', 'Change', 'Plan', 'Status'].map((h) => (
                <th
                  key={h}
                  className={`text-left py-3 px-4 text-xs font-semibold uppercase ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.length === 0 && !loading ? (
              <tr>
                <td
                  colSpan={4}
                  className={`py-6 px-4 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  No subscription history.
                </td>
              </tr>
            ) : (
              history.map((r, i) => (
                <tr key={i} className={`border-b last:border-0 ${isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'}`}>
                  <td className={`py-4 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{rowDate(r)}</td>
                  <td className={`py-4 px-4 capitalize ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{rowChange(r)}</td>
                  <td className={`py-4 px-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{rowPlan(r)}</td>
                  <td className="py-4 px-4">
                    <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-semibold">
                      {rowStatus(r)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {history.length === 0 && !loading ? (
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No subscription history.</p>
        ) : (
          history.map((r, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg border ${isDarkMode ? 'bg-white/5 border-[#FFFFFF14]' : 'bg-gray-50 border-gray-200'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{rowDate(r)}</p>
                <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-semibold">
                  {rowStatus(r)}
                </span>
              </div>
              <p className={`text-sm capitalize ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {rowChange(r)} · {rowPlan(r)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
