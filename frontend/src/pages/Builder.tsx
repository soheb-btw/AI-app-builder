import { useEffect, useState, useRef, useCallback } from 'react';
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
import { Button } from '../components/Button';
import { Download, Terminal, ArrowLeft, Save, Sparkles, AlertCircle, Key } from 'lucide-react';
import LightRays from '../components/LightRays';
import StepInputBox from '../components/StepInputBox';
import ToggleCodePreview from '../components/ToggleCodePreview';
import { useBuilderState } from '../hooks/useBuilderState';
import { useFileOperations } from '../hooks/useFileOperations';
import { SettingsModal, getStoredApiKey, getStoredModel } from '../components/SettingsModal';
import { todoAppDemo, weatherAppDemo, baseReactTemplate } from '../demoData';

export function Builder() {
  const location = useLocation();
  const navigate = useNavigate();

  // Safe access to location.state — redirect if missing
  const prompt = (location.state as { prompt?: string } | null)?.prompt;
  const isDemo = (location.state as { isDemo?: boolean } | null)?.isDemo;
  const demoType = (location.state as { demoType?: string } | null)?.demoType;
  useEffect(() => {
    if (!prompt) {
      navigate('/', { replace: true });
    }
  }, [prompt, navigate]);

  const [url, setUrl] = useState("");
  const webContainer = useWebContainer();
  const [updatedFile, setUpdatedFile] = useState<FileItem | null>(null);
  const [containerLoaded, setContainerLoaded] = useState(false);
  const [lastPackageJson, setLastPackageJson] = useState<string>("");
  const isSpawning = useRef(false);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const {
    userPrompt,
    setPrompt: setUserPrompt,
    llmMessages,
    setLlmMessages,
    loading,
    setLoading,
    templateSet,
    setTemplateSet,
    currentStep,
    setCurrentStep,
    selectedFile,
    setSelectedFile,
    steps,
    setSteps,
    files,
    setFiles,
    error,
    setError,
    activeTab,
    setActiveTab
  } = useBuilderState();

  const { hasUnsavedChanges, handleFileChange, handleDownload } = useFileOperations();

  const getHeaders = () => {
    return {
      'x-openrouter-key': getStoredApiKey(),
      'x-openrouter-model': getStoredModel()
    };
  };

  // Break infinite loop by only depending on steps
  useEffect(() => {
    if (steps.length === 0) return;

    const pendingSteps = steps.filter(({ status }) => status === "pending");
    if (pendingSteps.length === 0) return;

    setFiles(currentFiles => {
      let originalFiles = [...currentFiles];

      pendingSteps.forEach(step => {
        if (step?.type === StepType.CreateFile) {
          let parsedPath = step.path?.split("/") ?? [];
          let currentFileStructure = [...originalFiles];
          const finalAnswerRef = currentFileStructure;

          let currentFolder = "";
          while (parsedPath.length) {
            currentFolder = `${currentFolder}/${parsedPath[0]}`;
            const currentFolderName = parsedPath[0];
            parsedPath = parsedPath.slice(1);

            if (!parsedPath.length) {
              const file = currentFileStructure.find(x => x.path === currentFolder);
              if (!file) {
                currentFileStructure.push({
                  name: currentFolderName,
                  type: 'file',
                  path: currentFolder,
                  content: step.code
                });
              } else {
                file.content = step.code;
              }
            } else {
              const folder = currentFileStructure.find(x => x.path === currentFolder);
              if (!folder) {
                currentFileStructure.push({
                  name: currentFolderName,
                  type: 'folder',
                  path: currentFolder,
                  children: []
                });
              }
              currentFileStructure = currentFileStructure.find(x => x.path === currentFolder)!.children!;
            }
          }
          originalFiles = finalAnswerRef;
        }
      });

      return originalFiles;
    });

    setSelectedFile(prev => prev || null);

    setSteps(prevSteps => prevSteps.map((s: Step) => ({
      ...s,
      status: "completed" as const,
    })));
  }, [steps]);

  // Select first file only when files change and nothing selected
  useEffect(() => {
    if (files.length > 0 && !selectedFile) {
      setSelectedFile(files[0]);
    }
  }, [files, selectedFile]);

  useEffect(() => {
    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};

      const processFile = (file: FileItem, isRootFolder: boolean) => {
        if (file.type === 'folder') {
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

  useEffect(() => {
    const packageFile = files.find(f => f.path === "/package.json");
    if (packageFile?.content && packageFile.content !== lastPackageJson) {
      setLastPackageJson(packageFile.content);
      if (containerLoaded) {
        spawnProcess();
      }
    }
  }, [files, containerLoaded]);

  // Ensure spawnProcess runs once webContainer is ready if preview was already requested
  useEffect(() => {
    if (containerLoaded && webContainer && files.length > 0) {
      spawnProcess();
    }
  }, [containerLoaded, webContainer]);

  async function init() {
    if (!prompt) return;

    if (isDemo) {
      const demoData = demoType === 'weather' ? weatherAppDemo : todoAppDemo;
      setTemplateSet(true);
      
      // Parse the base React template into steps, just like the backend would
      const baseSteps = parseXml(baseReactTemplate).map((x: Step) => ({
        ...x,
        status: "pending" as const
      }));

      // Combine base boilerplate steps with the custom demo app steps
      setSteps([...baseSteps, ...demoData.steps.map(s => ({ ...s, status: "pending" as const }))]);
      setLoading(false);
      return;
    }

    try {
      const headers = getHeaders();
      if (!headers['x-openrouter-key']) {
        setIsSettingsOpen(true);
        return;
      }

      const response = await axios.post(
        `${BACKEND_URL}/template`, 
        { prompt: prompt.trim() },
        { headers }
      );

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
      const stepsResponse = await axios.post(
        `${BACKEND_URL}/chat`, 
        {
          messages: [...prompts, prompt].map(content => ({
            role: "user",
            content
          }))
        },
        { headers }
      );

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
    } catch (error: any) {
      console.error('Error initializing:', error);
      if (error?.response?.status === 401) {
        setIsSettingsOpen(true);
      } else {
        setError(true);
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    }
  }

  useEffect(() => {
    init();

    return () => {
      webContainer?.teardown();
    }
  }, [])

  const stripAnsi = (str: string) =>
    str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');

  const appendLog = useCallback((line: string) => {
    const clean = stripAnsi(line).trim();
    if (!clean) return;
    if (/^[\\|/\-]+$/.test(clean)) return;
    setBuildLogs(prev => [...prev.slice(-200), clean]);
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [buildLogs]);

  const spawnProcess = useCallback(async () => {
    if (isSpawning.current || !webContainer) return;
    isSpawning.current = true;
    setBuildLogs([]);

    try {
      appendLog('$ npm install');
      const installProcess = await webContainer.spawn('npm', ['install']);
      installProcess.output.pipeTo(new WritableStream({
        write(data) {
          appendLog(data);
        }
      }));
      await installProcess.exit;

      appendLog('\n$ npm run dev');
      const runProcess = await webContainer.spawn('npm', ['run', 'dev']);
      runProcess.output.pipeTo(new WritableStream({
        write(data) {
          appendLog(data);
        }
      }));

      webContainer.on('server-ready', (_port, url) => {
        appendLog(`\n✓ Server ready at ${url}`);
        setUrl(url);
      });
    } catch (error) {
      console.error('Error running npm commands:', error);
      appendLog(`\n✗ Error: ${error}`);
    } finally {
      isSpawning.current = false;
    }
  }, [webContainer, appendLog]);

  function onFileSelect(file: FileItem) {
    hasUnsavedChanges.current = false;
    setActiveTab('code');
    setSelectedFile(file);
  }

  async function handleSend() {
    const messageText = userPrompt.trim();
    if (!messageText) return;

    if (isDemo) {
      alert("You are in Demo Mode.\n\nTo build custom apps or modify this one, please return home and configure your OpenRouter API key.");
      return;
    }

    try {
      const headers = getHeaders();
      if (!headers['x-openrouter-key']) {
        setIsSettingsOpen(true);
        return;
      }

      const newMessage = {
        role: "user" as const,
        content: messageText
      };

      setUserPrompt("");
      setLoading(true);
      const stepsResponse = await axios.post(
        `${BACKEND_URL}/chat`, 
        { messages: [...llmMessages, newMessage] },
        { headers }
      );

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

    } catch (error: any) {
      console.error('Error sending message:', error);
      if (error?.response?.status === 401) {
        setIsSettingsOpen(true);
      } else {
        setError(true);
        setTimeout(() => {
          webContainer?.teardown();
          navigate('/');
        }, 3000);
      }
    }
  }

  if (!prompt) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-slate-900/90 border border-slate-800 p-8 rounded-2xl shadow-2xl backdrop-blur-xl">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-xl font-bold text-white mb-2">Build Execution Error</h2>
          <p className="text-sm text-slate-400 mb-6">Something went wrong while communicating with the model endpoint. Redirecting to home...</p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-blue-600/30"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  const hasKey = Boolean(getStoredApiKey());

  return (
    <div className="min-h-screen bg-[#030712] relative flex flex-col overflow-hidden">
      <LightRays />
      
      {/* Workspace Header */}
      <header className="flex items-center justify-between border-b border-slate-800/80 px-6 py-3.5 z-20 bg-slate-950/60 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2 font-mono text-sm font-bold text-white">
            <Terminal className="w-4 h-4 text-blue-400" />
            <span>BuildB<span className="text-blue-400">🤖</span>t</span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 truncate max-w-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate italic text-slate-300">"{prompt}"</span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
              hasKey
                ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>{hasKey ? 'API Key Configured' : 'Set API Key'}</span>
            <span className={`w-2 h-2 rounded-full ${hasKey ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          </button>

          {loading ? (
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Generating Code...
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Workspace Ready
            </span>
          )}

          <button
            onClick={() => handleDownload(files)}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-medium font-mono flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Zip
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex max-h-[calc(100vh-57px)] min-h-[calc(100vh-57px)] overflow-hidden z-10 p-3 gap-3">
        
        {/* Left Step Pipeline Panel */}
        <div className="w-[320px] min-w-[320px] bg-slate-950/60 border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xl backdrop-blur-md">
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {!(loading || !templateSet) && <StepsList steps={steps} currentStep={currentStep} onStepClick={setCurrentStep} />}
            {(loading || !templateSet) && <Loader />}
          </div>
          
          {!(loading || !templateSet) && (
            <StepInputBox userPrompt={userPrompt} setPrompt={setUserPrompt} handleSend={handleSend} />
          )}
        </div>

        {/* Center Code / Preview Panel */}
        <div className="flex-1 bg-slate-950/60 border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col shadow-2xl backdrop-blur-md p-2">
          
          <div className="flex bg-slate-950/80 rounded-xl h-full border border-slate-800/80 overflow-hidden">
            
            {/* File Explorer */}
            <FileExplorer files={files} onFileSelect={onFileSelect} />

            {/* Code / Preview Section */}
            <div className="flex-1 flex flex-col h-full overflow-hidden p-2">
              
              <div className="flex border-b border-slate-800/80 pb-2 mb-2 items-center justify-between gap-2">
                <ToggleCodePreview 
                  activeTab={activeTab} 
                  setActiveTab={setActiveTab} 
                  loading={loading} 
                  templateSet={templateSet} 
                  spawnProcess={spawnProcess} 
                  containerLoaded={containerLoaded} 
                  setContainerLoaded={setContainerLoaded} 
                />

                <div className="flex items-center gap-2">
                  {selectedFile && (
                    <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 truncate max-w-[200px]">
                      {selectedFile.path}
                    </span>
                  )}

                  {updatedFile && (
                    <Button onClick={() => handleFileChange(files, updatedFile, setFiles)}>
                      <div className="flex items-center gap-1.5">
                        <Save className="w-3.5 h-3.5" />
                        <span>Save File</span>
                        {hasUnsavedChanges.current && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        )}
                      </div>
                    </Button>
                  )}
                </div>
              </div>

              {/* View Active Tab Content */}
              <div className="flex-1 h-full overflow-hidden">
                {activeTab === 'code' && (
                  <CodeEditor file={selectedFile} hasUnsavedChanges={hasUnsavedChanges} onFileChange={setUpdatedFile} />
                )}

                {activeTab === 'preview' && (
                  <PreviewFrame url={url} />
                )}

                {activeTab === 'terminal' && (
                  <div className="h-full bg-slate-950 rounded-xl p-4 overflow-auto font-mono text-xs text-slate-300 border border-slate-800 shadow-inner">
                    {buildLogs.length === 0 && (
                      <div className="text-slate-500 italic">No terminal build logs recorded yet. Click the Preview tab to run WebContainer process.</div>
                    )}
                    {buildLogs.map((line, i) => (
                      <div key={i} className={`whitespace-pre-wrap leading-5 ${
                        line.startsWith('$') ? 'text-blue-400 font-semibold mt-2' :
                        line.startsWith('✓') ? 'text-emerald-400 font-semibold' :
                        line.startsWith('✗') ? 'text-rose-400 font-semibold' :
                        line.includes('WARN') ? 'text-amber-400' :
                        line.includes('ERR') ? 'text-rose-400' : ''
                      }`}>{line}</div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}