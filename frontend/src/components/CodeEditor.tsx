import Editor from '@monaco-editor/react';
import { FileItem } from '../types';
import { useCallback, useMemo } from 'react';

interface CodeEditorProps {
  file: FileItem | null;
  onFileChange?: (updatedFile: FileItem) => void;
  hasUnsavedChanges: React.MutableRefObject<boolean>;
}

// Bug #12 fix: Detect language from file extension
function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    json: 'json',
    css: 'css',
    scss: 'scss',
    html: 'html',
    htm: 'html',
    md: 'markdown',
    yaml: 'yaml',
    yml: 'yaml',
    xml: 'xml',
    svg: 'xml',
    py: 'python',
    sh: 'shell',
    bash: 'shell',
    env: 'plaintext',
    txt: 'plaintext',
    gitignore: 'plaintext',
  };
  return languageMap[ext || ''] || 'plaintext';
}

export function CodeEditor({ file, onFileChange, hasUnsavedChanges }: CodeEditorProps) {

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

    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#030712',
      }
    });
  }, []);

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Select a file to view its contents
      </div>
    );
  }

  const language = getLanguageFromPath(file.path || file.name);

  const handleEditorChange = (value: string | undefined) => {
    if (!value || !onFileChange) return;
    hasUnsavedChanges.current = true;
    onFileChange({
      ...file,
      content: value
    });
  };


  return (
    <div className='flex-1 h-[99%] overflow-hidden'>
      <Editor
        key={file.path}
        beforeMount={handleBeforeMount}
        language={language}
        theme="custom-dark"
        value={file.content || ''}
        onChange={handleEditorChange}
        options={options}
      />
    </div>
  );
}