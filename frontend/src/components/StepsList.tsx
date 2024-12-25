import React from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { Step } from '../types';

interface StepsListProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
}

export function StepsList({ steps, currentStep, onStepClick }: StepsListProps) {
  return (
    <div className="p-2">
      <h2 className="text-base font-semibold text-gray-100 h-full">Build Steps</h2>
      <div className="">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex flex-col gap-2 cursor-pointer transition-colors ${currentStep === step.id
                ? 'bg-gray-800 border border-gray-700'
                : 'hover:bg-gray-800'
              }`}
            onClick={() => onStepClick(step.id)}
          >
            <div className="flex gap-2 text-sm items-center bg-[#1e1e1e] rounded-md p-1">
              {step.status === 'completed' ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : step.status === 'pending' ? (
                <Clock className="w-4 h-4 text-blue-400" />
              ) : (
                <Circle className="w-4 h-4 text-gray-600" />
              )}
              <h3 className="font-medium text-gray-100">{step.title}</h3>
            </div>
            <p className="text-sm text-gray-400">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}