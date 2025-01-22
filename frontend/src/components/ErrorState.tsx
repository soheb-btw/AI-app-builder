import { useNavigate } from 'react-router-dom';

interface ErrorStateProps {
  onNavigate?: () => void;
}

export function ErrorState({ onNavigate }: ErrorStateProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 text-xl mb-4">Something went wrong!</div>
        <div className="text-gray-400">Redirecting to homepage...</div>
        <button
          onClick={handleClick}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
        >
          Go to Homepage
        </button>
      </div>
    </div>
  );
} 