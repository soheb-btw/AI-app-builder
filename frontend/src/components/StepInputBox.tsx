import { ArrowRight } from "lucide-react";

interface StepInputBoxProps {
    userPrompt: string;
    setPrompt: (prompt: string) => void;
    handleSend: () => void;
}

export default function StepInputBox({ userPrompt, setPrompt, handleSend }: StepInputBoxProps) {
    return (
        <div className='flex sticky items-center bottom-2 mx-4 gap-2 bg-[#1e1e1e] rounded-xl pr-2'>
            <textarea
                value={userPrompt}
                onChange={(e) => {
                    setPrompt(e.target.value)
                }}
                className="flex-1 h-[100px] resize-none bg-inherit text-gray-200 text-sm border-gray-700 rounded-lg p-2 w-full scrollbar-hide focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="How can I help you?"
            ></textarea>
            {userPrompt && <button
                onClick={handleSend}
                className='bg-blue-600 p-2 text-sm self-end mb-2 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center justify-center z-10'
            >
                <ArrowRight className='w-4 h-4 text-white' />
            </button>}
        </div>
    );
}       
