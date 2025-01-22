import Editor from '@monaco-editor/react';
import { FileItem } from '../types';
import { useCallback, useMemo } from 'react';

interface CodeEditorProps {
  file: FileItem | null;
  onFileChange?: (updatedFile: FileItem) => void;
  fileSaved: React.MutableRefObject<boolean>;
}

export function CodeEditor({ file, onFileChange, fileSaved }: CodeEditorProps) {

  const options = useMemo(() => ({
    minimap: { enabled: false },
    fontSize: 14,
    wordWrap: 'on' as const,
    scrollBeyondLastLine: false,
    automaticLayout: true
  }), []);

  
  const handleBeforeMount = useCallback((monaco: any) => {
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
      noSuggestionDiagnostics: true
    });
  }, []);

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Select a file to view its contents
      </div>
    );
  }

  const handleEditorChange = (value: string | undefined) => {
    if (!value || !onFileChange) return;
    fileSaved.current = true;
    onFileChange({
      ...file,
      content: value
    });
  };


  return (
    <div className='flex-1 h-[99%] overflow-hidden'>
      <Editor
        beforeMount={handleBeforeMount}
        defaultLanguage="typescript"
        theme="vs-dark"
        value={file.content || ''}
        onChange={handleEditorChange}
        options={options}
      />
    </div>
  );
}