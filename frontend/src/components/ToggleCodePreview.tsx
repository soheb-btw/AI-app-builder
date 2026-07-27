import { Terminal } from 'lucide-react';

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
        <div className="relative flex bg-black rounded-lg p-1 gap-1">
            <button
                className={`relative z-10 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${activeTab === 'code' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-gray-200'
                    }`}
                onClick={() => setActiveTab('code')}
            >
                Code
            </button>
            <button
                className={`relative z-10 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} ${activeTab === 'preview' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-gray-200'
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
                Preview
            </button>
            <button
                className={`relative z-10 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 flex items-center gap-1.5 ${activeTab === 'terminal' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-gray-200'
                    }`}
                onClick={() => setActiveTab('terminal')}
            >
                <Terminal className="w-3.5 h-3.5" />
                Terminal
            </button>
        </div>
    );
}   