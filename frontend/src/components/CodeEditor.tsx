import React from 'react';
import Editor from '@monaco-editor/react';
import { FileItem } from '../types';

interface CodeEditorProps {
  file: FileItem | null;
  onFileChange?: (updatedFile: FileItem) => void;
}

export function CodeEditor({ file, onFileChange }: CodeEditorProps) {
  if (!file) {
    return (
      <div className="flex items-center justify-center text-gray-400">
        Select a file to view its contents
      </div>
    );
  }

  const handleEditorChange = (value: string | undefined) => {
    if (!value || !onFileChange) return;
    
    onFileChange({
      ...file,
      content: value
    });
  };

  return (
   <div className='flex-1 h-[100%]'>
     <Editor
      defaultLanguage="typescript"
      theme="vs-dark"
      value={file.content || ''}
      onChange={handleEditorChange}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true
      }}
    />
   </div>
  );
}