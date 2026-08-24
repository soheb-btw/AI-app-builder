import { ArrowRight, Sparkles, Code2, Layout, Database, ShoppingBag, Music, Building2, Terminal, Key, Play, Film, ChevronDown } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LightRays from '../components/LightRays';
import { SettingsModal, getStoredApiKey } from '../components/SettingsModal';
import { WelcomeDemoModal } from '../components/WelcomeDemoModal';

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
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
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

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsVideoPlaying(true);
    }
  };

  const handleVideoPause = () => {
    setIsVideoPlaying(false);
  };

  const hasKey = Boolean(getStoredApiKey());

  return (
    <div className="min-h-screen bg-[#030712] bg-grid-pattern relative flex flex-col overflow-hidden">
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
      <div className="max-w-4xl mx-auto px-4 z-10 py-16 flex flex-col items-center">
        
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
                  Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">⌘ / Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">Enter</kbd> to submit
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="relative flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 bg-slate-900 border border-blue-500/40 hover:border-blue-400 hover:bg-slate-800 text-blue-300 hover:text-white shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] cursor-pointer overflow-hidden group"
                  >
                    {/* Shimmer effect */}
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.1) 50%, transparent 100%)', animation: 'shimmer 1.5s infinite' }} />
                    
                    {/* Pulsing Dot */}
                    <span className="relative flex h-2 w-2 mr-0.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                    </span>
                    
                    <Play className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors" fill="currentColor" />
                    <span className="relative z-10">Watch Demo</span>
                  </button>

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

      {/* ===== Hero Demo Video Section ===== */}
      <section id="demo" className="relative z-10 w-full py-20 px-4">
        {/* Section Divider Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-5">
              <Film className="w-3.5 h-3.5" />
              <span>Live Demo</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
              See it in <span className="text-gradient">action</span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-lg mx-auto">
              Watch how BuildBot transforms a simple text prompt into a fully functional web application — in real time.
            </p>
          </div>

          {/* Video Player Container */}
          <div className="relative group max-w-4xl mx-auto">
            {/* Animated gradient border */}
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 opacity-60 group-hover:opacity-100 transition-opacity duration-500 blur-[1px]" />
            
            {/* Outer glow effect */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl" />

            {/* Video Frame */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80">
              
              {/* Fake Browser Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/90 border-b border-slate-800/60">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 rounded-lg bg-slate-800/60 border border-slate-700/40 text-xs text-slate-400 font-mono flex items-center gap-2 max-w-xs w-full justify-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-400/60" />
                    buildbot.app — Demo
                  </div>
                </div>
                <div className="w-[52px]" /> {/* Spacer to balance the traffic lights */}
              </div>

              {/* Video Area */}
              <div className="relative aspect-video bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
                {/* Video element — replace src with your recorded mp4 */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  onPause={handleVideoPause}
                  onEnded={handleVideoPause}
                  playsInline
                  // src="/demo.mp4"  ← Uncomment and set path when video is ready
                >
                  {/* <source src="/demo.mp4" type="video/mp4" /> */}
                </video>

                {/* Placeholder overlay (shown when no video / video paused) */}
                {!isVideoPlaying && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {/* Decorative background pattern */}
                    <div className="absolute inset-0 bg-grid-pattern opacity-30" />
                    
                    {/* Pulsing rings behind the play button */}
                    <div className="relative">
                      <div className="absolute inset-0 w-20 h-20 -m-2 rounded-full bg-blue-500/20 animate-ping" style={{ animationDuration: '2s' }} />
                      <div className="absolute inset-0 w-20 h-20 -m-2 rounded-full bg-blue-500/10 animate-ping" style={{ animationDuration: '3s' }} />
                      
                      {/* Play Button */}
                      <button
                        onClick={handlePlayVideo}
                        className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 hover:scale-110 hover:shadow-blue-500/50 transition-all duration-300 cursor-pointer z-10"
                      >
                        <Play className="w-6 h-6 ml-1" fill="currentColor" />
                      </button>
                    </div>

                    <p className="mt-6 text-sm text-slate-400 font-medium">
                      Demo video coming soon
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Prompt → Code → Live Preview in seconds
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Feature highlights below video */}
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
            {[
              { label: "AI-Powered Generation", desc: "Describe what you want, get working code" },
              { label: "Live Preview", desc: "See your app render in real-time" },
              { label: "Full Code Access", desc: "Edit, export, and deploy instantly" },
            ].map((feat, i) => (
              <div key={i} className="text-center p-4 rounded-xl bg-slate-900/30 border border-slate-800/40">
                <div className="text-sm font-semibold text-slate-200 mb-1">{feat.label}</div>
                <div className="text-xs text-slate-500">{feat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Settings Modal */}
      <WelcomeDemoModal />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-600 border-t border-white/5 z-20 backdrop-blur-md">
        BuildBot &copy; {new Date().getFullYear()} — Next-Gen AI Web Container App Builder
      </footer>
    </div>
  );
}