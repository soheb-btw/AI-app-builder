import { ArrowRight, Sparkles, Code2, Layout, Database, ShoppingBag, Music, Building2, Terminal, Key } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LightRays from '../components/LightRays';
import { SettingsModal, getStoredApiKey } from '../components/SettingsModal';

interface SuggestionItem {
  label: string;
  icon: React.ElementType;
  tag: string;
}

const TEMPLATE_SUGGESTIONS: SuggestionItem[] = [
  { label: "Create a modern Todo app with React & Tailwind", icon: Layout, tag: "React App" },
  { label: "Build a developer portfolio with dark theme", icon: Code2, tag: "Portfolio" },
  { label: "Create a project management API with Express", icon: Database, tag: "Node API" },
  { label: "Design a sleek E-commerce store frontend", icon: ShoppingBag, tag: "E-Commerce" },
  { label: "Build a real estate property listing website", icon: Building2, tag: "Web App" },
  { label: "Create a music streaming audio player dashboard", icon: Music, tag: "Dashboard" }
];

export function Home() {
  const [prompt, setPrompt] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();

  const handleGoToBuilder = () => {
    if (!prompt.trim()) return;

    const apiKey = getStoredApiKey();
    if (!apiKey) {
      setIsSettingsOpen(true);
      return;
    }

    navigate('/builder', { state: { prompt: prompt.trim() } });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGoToBuilder();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleGoToBuilder();
    }
  };

  const hasKey = Boolean(getStoredApiKey());

  return (
    <div className="min-h-screen bg-[#030712] bg-grid-pattern relative flex flex-col justify-between overflow-hidden">
      <LightRays />
      
      {/* Top Navbar */}
      <header className="w-full px-8 py-5 flex items-center justify-between z-20 relative border-b border-white/5 bg-slate-950/40 backdrop-blur-md">
        <div 
          onClick={() => navigate('/')} 
          className="cursor-pointer text-xl font-bold tracking-tight text-white flex items-center gap-2 font-mono group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Terminal className="w-4 h-4" />
          </div>
          <span>BuildB<span className="text-blue-400">🤖</span>t</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
              hasKey
                ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>{hasKey ? 'API Key Configured' : 'Set API Key'}</span>
            <span className={`w-2 h-2 rounded-full ${hasKey ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          </button>

          <span className="text-xs px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            BYOK Engine
          </span>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 z-10 my-auto py-12 flex flex-col items-center">
        
        {/* Badge */}
        <div className="mb-6 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 backdrop-blur-md flex items-center gap-2 text-xs text-slate-300 shadow-xl">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Bring your own OpenRouter API key — zero server billing risk</span>
        </div>

        {/* Hero Section */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-center mb-4 tracking-tight leading-tight">
          What do you want to <span className="text-gradient">build today?</span>
        </h1>
        <p className="text-slate-400 text-center text-lg mb-10 max-w-xl">
          Turn prompts into production-ready code with live interactive previews and instant in-browser compilation.
        </p>

        {/* Prompt Card Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mb-12">
          <div className="relative group rounded-2xl p-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 hover:from-blue-500/40 hover:via-purple-500/40 hover:to-pink-500/40 transition-all duration-300 shadow-2xl">
            <div className="relative bg-slate-950/90 rounded-xl p-4 border border-slate-800/80 backdrop-blur-xl">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe the website or web application you want BuildBot to create..."
                className="w-full h-36 bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none resize-none scrollbar-hide pr-14 leading-relaxed font-sans"
              />
              
              <div className="flex items-center justify-between pt-3 border-t border-slate-900 mt-2">
                <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">⌘</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">Enter</kbd> to submit
                </span>

                <button
                  type="submit"
                  disabled={!prompt.trim()}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 shadow-lg ${
                    prompt.trim()
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30 cursor-pointer scale-100'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                  }`}
                  title="Generate Project"
                >
                  <span>Build Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Suggestion Cards Grid */}
        <div className="w-full max-w-2xl">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-4 font-mono">
            Or try one of these templates
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TEMPLATE_SUGGESTIONS.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => setPrompt(item.label)}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/60 hover:border-slate-700 text-left transition-all duration-200 group cursor-pointer"
                >
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200 transition-colors">
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium line-clamp-1 group-hover:text-white transition-colors">
                      {item.label}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-600 border-t border-white/5 z-20 backdrop-blur-md">
        BuildBot &copy; {new Date().getFullYear()} — Next-Gen AI Web Container App Builder
      </footer>
    </div>
  );
}