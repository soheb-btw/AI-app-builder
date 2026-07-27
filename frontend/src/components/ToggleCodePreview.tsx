import { Code2, Play, Terminal } from 'lucide-react';

interface ToggleCodePreviewProps {  
    activeTab: string;
    setActiveTab: (tab: 'code' | 'preview' | 'terminal') => void;
    loading: boolean;
    templateSet: boolean;
    spawnProcess: () => void;
    containerLoaded: boolean;
    setContainerLoaded: (loaded: boolean) => void;
}

export default function ToggleCodePreview({ activeTab, setActiveTab, loading, templateSet, spawnProcess, containerLoaded, setContainerLoaded }: ToggleCodePreviewProps) {
    const isDisabled = loading || !templateSet;

    return (
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 gap-1">
            <button
                className={`px-3 py-1.5 text-xs font-medium font-mono rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'code' 
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
                onClick={() => setActiveTab('code')}
            >
                <Code2 className="w-3.5 h-3.5" />
                <span>Code</span>
            </button>

            <button
                disabled={isDisabled}
                className={`px-3 py-1.5 text-xs font-medium font-mono rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } ${
                    activeTab === 'preview' 
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
                onClick={() => {
                    if (isDisabled) return;
                    setActiveTab('preview');
                    if (!containerLoaded) {
                        spawnProcess();
                        setContainerLoaded(true);
                    }
                }}
            >
                <Play className="w-3.5 h-3.5" />
                <span>Preview</span>
            </button>

            <button
                className={`px-3 py-1.5 text-xs font-medium font-mono rounded-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'terminal' 
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
                onClick={() => setActiveTab('terminal')}
            >
                <Terminal className="w-3.5 h-3.5" />
                <span>Terminal</span>
            </button>
        </div>
    );
}   