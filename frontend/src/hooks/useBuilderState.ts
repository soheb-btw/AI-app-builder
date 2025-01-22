import { useState } from 'react';
import { Step, FileItem } from '../types';

export function useBuilderState() {
  const [userPrompt, setPrompt] = useState("");
  const [llmMessages, setLlmMessages] = useState<{ role: "user" | "assistant", content: string; }[]>([]);
  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [error, setError] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');

  return {
    userPrompt,
    setPrompt,
    llmMessages,
    setLlmMessages,
    loading,
    setLoading,
    templateSet,
    setTemplateSet,
    currentStep,
    setCurrentStep,
    selectedFile,
    setSelectedFile,
    steps,
    setSteps,
    files,
    setFiles,
    error,
    setError,
    activeTab,
    setActiveTab
  };
} 