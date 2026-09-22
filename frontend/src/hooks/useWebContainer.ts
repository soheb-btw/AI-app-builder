import { useEffect, useState } from "react";
import { WebContainer } from '@webcontainer/api';

// Module-level singleton — WebContainer only allows one boot() per page
let webcontainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;

async function getWebContainer(): Promise<WebContainer> {
    if (webcontainerInstance) return webcontainerInstance;

    if (!bootPromise) {
        bootPromise = WebContainer.boot().then(instance => {
            webcontainerInstance = instance;
            return instance;
        }).catch(error => {
            bootPromise = null;
            throw error;
        });
    }

    return bootPromise;
}

export function useWebContainer() {
    const [webcontainer, setWebcontainer] = useState<WebContainer | undefined>(
        webcontainerInstance ?? undefined
    );

    useEffect(() => {
        if (webcontainer) return;

        getWebContainer()
            .then(setWebcontainer)
            .catch(error => {
                console.error("Failed to boot WebContainer:", error);
            });
    }, []);

    // Don't teardown on unmount — singleton is reused across navigations
    return webcontainer;
}