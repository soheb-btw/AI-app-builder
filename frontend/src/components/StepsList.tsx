import { CheckCircle2, Circle, Clock, Code2, Terminal, FolderPlus } from 'lucide-react';
import { Step, StepType } from '../types';

interface StepsListProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (index: number) => void;
}

export function StepsList({ steps, currentStep, onStepClick }: StepsListProps) {
  const getStepIcon = (step: Step) => {
    if (step.status === 'completed') {
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    }
    if (step.type === StepType.CreateFile) {
      return <Code2 className="w-4 h-4 text-blue-400" />;
    }
    if (step.type === StepType.RunScript) {
      return <Terminal className="w-4 h-4 text-purple-400" />;
    }
    if (step.type === StepType.CreateFolder) {
      return <FolderPlus className="w-4 h-4 text-amber-400" />;
    }
    return <Clock className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="p-4 space-y-2.5">
      <div className="flex items-center justify-between px-1 mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
          Build Pipeline
        </h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
          {steps.filter(s => s.status === 'completed').length} / {steps.length} Done
        </span>
      </div>

      <div className="relative border-l border-slate-800 ml-3 pl-4 space-y-2">
        {steps.map((step, index) => {
          const isSelected = currentStep === index;
          const isCompleted = step.status === 'completed';

          return (
            <div
              key={index}
              onClick={() => onStepClick(index)}
              className={`
                group relative p-3 rounded-xl cursor-pointer
                transition-all duration-200 border
                ${isSelected 
                  ? 'bg-slate-900/90 border-blue-500/50 shadow-lg shadow-blue-500/10' 
                  : isCompleted
                  ? 'bg-slate-950/40 border-slate-900 hover:border-slate-800 hover:bg-slate-900/40'
                  : 'bg-slate-950/20 border-slate-900/50 opacity-70 hover:opacity-100'
                }
              `}
            >
              {/* Timeline Connector Dot */}
              <div 
                className={`
                  absolute -left-[23px] top-4 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-colors
                  ${isCompleted 
                    ? 'bg-emerald-500 border-emerald-500 text-slate-950' 
                    : isSelected 
                    ? 'bg-blue-500 border-blue-400 ring-4 ring-blue-500/20' 
                    : 'bg-slate-900 border-slate-700'
                  }
                `}
              />

              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0">
                  {getStepIcon(step)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4 className={`
                      text-xs font-semibold truncate
                      ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}
                    `}>
                      {step.title || `Step ${index + 1}`}
                    </h4>
                    
                    {step.path && (
                      <span className="text-[10px] font-mono text-slate-500 truncate max-w-[90px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                        {step.path.split('/').pop()}
                      </span>
                    )}
                  </div>

                  {step.description && (
                    <p className="text-[11px] text-slate-400 line-clamp-1 leading-relaxed">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}