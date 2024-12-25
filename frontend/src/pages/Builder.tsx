import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { StepsList } from '../components/StepsList';
import { FileExplorer } from '../components/FileExplorer';
import { TabView } from '../components/TabView';
import { CodeEditor } from '../components/CodeEditor';
import { PreviewFrame } from '../components/PreviewFrame';
import { Step, FileItem, StepType } from '../types';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { parseXml } from '../steps';
import { useWebContainer } from '../hooks/useWebContainer';
import { FileNode } from '@webcontainer/api';
import { Loader } from '../components/Loader';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Button } from '../components/Button';

const MOCK_FILE_CONTENT = `// This is a sample file content
import React from 'react';

function Component() {
  return <div>Hello World</div>;
}

export default Component;`;

export function Builder() {
  const location = useLocation();
  const { prompt } = location.state as { prompt: string };
  const [userPrompt, setPrompt] = useState("");
  const [llmMessages, setLlmMessages] = useState<{ role: "user" | "assistant", content: string; }[]>([]);
  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  const [url, setUrl] = useState("");
  const webContainer = useWebContainer();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  const [steps, setSteps] = useState<Step[]>([]);

  const [files, setFiles] = useState<FileItem[]>([]);

  const [containerLoaded, setContainerLoaded] = useState(false);

  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');

  useEffect(() => {
    if (steps.length === 0) return;
    let originalFiles = [...files];
    let updateHappened = false;
    steps.filter(({ status }) => status === "pending").map(step => {
      updateHappened = true;
      if (step?.type === StepType.CreateFile) {
        let parsedPath = step.path?.split("/") ?? []; // ["src", "components", "App.tsx"]
        let currentFileStructure = [...originalFiles]; // {}
        let finalAnswerRef = currentFileStructure;

        let currentFolder = ""
        while (parsedPath.length) {
          currentFolder = `${currentFolder}/${parsedPath[0]}`;
          let currentFolderName = parsedPath[0];
          parsedPath = parsedPath.slice(1);

          if (!parsedPath.length) {
            // final file
            let file = currentFileStructure.find(x => x.path === currentFolder)
            if (!file) {
              currentFileStructure.push({
                name: currentFolderName,
                type: 'file',
                path: currentFolder,
                content: step.code
              })
            } else {
              file.content = step.code;
            }
          } else {
            /// in a folder
            const folder = currentFileStructure.find(x => x.path === currentFolder)
            if (!folder) {
              // create the folder
              currentFileStructure.push({
                name: currentFolderName,
                type: 'folder',
                path: currentFolder,
                children: []
              })
            }

            currentFileStructure = currentFileStructure.find(x => x.path === currentFolder)!.children!;
          }
        }
        originalFiles = finalAnswerRef;
      }

    })

    if (updateHappened) {

      setFiles(originalFiles)
      console.log({ originalFiles })
      setSelectedFile(originalFiles[0])
      setSteps(steps => steps.map((s: Step) => {
        return {
          ...s,
          status: "completed"
        }
      }))
    }
    console.log(files);
  }, [steps, files]);

  useEffect(() => {
    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};

      const processFile = (file: FileItem, isRootFolder: boolean) => {
        if (file.type === 'folder') {
          // For folders, create a directory entry
          mountStructure[file.name] = {
            directory: file.children ?
              Object.fromEntries(
                file.children.map(child => [child.name, processFile(child, false)])
              )
              : {}
          };
        } else if (file.type === 'file') {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || ''
              }
            };
          } else {
            // For files, create a file entry with contents
            return {
              file: {
                contents: file.content || ''
              }
            };
          }
        }

        return mountStructure[file.name];
      };

      // Process each top-level file/folder
      files.forEach(file => processFile(file, true));
      console.log('mountStructure', mountStructure);
      return mountStructure;
    };

    const mountStructure = createMountStructure(files);

    // Mount the structure if WebContainer is available
    console.log(mountStructure);
    webContainer?.mount(mountStructure);
  }, [files, webContainer]);

  async function init() {
    const response = await axios.post(`${BACKEND_URL}/template`, {
      prompt: prompt.trim()
    });
    setTemplateSet(true);

    const { prompts, uiPrompts } = response.data;

    setSteps(parseXml(uiPrompts[0]).map((x: Step) => ({
      ...x,
      status: "pending"
    })));

    setLoading(true);
    const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
      messages: [...prompts, prompt].map(content => ({
        role: "user",
        content
      }))
    })

    setLoading(false);

    setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
      ...x,
      status: "pending" as "pending"
    }))]);

    setLlmMessages([...prompts, prompt].map(content => ({
      role: "user",
      content
    })));

    setLlmMessages(x => [...x, { role: "assistant", content: stepsResponse.data.response }]);
  }

  useEffect(() => {
    init();

    return () => {
      // webContainer?.teardown();
    }
  }, [])

  async function spawnProcess() {
    const installProcess = await webContainer.spawn('npm', ['install']);
    installProcess.output.pipeTo(new WritableStream({
      write(data) {
        console.log('npm run i', data);
      }
    }));
    await installProcess.exit;
    const runProcess = await webContainer.spawn('npm', ['run', 'dev']);
    console.log('consoling started');


    runProcess.output.pipeTo(new WritableStream({
      write(data) {
        console.log('npm run dev', data);
      }
    }))

    // Wait for `server-ready` event
    webContainer.on('server-ready', (port, url) => {
      console.log('server-ready', port, url)
      setUrl(url);
    });
  }


  const handleFileChange = (updatedFile: FileItem) => {

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

  const handleDownload = async () => {
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

  function onFileSelect(file: FileItem) {
    setSelectedFile(file);
  }

  async function handleSend() {
    const newMessage = {
      role: "user" as "user",
      content: userPrompt
    };

    setLoading(true);
    const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
      messages: [...llmMessages, newMessage]
    });
    setLoading(false);

    setLlmMessages(x => [...x, newMessage]);
    setLlmMessages(x => [...x, {
      role: "assistant",
      content: stepsResponse.data.response
    }]);

    setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
      ...x,
      status: "pending" as "pending"
    }))]);

  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative flex flex-col">
      <div className='absolute w-[110px] h-[400px] bg-[#29392] mix-blend-overlay top-[-280px] left-[350px] -rotate-45'></div>
      <header className="flex justify-between border-gray-700 px-6 py-4">
        <div className="text-xl font-semibold text-gray-100">Website Builder</div>
        <div className='text-white'>Create Todo App</div>
      </header>

      <div className="flex max-h-[calc(100vh-60px)] overflow-hidden">
        <div className='w-[300px] min-w-[300px] overflow-y-auto'>
          <StepsList
            steps={steps}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
          />
          {(loading || !templateSet) && <Loader />}
          {!(loading || !templateSet) &&
            <div className='flex sticky bottom-0'>
              <textarea value={userPrompt} onChange={(e) => {
                setPrompt(e.target.value)
              }}></textarea>
              <button onClick={handleSend} className='bg-blue-500 text-white text-sm px-3 py-2 hover:bg-blue-400 transition-colors'>Send</button>
            </div>}
        </div>

        <div className='flex-1 p-5'>
          <div className='flex bg-[#1e1e1e] h-full rounded-[10px] border border-gray-700'>
            <FileExplorer
              files={files}
              onFileSelect={onFileSelect}
            />
            <div className='flex-1 flex flex-col h-full'>
              <div className="flex border-b border-gray-700 p-2">
                <div className="relative flex bg-black rounded-lg p-1">
                  <button
                    className={`relative z-10 ml-4 px-4 py-2 text-sm font-medium transition-colors duration-200 ${activeTab === 'code' ? 'text-blue-700' : 'text-gray-300'
                      }`}
                    onClick={() => setActiveTab('code')}
                  >
                    Code
                  </button>
                  <button
                    className={`relative z-10 ml-4 px-6 py-2 text-sm font-medium transition-colors duration-200 ${activeTab === 'preview' ? 'text-blue-700' : 'text-gray-300'
                      }`}
                    onClick={() => {
                      setActiveTab('preview');
                      if (!containerLoaded) {
                        spawnProcess();
                        setContainerLoaded(true);
                      }
                    }}
                  >
                    Preview
                  </button>
                  <div
                    className={`absolute top-1 bottom-1 rounded-md bg-blue-500/30 transition-transform duration-200 ease-in-out ${activeTab === 'preview' ? 'translate-x-full w-[48%]' : 'translate-x-0 w-[50%]'
                      }`}
                  />
                </div>
                <div className='ml-auto'>
                  <Button onClick={handleDownload}>
                    Download
                  </Button>
                </div>
              </div>

              <div className='flex-1 h-full overflow-auto'>
                {activeTab === 'code' && (
                  <CodeEditor file={selectedFile} onFileChange={handleFileChange} />
                )}
                {activeTab === 'preview' && (
                  <PreviewFrame url={url} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}