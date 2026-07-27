import { useState } from 'react';
import { Lock, RotateCw, ExternalLink, Monitor, Smartphone, Tablet, Loader2 } from 'lucide-react';

interface PreviewFrameProps {
  url: string;
}

type ViewportMode = 'desktop' | 'tablet' | 'mobile';

export function PreviewFrame({ url }: PreviewFrameProps) {
  const [key, setKey] = useState(0);
  const [viewport, setViewport] = useState<ViewportMode>('desktop');

  const handleRefresh = () => {
    setKey(prev => prev + 1);
  };

  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile':
        return 'max-w-[375px]';
      case 'tablet':
        return 'max-w-[768px]';
      default:
        return 'w-full';
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-hidden shadow-2xl">
      {/* Mock Browser Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          {/* Window Controls */}
          <div className="flex items-center gap-1.5 mr-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>

          <button
            onClick={handleRefresh}
            disabled={!url}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-40"
            title="Reload Preview"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Address Bar */}
        <div className="flex-1 max-w-xl mx-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-[11px] truncate shadow-inner">
          <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="truncate select-all">
            {url || 'https://webcontainer-dev-server.local'}
          </span>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-1">
          <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800 mr-2">
            <button
              onClick={() => setViewport('desktop')}
              className={`p-1 rounded ${viewport === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`p-1 rounded ${viewport === 'tablet' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="Tablet View"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-1 rounded ${viewport === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="Mobile View"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {url && (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 w-full bg-slate-950 flex items-center justify-center p-2 overflow-hidden relative">
        {!url ? (
          <div className="flex flex-col items-center justify-center gap-3 text-slate-400 font-mono text-xs">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p>Booting dev server and compiling preview...</p>
            <span className="text-[11px] text-slate-500">Check the Terminal tab to watch build progress</span>
          </div>
        ) : (
          <div className={`h-full ${getViewportWidth()} transition-all duration-300 shadow-2xl rounded-lg overflow-hidden border border-slate-800`}>
            <iframe
              key={key}
              width="100%"
              height="100%"
              src={url}
              className="w-full h-full bg-white border-0"
              title="WebContainer Live Preview"
            />
          </div>
        )}
      </div>
    </div>
  );
}