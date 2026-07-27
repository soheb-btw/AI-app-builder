import { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen, 
  FileCode, 
  FileJson, 
  FileText, 
  FileType, 
  Braces, 
  Layers,
  File
} from 'lucide-react';
import { FileItem } from '../types';

interface FileExplorerProps {
  files: FileItem[];
  onFileSelect: (file: FileItem) => void;
}

interface FileNodeProps {
  item: FileItem;
  depth: number;
  onFileClick: (file: FileItem) => void;
}

function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'tsx':
    case 'jsx':
      return <FileCode className="w-3.5 h-3.5 text-cyan-400" />;
    case 'ts':
    case 'js':
      return <FileType className="w-3.5 h-3.5 text-blue-400" />;
    case 'json':
      return <FileJson className="w-3.5 h-3.5 text-amber-400" />;
    case 'css':
    case 'scss':
      return <Braces className="w-3.5 h-3.5 text-pink-400" />;
    case 'html':
      return <Layers className="w-3.5 h-3.5 text-orange-400" />;
    case 'md':
      return <FileText className="w-3.5 h-3.5 text-indigo-400" />;
    default:
      return <File className="w-3.5 h-3.5 text-slate-400" />;
  }
}

function FileNode({ item, depth, onFileClick }: FileNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleClick = () => {
    if (item.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else {
      onFileClick(item);
    }
  };

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-slate-800/60 cursor-pointer text-xs font-mono transition-colors group"
        style={{ paddingLeft: `${Math.max(depth * 0.85, 0.4)}rem` }}
        onClick={handleClick}
      >
        {item.type === 'folder' && (
          <span className="text-slate-500 group-hover:text-slate-300">
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </span>
        )}

        <div className="shrink-0">
          {item.type === 'folder' ? (
            isExpanded ? (
              <FolderOpen className="w-4 h-4 text-blue-400" />
            ) : (
              <Folder className="w-4 h-4 text-blue-400/70" />
            )
          ) : (
            getFileIcon(item.name)
          )}
        </div>

        <span className="text-slate-300 group-hover:text-white truncate">
          {item.name}
        </span>
      </div>

      {item.type === 'folder' && isExpanded && item.children && (
        <div className="space-y-0.5 mt-0.5">
          {item.children.map((child, index) => (
            <FileNode
              key={`${child.path}-${index}`}
              item={child}
              depth={depth + 1}
              onFileClick={onFileClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileExplorer({ files, onFileSelect }: FileExplorerProps) {
  return (
    <div className="h-full w-[230px] min-w-[230px] flex flex-col bg-slate-950/60 border-r border-slate-800/80">
      <div className="flex items-center justify-between px-3 py-3 border-b border-slate-800/80 bg-slate-900/30">
        <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase font-mono flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-blue-400" />
          Explorer
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
          {files.length} items
        </span>
      </div>

      <div className="flex-1 overflow-auto p-2 scrollbar-hide space-y-0.5">
        {files.map((file, index) => (
          <FileNode
            key={`${file.path}-${index}`}
            item={file}
            depth={0}
            onFileClick={onFileSelect}
          />
        ))}
      </div>
    </div>
  );
}