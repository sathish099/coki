import React, { useState } from 'react';
import { AppMode } from './types';
import Navigation from './components/Navigation';
import SearchMode from './components/SearchMode';
import ImageMode from './components/ImageMode';
import ChatMode from './components/ChatMode';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.SEARCH);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-200 selection:text-blue-900">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/40 rounded-full blur-[120px]" />
      </div>

      {/* Main Content Content */}
      <main className="flex-1 relative z-10 pt-4 md:pt-8 flex flex-col">
        <div className="flex-1">
          {mode === AppMode.SEARCH && <SearchMode />}
          {mode === AppMode.IMAGE && <ImageMode />}
          {mode === AppMode.CHAT && <ChatMode />}
        </div>
      </main>

      {/* Persistent Navigation */}
      <Navigation currentMode={mode} setMode={setMode} />
    </div>
  );
};

export default App;