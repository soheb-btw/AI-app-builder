import React, { useState, useEffect, useRef } from 'react';
import { X, Film, Play } from 'lucide-react';

export function WelcomeDemoModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Show modal shortly after load
  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if user has already seen it this session (optional, but good UX)
      if (!sessionStorage.getItem('demo_seen')) {
        setIsOpen(true);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    sessionStorage.setItem('demo_seen', 'true');
    setIsClosing(true);

    // Wait for animation to finish before unmounting
    setTimeout(() => {
      setIsOpen(false);
    }, 800);
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

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center pointer-events-none transition-all duration-800 ease-in-out ${isClosing ? 'bg-transparent' : 'bg-slate-950/60 backdrop-blur-sm'
        }`}
    >
      <div
        className={`relative w-full max-w-7xl mx-4 pointer-events-auto transition-all duration-800 origin-center ${isClosing
            ? 'opacity-0 scale-50 translate-y-[50vh]' // Animates down and shrinks
            : 'opacity-100 scale-100 translate-y-0'
          }`}
      >
        {/* Animated border glow */}
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-pink-500/50 opacity-100 blur-[2px]" />

        {/* Modal Container */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl shadow-blue-500/20">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5 mr-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="px-3 py-1 rounded-md bg-slate-800/60 border border-slate-700/40 text-xs text-slate-400 font-mono flex items-center gap-2">
                <Film className="w-3.5 h-3.5 text-blue-400" />
                Quick Demo
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Video Area */}
          <div className="relative aspect-video bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              onPause={handleVideoPause}
              onEnded={handleVideoPause}
              playsInline
            // src="/demo.mp4"
            />

            {!isVideoPlaying && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-grid-pattern opacity-30" />

                <div className="relative">
                  <div className="absolute inset-0 w-20 h-20 -m-2 rounded-full bg-blue-500/20 animate-ping" style={{ animationDuration: '2s' }} />
                  <div className="absolute inset-0 w-20 h-20 -m-2 rounded-full bg-blue-500/10 animate-ping" style={{ animationDuration: '3s' }} />

                  <button
                    onClick={handlePlayVideo}
                    className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 hover:scale-110 hover:shadow-blue-500/50 transition-all duration-300 cursor-pointer z-10"
                  >
                    <Play className="w-6 h-6 ml-1" fill="currentColor" />
                  </button>
                </div>
                <p className="mt-6 text-sm text-slate-300 font-medium z-10">See how BuildBot works</p>
                <p className="mt-1 text-xs text-slate-500 z-10">Takes less than a minute</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
