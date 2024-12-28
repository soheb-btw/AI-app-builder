import { Step } from '../types';

interface StepsListProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (index: number) => void;
}

export function StepsList({ steps, currentStep, onStepClick }: StepsListProps) {
  return (
    <div className="p-4 space-y-3">
      {steps.map((step, index) => (
        <div
          key={index}
          onClick={() => onStepClick(index)}
          className={`
            relative p-4 rounded-lg cursor-pointer
            transition-all duration-200 ease-in-out
            hover:bg-gray-800/50 
            ${currentStep === index 
              ? 'bg-gray-800/70 border-l-4 border-blue-500 shadow-lg' 
              : 'bg-gray-900/40'
            }
          `}
        >
          <div className="flex items-center gap-3">
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center text-sm
              ${currentStep === index 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-700 text-gray-300'
              }
            `}>
              {index + 1}
            </div>

            <div className="flex-1">
              <h3 className={`
                font-medium
                ${currentStep === index 
                  ? 'text-white' 
                  : 'text-gray-300'
                }
              `}>
                {step.title || `Step ${index + 1}`}
              </h3>
              {step.description && (
                <p className="text-sm text-gray-400 line-clamp-2">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}