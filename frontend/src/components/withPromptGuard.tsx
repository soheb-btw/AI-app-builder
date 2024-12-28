import { useEffect } from 'react';
import { Router, useLocation, useNavigate } from 'react-router-dom';

export function withPromptGuard(WrappedComponent) {
  return function PromptGuard(props) {
    const navigate = useNavigate();
    const location = useLocation();
    const { prompt } = location.state as { prompt: string };

    useEffect(() => {
      // if (!router.isReady) return;
      
      if (!prompt || prompt.trim() === '') {
        navigate('/');
      }
    }, [prompt, router.isReady]);

    // if (!router.isReady || !prompt) {
    //   return null; // or return loading spinner
    // }

    return <WrappedComponent {...props} />;
  };
} 