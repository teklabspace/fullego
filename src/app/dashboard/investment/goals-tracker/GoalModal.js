'use client';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { adjustGoal, createInvestmentGoal } from '@/utils/investmentApi';
import {
  MONEY_PRECISION,
  QUANTITY_PRECISION,
  sanitizeDecimal,
  sanitizeSymbol,
  sanitizeText,
  validateAmount,
  validateQuantity,
  validateText,
} from '@/utils/validation';

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

  // investment_goals column shapes: name String(255), symbol String(50),
  // target_amount / current_value / monthly_contribution Numeric(20, 2),
  // target_quantity / current_quantity Numeric(20, 8), notes String(1000).
  const onMoney = setter => e =>
    setter(
      sanitizeDecimal(e.target.value, {
        decimals: MONEY_PRECISION.decimals,
        intDigits: MONEY_PRECISION.intDigits,
      })
    );

  const onQty = setter => e =>
    setter(
      sanitizeDecimal(e.target.value, {
        decimals: QUANTITY_PRECISION.decimals,
        intDigits: QUANTITY_PRECISION.intDigits,
      })
    );

  const goalErrors = {
    name: isAdjust ? null : validateText(name, { label: 'Goal name', maxLen: 255, minLen: 2 }),
    targetAmount: validateAmount(targetAmount, {
      label: 'Target amount',
      allowZero: isAdjust,
    }),
    currentValue: validateAmount(currentValue, {
      label: 'Current value',
      allowZero: true,
    }),
    targetQuantity: validateQuantity(targetQuantity, {
      label: 'Target quantity',
      allowZero: true,
    }),
    currentQuantity: validateQuantity(currentQuantity, {
      label: 'Current quantity',
      allowZero: true,
    }),
    monthlyContribution: validateAmount(monthlyContribution, {
      label: 'Monthly contribution',
      allowZero: true,
    }),
    notes: validateText(notes, { label: 'Notes', maxLen: 1000 }),
  };

  const hasGoalError = Object.values(goalErrors).some(Boolean);
  const errClass = 'mt-1.5 text-xs text-red-400';
  const fieldCls = key =>
    `${inputClasses} ${goalErrors[key] ? 'border-red-500' : ''}`;
  const fieldMsg = key =>
    goalErrors[key] ? <p className={errClass}>{goalErrors[key]}</p> : null;

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

    // Format rules (precision, length) on top of the two required-field checks.
    if (hasGoalError) {
      toast.error('Please correct the highlighted fields.');
      return;
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
                  onChange={(e) =>
                    setName(sanitizeText(e.target.value, { maxLen: 255 }))
                  }
                  maxLength={255}
                  placeholder='e.g. Buy 10 AAPL'
                  className={fieldCls('name')}
                />
                {fieldMsg('name')}
              </div>
              <div>
                <label className={labelClasses}>Symbol (optional)</label>
                <input
                  type='text'
                  value={symbol}
                  onChange={(e) => setSymbol(sanitizeSymbol(e.target.value))}
                  maxLength={50}
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
                type='text'
                inputMode='decimal'
                value={targetAmount}
                onChange={onMoney(setTargetAmount)}
                placeholder='1000'
                className={fieldCls('targetAmount')}
              />
              {fieldMsg('targetAmount')}
            </div>
            <div>
              <label className={labelClasses}>Current Value ($)</label>
              <input
                type='text'
                inputMode='decimal'
                value={currentValue}
                onChange={onMoney(setCurrentValue)}
                placeholder='0'
                className={fieldCls('currentValue')}
              />
              {fieldMsg('currentValue')}
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {!isAdjust && (
              <div>
                <label className={labelClasses}>Target Quantity</label>
                <input
                  type='text'
                  inputMode='decimal'
                  value={targetQuantity}
                  onChange={onQty(setTargetQuantity)}
                  placeholder='10'
                  className={fieldCls('targetQuantity')}
                />
                {fieldMsg('targetQuantity')}
              </div>
            )}
            <div>
              <label className={labelClasses}>Current Quantity</label>
              <input
                type='text'
                inputMode='decimal'
                value={currentQuantity}
                onChange={onQty(setCurrentQuantity)}
                placeholder='0'
                className={fieldCls('currentQuantity')}
              />
              {fieldMsg('currentQuantity')}
            </div>
            <div>
              <label className={labelClasses}>Monthly Contribution ($)</label>
              <input
                type='text'
                inputMode='decimal'
                value={monthlyContribution}
                onChange={onMoney(setMonthlyContribution)}
                placeholder='100'
                className={fieldCls('monthlyContribution')}
              />
              {fieldMsg('monthlyContribution')}
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
              onChange={(e) =>
                setNotes(sanitizeText(e.target.value, { maxLen: 1000 }))
              }
              maxLength={1000}
              rows={2}
              placeholder='Optional notes about this goal'
              className={`${fieldCls('notes')} resize-none`}
            />
            {fieldMsg('notes')}
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
              disabled={submitting || hasGoalError}
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
