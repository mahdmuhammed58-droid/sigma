import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import VideoGenerator from './components/VideoGenerator';
import { ViewMode } from './types';

const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<ViewMode>(ViewMode.CHAT);

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Navigation Sidebar */}
      <Sidebar currentMode={currentMode} setMode={setCurrentMode} />

      {/* Main Content Area */}
      <main className="flex-1 relative h-full">
        <div className="absolute inset-0 w-full h-full transition-opacity duration-300 ease-in-out">
          {currentMode === ViewMode.CHAT ? (
            <ChatInterface />
          ) : (
            <VideoGenerator />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;