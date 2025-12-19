export default function Stepper({ steps, currentStep }) {
  const getStepStatus = (stepId) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'active';
    return 'pending';
  };

  return (
    <>
      {/* Desktop Stepper */}
      <div className='hidden md:block max-w-4xl mx-auto px-8 pb-8'>
        <div className='relative flex items-center justify-between'>
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            return (
              <div key={step.id} className='flex-1 relative flex items-center'>
                {/* Step Circle and Info */}
                <div className='flex flex-col items-center flex-1'>
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center 
                      font-semibold text-sm mb-2 transition-all
                      ${
                        status === 'completed'
                          ? 'bg-gray-600 text-gray-400'
                          : status === 'active'
                          ? 'bg-akunuba-gold text-akunuba-dark'
                          : 'bg-gray-700 text-gray-400'
                      }
                    `}
                  >
                    {step.id}
                  </div>
                  <span
                    className={`
                      text-sm text-nowrap text-center
                      ${status === 'active' ? 'text-white' : 'text-gray-400'}
                    `}
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

      {/* Mobile Stepper */}
      <div className='md:hidden px-4 pb-6'>
        <div className='flex items-center justify-center'>
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            return (
              <div key={step.id} className='flex items-center'>
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center 
                    text-xs font-semibold
                    ${
                      status === 'completed'
                        ? 'bg-gray-600 text-gray-400'
                        : status === 'active'
                        ? 'bg-akunuba-gold text-akunuba-dark'
                        : 'bg-gray-700 text-gray-400'
                    }
                  `}
                >
                  {step.id}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className='w-8 h-[2px] mx-1'
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
    </>
  );
}

