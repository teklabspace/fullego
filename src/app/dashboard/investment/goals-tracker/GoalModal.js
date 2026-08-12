'use client';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { adjustGoal, createInvestmentGoal } from '@/utils/investmentApi';

// Create / Update-progress modal. `goal` null = create; otherwise a partial
// adjust of the given goal. Completion is decided SERVER-side: when an
// adjust/create pushes current_value >= target_amount the returned goal comes
// back with status "completed" — callers react to that, never compute it here.
export default function GoalModal({ isDarkMode, goal, onClose, onSaved }) {
  const isAdjust = !!goal;
  const [name, setName] = useState(goal?.name || goal?.assetName || '');
  const [symbol, setSymbol] = useState(goal?.symbol || goal?.assetSymbol || '');
  const [targetAmount, setTargetAmount] = useState(
    goal?.targetAmount != null ? String(goal.targetAmount) : ''
  );
  const [targetQuantity, setTargetQuantity] = useState(
    goal?.targetQuantity != null ? String(goal.targetQuantity) : ''
  );
  const [currentValue, setCurrentValue] = useState(
    goal?.currentValue != null ? String(goal.currentValue) : ''
  );
  const [currentQuantity, setCurrentQuantity] = useState(
    goal?.currentQuantity != null ? String(goal.currentQuantity) : ''
  );
  const [monthlyContribution, setMonthlyContribution] = useState(
    goal?.monthlyContribution != null ? String(goal.monthlyContribution) : ''
  );
  const [riskTolerance, setRiskTolerance] = useState(goal?.riskTolerance || '');
  const [targetDate, setTargetDate] = useState(
    goal?.targetDate ? String(goal.targetDate).split('T')[0] : ''
  );
  const [notes, setNotes] = useState(goal?.notes || '');
  const [submitting, setSubmitting] = useState(false);

  const num = (v) => {
    if (v === '' || v === null || v === undefined) return undefined;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : undefined;
  };

  const inputClasses = `w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:border-[#F1CB68] ${
    isDarkMode
      ? 'bg-[#2C2C2E] border-gray-700 text-white placeholder-gray-500'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  }`;
  const labelClasses = `block text-xs font-medium mb-1.5 ${
    isDarkMode ? 'text-gray-400' : 'text-gray-600'
  }`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdjust) {
      if (!name.trim()) {
        toast.error('Give your goal a name.');
        return;
      }
      if (!(num(targetAmount) > 0)) {
        toast.error('Target amount must be greater than zero.');
        return;
      }
    }

    try {
      setSubmitting(true);
      let res;
      if (isAdjust) {
        res = await adjustGoal(goal.id, {
          currentValue: num(currentValue),
          currentQuantity: num(currentQuantity),
          targetAmount: num(targetAmount),
          targetDate: targetDate || undefined,
          monthlyContribution: num(monthlyContribution),
          riskTolerance: riskTolerance || undefined,
          notes: notes.trim() || undefined,
        });
      } else {
        res = await createInvestmentGoal({
          name: name.trim(),
          symbol: symbol.trim().toUpperCase() || undefined,
          targetAmount: num(targetAmount),
          targetQuantity: num(targetQuantity),
          currentValue: num(currentValue),
          currentQuantity: num(currentQuantity),
          monthlyContribution: num(monthlyContribution),
          riskTolerance: riskTolerance || undefined,
          targetDate: targetDate || undefined,
          notes: notes.trim() || undefined,
        });
      }
      onSaved(res?.goal || res?.data?.goal || null, isAdjust);
    } catch (err) {
      toast.error(err.data?.detail || err.message || 'Failed to save goal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className='fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto'
      onClick={onClose}
    >
      <div
        className={`w-full max-w-lg my-auto rounded-2xl border shadow-2xl ${
          isDarkMode ? 'bg-[#1C1C1E] border-[#FFFFFF14]' : 'bg-white border-gray-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
          }`}
        >
          <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {isAdjust ? `Update "${goal?.name || 'Goal'}"` : 'New Investment Goal'}
          </h2>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <path d='M18 6L6 18M6 6l12 12' />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-4 max-h-[70vh] overflow-y-auto'>
          {!isAdjust && (
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <label className={labelClasses}>Goal Name *</label>
                <input
                  type='text'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='e.g. Buy 10 AAPL'
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Symbol (optional)</label>
                <input
                  type='text'
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  placeholder='AAPL, BTCUSD'
                  className={inputClasses}
                />
              </div>
            </div>
          )}

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label className={labelClasses}>
                Target Amount ($){!isAdjust && ' *'}
              </label>
              <input
                type='number'
                min='0'
                step='any'
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder='1000'
                className={inputClasses}
              />
            </div>
            <div>
              <label className={labelClasses}>Current Value ($)</label>
              <input
                type='number'
                min='0'
                step='any'
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                placeholder='0'
                className={inputClasses}
              />
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {!isAdjust && (
              <div>
                <label className={labelClasses}>Target Quantity</label>
                <input
                  type='number'
                  min='0'
                  step='any'
                  value={targetQuantity}
                  onChange={(e) => setTargetQuantity(e.target.value)}
                  placeholder='10'
                  className={inputClasses}
                />
              </div>
            )}
            <div>
              <label className={labelClasses}>Current Quantity</label>
              <input
                type='number'
                min='0'
                step='any'
                value={currentQuantity}
                onChange={(e) => setCurrentQuantity(e.target.value)}
                placeholder='0'
                className={inputClasses}
              />
            </div>
            <div>
              <label className={labelClasses}>Monthly Contribution ($)</label>
              <input
                type='number'
                min='0'
                step='any'
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                placeholder='100'
                className={inputClasses}
              />
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label className={labelClasses}>Risk Tolerance</label>
              <select
                value={riskTolerance}
                onChange={(e) => setRiskTolerance(e.target.value)}
                className={inputClasses}
              >
                <option value=''>Not set</option>
                <option value='low'>Low</option>
                <option value='medium'>Medium</option>
                <option value='high'>High</option>
              </select>
            </div>
            <div>
              <label className={labelClasses}>Target Date</label>
              <input
                type='date'
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder='Optional notes about this goal'
              className={`${inputClasses} resize-none`}
            />
          </div>

          <div className='flex gap-3 pt-2'>
            <button
              type='button'
              onClick={onClose}
              className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-all ${
                isDarkMode
                  ? 'border-[#FFFFFF22] text-white hover:bg-white/5'
                  : 'border-gray-300 text-gray-900 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={submitting}
              className='flex-1 py-3 rounded-lg text-sm font-bold bg-[#F1CB68] text-black hover:bg-[#F1CB68]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {submitting ? 'Saving' : isAdjust ? 'Save Progress' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
