import { useRef } from 'react';
import { FileItem } from '../types';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export function useFileOperations() {
  const fileSaved = useRef(false);

  const handleFileChange = (files: FileItem[], updatedFile: FileItem, setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>) => {
    fileSaved.current = false;
    const updateFileInTree = (files: FileItem[], path: string, newContent: string): FileItem[] => {
      return files.map(file => {
        if (file.path === path) {
          return { ...file, content: newContent };
        }
        if (file.type === 'folder' && file.children) {
          return {
            ...file,
            children: updateFileInTree(file.children, path, newContent)
          };
        }
        return file;
      });
    };

    setFiles(prevFiles =>
      updateFileInTree(prevFiles, updatedFile.path, updatedFile.content || '')
    );
  };

  const handleDownload = async (files: FileItem[]) => {
    const zip = new JSZip();

    const addFilesToZip = (items: FileItem[], currentPath: string = '') => {
      items.forEach(item => {
        if (item.type === 'file') {
          zip.file(currentPath + item.name, item.content || '');
        } else if (item.type === 'folder' && item.children) {
          addFilesToZip(item.children, currentPath + item.name + '/');
        }
      });
    };

    addFilesToZip(files);

    try {
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'project.zip');
    } catch (error) {
      console.error('Error creating zip file:', error);
    }
  };

  return {
    fileSaved,
    handleFileChange,
    handleDownload
  };
} 