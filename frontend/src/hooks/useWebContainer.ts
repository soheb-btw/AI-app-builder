import { useEffect, useRef, useState } from "react";
import { WebContainer } from '@webcontainer/api';

export function useWebContainer() {
    const [webcontainer, setWebcontainer] = useState<WebContainer>();
    const isBooting = useRef(false);

    useEffect(() => {
        async function main() {
            // Prevent double-boot with a ref guard (not state, to avoid re-renders)
            if (isBooting.current || webcontainer) return;
            isBooting.current = true;

            try {
                const webcontainerInstance = await WebContainer.boot();
                setWebcontainer(webcontainerInstance);
            } catch (error) {
                console.error("Failed to boot WebContainer:", error);
                isBooting.current = false;
            }
        }
        
        main();
    }, []); // Only run once on mount — no dependency on webcontainer

    // Cleanup on unmount only
    useEffect(() => {
        return () => {
            webcontainer?.teardown();
        };
    }, [webcontainer]);

    return webcontainer;
}