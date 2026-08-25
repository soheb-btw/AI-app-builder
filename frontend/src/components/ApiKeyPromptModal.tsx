import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Key, Play, Sparkles, Layout } from 'lucide-react';

interface ApiKeyPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export function ApiKeyPromptModal({ isOpen, onClose, onOpenSettings }: ApiKeyPromptModalProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5 font-mono text-sm font-semibold text-white">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Key className="w-4 h-4" />
            </div>
            API Key Required
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          <p className="text-slate-300 text-sm leading-relaxed">
            To build custom apps from your prompt, you need to configure an OpenRouter API key. 
            Alternatively, you can explore our zero-cost demo options below!
          </p>

          <div className="space-y-3">
            {/* Option 1: Set API Key */}
            <button
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 transition-colors group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-blue-100">Configure API Key</div>
                  <div className="text-xs text-blue-300/70 mt-0.5">Bring your own key to build anything</div>
                </div>
              </div>
            </button>

            {/* Option 2: Demo Apps */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/builder', { state: { prompt: "Create a modern Todo app with React & Tailwind", isDemo: true, demoType: 'todo' } })}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-slate-700 transition-colors group"
              >
                <Layout className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-slate-300">Try Todo Demo</span>
              </button>
              
              <button
                onClick={() => navigate('/builder', { state: { prompt: "Design a sleek Weather App dashboard", isDemo: true, demoType: 'weather' } })}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-slate-700 transition-colors group"
              >
                <Sparkles className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-slate-300">Try Weather Demo</span>
              </button>
            </div>

            {/* Option 3: Watch Video */}
            <button
              onClick={() => {
                onClose();
                document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors text-slate-300 text-sm font-medium"
            >
              <Play className="w-4 h-4 text-slate-400" fill="currentColor" />
              Watch Video Demo
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
