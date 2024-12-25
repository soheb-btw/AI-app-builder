import { WebContainer } from '@webcontainer/api';
import React, { useEffect, useState } from 'react';

interface PreviewFrameProps {
  url: string;
}

export function PreviewFrame({ url }: PreviewFrameProps) {

  return (
    <div className="h-full w-full flex items-center justify-center text-gray-400 rounded-lg">
      {!url && <div className="text-center">
        <p className="mb-2">Loading...</p>
      </div>}
      {url && <iframe width={"100%"} height={"100%"} src={url} />}
    </div>
  );
}