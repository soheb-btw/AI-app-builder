interface ToggleCodePreviewProps {  
    activeTab: string;
    setActiveTab: (tab: 'code' | 'preview') => void;
    loading: boolean;
    templateSet: boolean;
    spawnProcess: () => void;
    containerLoaded: boolean;
    setContainerLoaded: (loaded: boolean) => void;
}

export default function ToggleCodePreview({ activeTab, setActiveTab, loading, templateSet, spawnProcess, containerLoaded, setContainerLoaded }: ToggleCodePreviewProps) {
    return (
        <div className="relative flex bg-black rounded-lg p-1">
            <button
                className={`relative z-10 ml-4 px-4 py-2 text-sm font-medium transition-colors duration-200 ${activeTab === 'code' ? 'text-blue-700' : 'text-gray-300'
                    }`}
                onClick={() => setActiveTab('code')}
            >
                Code
            </button>
            <button
                className={`relative z-10 ml-4 px-6 py-2 text-sm font-medium transition-colors duration-200 ${(loading || !templateSet) ? 'opacity-50 cursor-not-allowed' : ''} ${activeTab === 'preview' ? 'text-blue-700' : 'text-gray-300'
                    }`}
                onClick={() => {
                    if ((loading || !templateSet)) return;
                    setActiveTab('preview');
                    if (!containerLoaded) {
                        spawnProcess();
                        setContainerLoaded(true);
                    }
                }}
            >
                Preview
            </button>
            <div
                className={`absolute top-1 bottom-1 rounded-md bg-blue-500/30 transition-transform duration-200 ease-in-out ${activeTab === 'preview' ? 'translate-x-full w-[48%]' : 'translate-x-0 w-[50%]'
                    }`}
            />
        </div>
    );
}   