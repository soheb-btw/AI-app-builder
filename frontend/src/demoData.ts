import { Project, StepType } from './types';

export const baseReactTemplate = `<Artifact id="project-import" title="Project Files"><Action type="file" filePath="index.html"><!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <link rel="icon" type="image/svg+xml" href="/vite.svg" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Vite + React + TS</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>\n</Action><Action type="file" filePath="package.json">{\n  "name": "vite-react-typescript-starter",\n  "private": true,\n  "version": "0.0.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build",\n    "preview": "vite preview"\n  },\n  "dependencies": {\n    "lucide-react": "^0.344.0",\n    "react": "^18.3.1",\n    "react-dom": "^18.3.1"\n  },\n  "devDependencies": {\n    "@vitejs/plugin-react": "^4.3.1",\n    "autoprefixer": "^10.4.18",\n    "postcss": "^8.4.35",\n    "tailwindcss": "^3.4.1",\n    "vite": "^5.4.2"\n  }\n}\n</Action><Action type="file" filePath="postcss.config.js">export default {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n};\n</Action><Action type="file" filePath="tailwind.config.js">/** @type {import('tailwindcss').Config} */\nexport default {\n  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],\n  theme: {\n    extend: {},\n  },\n  plugins: [],\n};\n</Action><Action type="file" filePath="vite.config.ts">import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\n// https://vitejs.dev/config/\nexport default defineConfig({\n  plugins: [react()],\n  optimizeDeps: {\n    exclude: ['lucide-react'],\n  },\n});\n</Action><Action type="file" filePath="src/index.css">@tailwind base;\n@tailwind components;\n@tailwind utilities;\n</Action><Action type="file" filePath="src/main.tsx">import { StrictMode } from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from './App.tsx';\nimport './index.css';\n\ncreateRoot(document.getElementById('root')!).render(\n  <StrictMode>\n    <App />\n  </StrictMode>\n);\n</Action><Action type="file" filePath="src/vite-env.d.ts">/// <reference types="vite/client" />\n</Action></Artifact>`;

export const todoAppDemo: Project = {
  prompt: "Create a modern Todo app with React & Tailwind",
  steps: [
    {
      id: 1,
      title: "Create App.tsx",
      description: "Main application component",
      type: StepType.CreateFile,
      status: "completed",
      path: "src/App.tsx",
      code: `import React, { useState } from 'react';
import { Plus, Trash2, Check, LayoutList } from 'lucide-react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: '1', text: 'Review Pull Request', completed: true },
    { id: '2', text: 'Prepare presentation for tomorrow', completed: false },
    { id: '3', text: 'Buy groceries', completed: false },
  ]);
  const [input, setInput] = useState('');

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now().toString(), text: input.trim(), completed: false }]);
    setInput('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center py-16 px-4">
      <div className="w-full max-w-xl">
        
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
            <LayoutList size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Tasks</h1>
            <p className="text-slate-400 text-sm">Organize your day efficiently</p>
          </div>
        </div>

        <form onSubmit={addTodo} className="relative mb-8 group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full bg-slate-900 border border-slate-700/60 focus:border-blue-500/50 rounded-xl px-5 py-4 pl-5 pr-14 text-slate-100 placeholder-slate-500 outline-none shadow-xl transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg flex items-center justify-center transition-colors"
          >
            <Plus size={20} />
          </button>
        </form>

        <div className="space-y-3">
          {todos.map(todo => (
            <div 
              key={todo.id} 
              className={\`group flex items-center justify-between p-4 rounded-xl border transition-all \${
                todo.completed 
                  ? 'bg-slate-900/40 border-slate-800/40' 
                  : 'bg-slate-900 border-slate-700/60 shadow-lg'
              }\`}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={\`w-6 h-6 rounded-md flex items-center justify-center transition-colors \${
                    todo.completed
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'border-2 border-slate-600 hover:border-blue-400'
                  }\`}
                >
                  {todo.completed && <Check size={14} strokeWidth={3} />}
                </button>
                <span className={\`text-lg transition-all \${
                  todo.completed ? 'text-slate-500 line-through' : 'text-slate-200'
                }\`}>
                  {todo.text}
                </span>
              </div>
              
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-2 rounded-lg hover:bg-red-400/10"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          
          {todos.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No tasks yet. Add one above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}`
    },
    {
      id: 2,
      title: "Update dependencies",
      description: "Install lucide-react",
      type: StepType.RunScript,
      status: "completed",
      code: "npm install lucide-react"
    }
  ]
};

export const weatherAppDemo: Project = {
  prompt: "Design a sleek Weather App dashboard",
  steps: [
    {
      id: 1,
      title: "Create App.tsx",
      description: "Main application component",
      type: StepType.CreateFile,
      status: "completed",
      path: "src/App.tsx",
      code: `import React from 'react';
import { CloudRain, Sun, Wind, Droplets, MapPin, Search } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="relative z-10">
          {/* Search */}
          <div className="flex items-center gap-3 bg-slate-950/50 border border-slate-800 rounded-2xl p-3 mb-8">
            <Search className="text-slate-500 w-5 h-5 ml-2" />
            <input 
              type="text" 
              placeholder="Search city..." 
              className="bg-transparent border-none outline-none text-slate-200 w-full placeholder-slate-600"
              defaultValue="San Francisco"
            />
          </div>

          {/* Current Weather */}
          <div className="flex flex-col items-center mb-10">
            <div className="flex items-center gap-2 text-slate-400 mb-6 bg-slate-800/40 px-3 py-1 rounded-full text-sm">
              <MapPin className="w-4 h-4 text-blue-400" />
              San Francisco, CA
            </div>
            
            <CloudRain className="w-32 h-32 text-blue-400 mb-6 drop-shadow-[0_0_20px_rgba(96,165,250,0.3)]" strokeWidth={1.5} />
            
            <h1 className="text-7xl font-bold text-white tracking-tighter mb-2">
              16°
            </h1>
            <p className="text-xl text-blue-400 font-medium">Light Rain</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/50 border border-slate-800/60 rounded-2xl p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">WIND</p>
                <p className="text-lg font-semibold text-slate-200">12 km/h</p>
              </div>
            </div>
            
            <div className="bg-slate-950/50 border border-slate-800/60 rounded-2xl p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">HUMIDITY</p>
                <p className="text-lg font-semibold text-slate-200">84%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`
    },
    {
      id: 2,
      title: "Update dependencies",
      description: "Install lucide-react",
      type: StepType.RunScript,
      status: "completed",
      code: "npm install lucide-react"
    }
  ]
};
