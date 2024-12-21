import { WebContainer } from '@webcontainer/api';
import React, { useEffect, useState } from 'react';

interface PreviewFrameProps {
  webContainer: WebContainer;
}

export function PreviewFrame({ webContainer }: PreviewFrameProps) {
  // In a real implementation, this would compile and render the preview
  const [url, setUrl] = useState("");
  async function main() {
    const installProcess = await webContainer.spawn('npm', ['install']);
    await installProcess.exit;
    await webContainer.spawn('npm', ['run', 'dev']);

    installProcess.output.pipeTo(new WritableStream({
      write(data) {
        console.log(data);
      }
    }));

    // Wait for `server-ready` event
    webContainer.on('server-ready', (port, url) => {
      setUrl(url);
    });
  }

  useEffect(() => {
    main()
  }, [])

  return (
    <div className="h-full flex items-center justify-center text-gray-400">
      {!url && <div className="text-center">
        <p className="mb-2">Loading...</p>
      </div>}
      {url && <iframe width={"100%"} height={"100%"} src={url} />}
    </div>
  );
}