import { useEffect, useState } from "react";
import { WebContainer } from '@webcontainer/api';

export function useWebContainer() {
    const [webcontainer, setWebcontainer] = useState<WebContainer>();

    useEffect(() => {
        async function main() {
            if (!webcontainer) {
                const webcontainerInstance = await WebContainer.boot();
                setWebcontainer(webcontainerInstance);
            }
        }
        
        main();
        
        return () => {
            // The webcontainer value here will be the latest state value
            if (webcontainer) {
                webcontainer.teardown();
                setWebcontainer(undefined);
            }
        };
    }, [webcontainer]) // Add webcontainer to dependencies

    return webcontainer;
}