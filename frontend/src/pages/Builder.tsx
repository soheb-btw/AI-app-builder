import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StepsList } from '../components/StepsList';
import { FileExplorer } from '../components/FileExplorer';
import { CodeEditor } from '../components/CodeEditor';
import { PreviewFrame } from '../components/PreviewFrame';
import { Step, FileItem, StepType } from '../types';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { parseXml } from '../steps';
import { useWebContainer } from '../hooks/useWebContainer';
import { Loader } from '../components/Loader';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Button } from '../components/Button';
import { ArrowRight, Upload } from 'lucide-react';
import { SecondaryButton } from '../components/SecondaryButton';
import LightRays from '../components/LightRays';
import StepInputBox from '../components/StepInputBox';
import ToggleCodePreview from '../components/ToggleCodePreview';

export function Builder() {
  const location = useLocation();
  const { prompt } = location.state as { prompt: string };
  const [userPrompt, setPrompt] = useState("");
  const [llmMessages, setLlmMessages] = useState<{ role: "user" | "assistant", content: string; }[]>([]);
  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  const [url, setUrl] = useState("");
  const webContainer = useWebContainer();
  const [updatedFile, setUpdatedFile] = useState<FileItem | null>(null);
  const fileSaved = useRef(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  const [steps, setSteps] = useState<Step[]>([]);

  const [files, setFiles] = useState<FileItem[]>([]);

  const [containerLoaded, setContainerLoaded] = useState(false);

  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');

  const [error, setError] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (steps.length === 0) return;
    let originalFiles = [...files];
    let updateHappened = false;
    steps.filter(({ status }) => status === "pending").map(step => {
      updateHappened = true;
      if (step?.type === StepType.CreateFile) {
        let parsedPath = step.path?.split("/") ?? []; // ["src", "components", "App.tsx"]
        let currentFileStructure = [...originalFiles]; // {}
        const finalAnswerRef = currentFileStructure;

        let currentFolder = ""
        while (parsedPath.length) {
          currentFolder = `${currentFolder}/${parsedPath[0]}`;
          const currentFolderName = parsedPath[0];
          parsedPath = parsedPath.slice(1);

          if (!parsedPath.length) {
            // final file
            const file = currentFileStructure.find(x => x.path === currentFolder)
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
      setSelectedFile(originalFiles[0])
      setSteps(steps => steps.map((s: Step) => {
        return {
          ...s,
          status: "completed"
        }
      }))
    }
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

            return {
              file: {
                contents: file.content || ''
              }
            };
          }
        }

        return mountStructure[file.name];
      };

      files.forEach(file => processFile(file, true));
      return mountStructure;
    };

    const mountStructure = createMountStructure(files);

    webContainer?.mount(mountStructure);
  }, [files, webContainer]);

  async function init() {
    try {
      const response = await axios.post(`${BACKEND_URL}/template`, {
        prompt: prompt.trim()
      });

      if (!response.data) {
        throw new Error('No data received from template endpoint');
      }

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
      });

      if (!stepsResponse.data) {
        throw new Error('No data received from chat endpoint');
      }

      setLoading(false);

      setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
        ...x,
        status: "pending" as const
      }))]);

      setLlmMessages([...prompts, prompt].map(content => ({
        role: "user",
        content
      })));

      setLlmMessages(x => [...x, { role: "assistant", content: stepsResponse.data.response }]);
    } catch (error) {
      console.error('Error initializing:', error);
      setError(true);

      setTimeout(() => {
        navigate('/');
      }, 3000);
    }
  }

  useEffect(() => {
    init();

    return () => {
      webContainer?.teardown();
    }
  }, [])

  async function spawnProcess() {
    const installProcess = await webContainer.spawn('npm', ['install']);
    installProcess.output.pipeTo(new WritableStream({
      write(data) {
        console.log(data);
      }
    }));
    await installProcess.exit;
    const runProcess = await webContainer.spawn('npm', ['run', 'dev']);


    runProcess.output.pipeTo(new WritableStream({
      write(data) {
        console.log(data);
      }
    }))

    // Wait for `server-ready` event
    webContainer.on('server-ready', (port, url) => {
      console.log('server-ready', port, url)
      setUrl(url);
    });
  }


  const handleFileChange = (updatedFile: FileItem) => {
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
    fileSaved.current = false;
    setActiveTab('code');
    setSelectedFile(file);
  }

  async function handleSend() {
    try {
      const newMessage = {
        role: "user" as const,
        content: userPrompt
      };
  
      setLoading(true);
      const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
        messages: [...llmMessages, newMessage]
      });

      if (!stepsResponse.data) {
        throw new Error('No data received from chat endpoint');
      }

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

    } catch (error) {
      console.error('Error sending message:', error);
      setError(true);
      setTimeout(() => {
        webContainer?.teardown();
        navigate('/');
      }, 3000);
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Something went wrong!</div>
          <div className="text-gray-400">Redirecting to homepage...</div>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative flex flex-col">
      <LightRays />
      <header className="flex items-center justify-between border-b border-gray-700 px-6 py-4 z-10">
        <div className="text-xl font-semibold text-gray-100 flex items-center tracking-[2px] font-mono">BuildB<span className='text-sm'>🤖</span>t</div>
        <SecondaryButton onClick={handleDownload}>
          <Upload className='w-4 h-4' /> Export
        </SecondaryButton>
      </header>

      <div className="flex max-h-[calc(100vh-65px)] min-h-[calc(100vh-65px)] overflow-hidden z-10">
        <div className='w-[300px] min-w-[300px] overflow-y-auto scrollbar-hide'>
          {!(loading || !templateSet) && <StepsList steps={steps} currentStep={currentStep} onStepClick={setCurrentStep} />}
          {(loading || !templateSet) && <Loader />}
          {!(loading || !templateSet) && <StepInputBox userPrompt={userPrompt} setPrompt={setPrompt} handleSend={handleSend} />}
        </div>

        <div className='flex-1 p-5'>
          <div className='flex bg-[#1e1e1e] h-full rounded-[10px] border border-gray-700'>
            <FileExplorer files={files} onFileSelect={onFileSelect} />
            <div className='flex-1 flex flex-col h-full'>
              <div className="flex border-b border-gray-700 p-2 items-center gap-2">
                <ToggleCodePreview activeTab={activeTab} setActiveTab={setActiveTab} loading={loading} templateSet={templateSet} spawnProcess={spawnProcess} containerLoaded={containerLoaded} setContainerLoaded={setContainerLoaded} />
                <div className='ml-auto'>
                  <Button onClick={() => handleFileChange(updatedFile)}>Save{fileSaved.current && <span className='rounded-[50%] bg-yellow-500 ml-2 w-2 h-2 inline-block'></span>}</Button>
                </div>
              </div>

              <div className='flex-1 h-full overflow-auto'>
                {activeTab === 'code' && (
                  <CodeEditor file={selectedFile} fileSaved={fileSaved} onFileChange={setUpdatedFile} />
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