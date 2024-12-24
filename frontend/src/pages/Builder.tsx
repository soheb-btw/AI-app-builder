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

  function changeFile() {
    console.log(selectedFile);
    const content = `import React, { useState } from 'react';
    import { PlusIcon } from 'lucide-react';

    interface Todo {
      id: number;
      text: string;
      completed: boolean;
    }

    const App: React.FC = () => {
      const [todos, setTodos] = useState<Todo[]>([]);
      const [newTodoText, setNewTodoText] = useState('');

      const addTodo = () => {
        if (newTodoText.trim() === '') return;
        setTodos([...todos, { id: Date.now(), text: newTodoText, completed: false }]);
        setNewTodoText('');
      };

      const toggleComplete = (id: number) => {
        setTodos(todos.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
      };

      const deleteTodo = (id: number) => {
        setTodos(todos.filter((todo) => todo.id !== id));
      };

      return (
        <div className="min-h-screen bg-blue-300 p-4">
          <div className="bg-green-500 rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold mb-4">Todo App</h1>
            <div className="flex mb-4">
              <input
                type="text"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                placeholder="Add a new todo..."
                className="flex-grow px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addTodo}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
            <ul className="divide-y divide-gray-300">
              {todos.map((todo) => (
                <li key={todo.id} className="py-2 flex items-center">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleComplete(todo.id)}
                    className="mr-2"
                  />
                  <span
                  >
                    {todo.text}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="ml-auto px-2 py-1 bg-red-500 hover:bg-red-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    };

    export default App;`
    webContainer?.fs.writeFile('/src/App.tsx', content);
  }

  const handleFileChange = (updatedFile: FileItem) => {
    // // First update the WebContainer if initialized
    // if (webContainer && filesMounted) {
    //   webContainer.fs.writeFile(updatedFile.path, updatedFile.content || '');
    // }

    // Helper function to update files recursively
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

    // Update the files state
    setFiles(prevFiles => 
      updateFileInTree(prevFiles, updatedFile.path, updatedFile.content || '')
    );
  };

  return (
    <div className="max-h-screen bg-gray-900 flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <button onClick={changeFile}>change</button>
        <h1 className="text-xl font-semibold text-gray-100">Website Builder</h1>
        <p className="text-sm text-gray-400 mt-1">Prompt: {prompt}</p>
      </header>

      <div className="flex h-full">
        <div className='max-h-[300px]'>
          <StepsList
            steps={steps}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
          />
          {(loading || !templateSet) && <Loader />}
          {!(loading || !templateSet) &&
            <div className='flex'>
              <textarea value={userPrompt} onChange={(e) => {
                setPrompt(e.target.value)
              }}></textarea>
              <button onClick={async () => {
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

              }} className='bg-purple-400 px-4'>Send</button>
            </div>}
        </div>

        <div className='border-white border w-full'>
          <div className='flex'>
            <FileExplorer
              files={files}
              onFileSelect={setSelectedFile}
            />
            <TabView>
              <TabView.Tab label="Code">
                <CodeEditor file={selectedFile} onFileChange={handleFileChange}/>
              </TabView.Tab>
              <TabView.Tab label="Preview" onSelect={() => {
                if (!containerLoaded) {
                  spawnProcess();
                  setContainerLoaded(true);
                }
              }}>
                <PreviewFrame url={url} />
              </TabView.Tab>
            </TabView>
          </div>
        </div>
      </div>
    </div>
  );
}