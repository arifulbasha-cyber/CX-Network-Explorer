import React, { useState } from 'react';

// We import the simulated viewer components just to show *something* 
// but the primary goal is the file generation above.
import AddConnectionModal from './components/AddConnectionModal';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('readme');

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-gray-300 font-sans">
      
      {/* GitHub Sync Status Banner */}
      <div className="bg-green-800 text-white p-4 flex items-center shadow-lg z-10">
        <div className="mr-4 bg-white/20 p-2 rounded-full">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
           </svg>
        </div>
        <div>
          <h2 className="font-bold text-lg">Ready for GitHub</h2>
          <p className="text-sm opacity-90">
             The Native Android source code (Kotlin) has been generated in the <code className="bg-black/30 px-1 rounded">android/</code> folder. 
             You can now sync this project to GitHub and open it in Android Studio.
          </p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Simple File Explorer for the Generated Files */}
        <div className="w-64 bg-[#252526] border-r border-[#333] flex flex-col pt-4">
          <div className="px-4 pb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Generated Files</div>
          
          <FileItem name="README.md" active={activeTab === 'readme'} onClick={() => setActiveTab('readme')} icon="📝" />
          <FileItem name=".gitignore" active={activeTab === 'git'} onClick={() => setActiveTab('git')} icon="⚙️" />
          
          <div className="mt-4 px-4 pb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Android Source</div>
          <FileItem name="MainActivity.kt" active={activeTab === 'main'} onClick={() => setActiveTab('main')} indent />
          <FileItem name="DriveService.kt" active={activeTab === 'drive'} onClick={() => setActiveTab('drive')} indent />
          <FileItem name="MXPlayerHelper.kt" active={activeTab === 'mx'} onClick={() => setActiveTab('mx')} indent />
          <FileItem name="AndroidManifest.xml" active={activeTab === 'manifest'} onClick={() => setActiveTab('manifest')} indent />
          <FileItem name="build.gradle" active={activeTab === 'gradle'} onClick={() => setActiveTab('gradle')} indent />

        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-[#1e1e1e] p-8 overflow-auto flex items-center justify-center">
           <div className="max-w-2xl text-center space-y-6">
              <div className="w-24 h-24 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.6 11.48c.53 0 .96-.43.96-.96 0-.53-.43-.96-.96-.96-.53 0-.96.43-.96.96 0 .53.43.96.96.96zm-11.2 0c.53 0 .96-.43.96-.96 0-.53-.43-.96-.96-.96-.53 0-.96.43-.96.96 0 .53.43.96.96.96zm4.1-8.58l-1-2.9h-1.5l1 2.9C5.4 3.7 2.8 6.6 2.4 10h19.2c-.4-3.4-3-6.3-6.6-7.1zM2.4 11h19.2c-.4 3.4-3 6.3-6.6 7.1l-2.6 3.9h-3.4l2.6-3.9C5.4 17.3 2.8 14.4 2.4 11z"/></svg>
              </div>
              <h1 className="text-3xl font-bold text-white">Project Structure Created</h1>
              <p className="text-gray-400 text-lg">
                This is now a dual-mode project. The files you see in the sidebar have been written to disk.
                <br/><br/>
                <span className="text-blue-400">Click "Sync to GitHub"</span> in your editor to save the Android source code.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

const FileItem = ({ name, active, onClick, icon = "📄", indent = false }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center px-4 py-2 text-sm text-left w-full hover:bg-[#2a2d2e] transition-colors ${
      active ? 'bg-[#37373d] text-white border-l-2 border-blue-500' : 'text-gray-400 border-l-2 border-transparent'
    }`}
  >
    <span className={`${indent ? 'ml-4' : ''} mr-2`}>{icon}</span>
    {name}
  </button>
);

export default App;
