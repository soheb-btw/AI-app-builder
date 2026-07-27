import React from "react";
import { ArrowUp, Sparkles } from "lucide-react";

interface StepInputBoxProps {
    userPrompt: string;
    setPrompt: (prompt: string) => void;
    handleSend: () => void;
}

export default function StepInputBox({ userPrompt, setPrompt, handleSend }: StepInputBoxProps) {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            if (userPrompt.trim()) {
                handleSend();
            }
        }
    };

    return (
        <div className="sticky bottom-3 mx-3 p-2 bg-slate-950/90 border border-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col gap-2">
            <div className="flex items-center gap-1.5 px-2 text-[10px] font-mono text-slate-400">
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span>Ask BuildBot to modify or add features</span>
            </div>

            <div className="flex items-end gap-2 bg-slate-900/60 rounded-xl p-2 border border-slate-800 focus-within:border-blue-500/50 transition-colors">
                <textarea
                    value={userPrompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 h-[70px] resize-none bg-transparent text-slate-100 text-xs placeholder-slate-500 scrollbar-hide focus:outline-none leading-relaxed font-sans"
                    placeholder="E.g. Add dark mode toggle, change primary button color..."
                />
                
                <button
                    disabled={!userPrompt.trim()}
                    onClick={handleSend}
                    className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center shrink-0 ${
                        userPrompt.trim()
                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 scale-100 cursor-pointer'
                            : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                    }`}
                    title="Send follow-up request"
                >
                    <ArrowUp className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}       
