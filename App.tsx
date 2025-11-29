import React, { useState } from 'react';

// We import the simulated viewer components just to show *something* 
// but the primary goal is the file generation above.
import AddConnectionModal from './components/AddConnectionModal';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('ci-guide');

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
          <h2 className="font-bold text-lg">CI Build Configured</h2>
          <p className="text-sm opacity-90">
             I have added <code>.github/workflows/build.yml</code> and updated <code>build.gradle</code>.
             Follow the "Secrets Setup" guide below to enable signed APK builds.
          </p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Simple File Explorer for the Generated Files */}
        <div className="w-64 bg-[#252526] border-r border-[#333] flex flex-col pt-4">
          <div className="px-4 pb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">CI / CD</div>
          <FileItem name="Secrets Setup" active={activeTab === 'ci-guide'} onClick={() => setActiveTab('ci-guide')} icon="🔑" />
          <FileItem name="build.yml" active={activeTab === 'workflow'} onClick={() => setActiveTab('workflow')} icon="⚙️" />
          
          <div className="mt-4 px-4 pb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Android Source</div>
          <FileItem name="build.gradle (App)" active={activeTab === 'gradle-app'} onClick={() => setActiveTab('gradle-app')} indent />
          <FileItem name="MainActivity.kt" active={activeTab === 'main'} onClick={() => setActiveTab('main')} indent />
          <FileItem name="AndroidManifest.xml" active={activeTab === 'manifest'} onClick={() => setActiveTab('manifest')} indent />

        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-[#1e1e1e] p-8 overflow-auto">
           {activeTab === 'ci-guide' ? (
             <div className="max-w-3xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-white mb-4">How to Sign your APK on GitHub</h1>
                
                <div className="bg-yellow-900/30 border border-yellow-700 p-4 rounded-lg">
                  <h3 className="text-yellow-500 font-bold mb-2">⚠️ Important</h3>
                  <p className="text-sm">GitHub Actions cannot sign your app without your permission. You must generate a "Keystore" file and upload it as a Secret.</p>
                </div>

                <div className="space-y-6">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="text-xl font-semibold text-white">Step 1: Generate Keystore</h3>
                    <p className="mb-2">Run this command in your computer's terminal (Mac/Linux/Windows PowerShell):</p>
                    <pre className="bg-black p-3 rounded font-mono text-sm select-all">
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
                    </pre>
                    <p className="mt-2 text-sm italic">Set a password you will remember. For "First and Last name", etc., you can enter anything.</p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="text-xl font-semibold text-white">Step 2: Base64 Encode it</h3>
                    <p className="mb-2">GitHub Secrets are text-only, so we convert the file to text:</p>
                    <p className="text-xs font-mono mb-1 text-gray-400">Mac/Linux:</p>
                    <pre className="bg-black p-3 rounded font-mono text-sm select-all">base64 my-release-key.jks > keystore_base64.txt</pre>
                    <p className="text-xs font-mono mt-2 mb-1 text-gray-400">Windows (PowerShell):</p>
                    <pre className="bg-black p-3 rounded font-mono text-sm select-all">[Convert]::ToBase64String([IO.File]::ReadAllBytes("./my-release-key.jks")) | Out-File -Encoding ascii keystore_base64.txt</pre>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="text-xl font-semibold text-white">Step 3: Add to GitHub</h3>
                    <p>Go to your Repo: <strong>Settings &gt; Secrets and variables &gt; Actions &gt; New repository secret</strong></p>
                    <p className="mt-2">Add these 4 secrets:</p>
                    <ul className="list-disc ml-5 mt-2 space-y-2 text-gray-300">
                      <li><strong className="text-white">KEYSTORE_BASE64</strong>: (Paste the content of keystore_base64.txt)</li>
                      <li><strong className="text-white">KEYSTORE_PASSWORD</strong>: (The password you set in Step 1)</li>
                      <li><strong className="text-white">KEY_ALIAS</strong>: <code>my-key-alias</code> (or whatever you named it)</li>
                      <li><strong className="text-white">KEY_PASSWORD</strong>: (The password you set in Step 1)</li>
                    </ul>
                  </div>
                </div>
             </div>
           ) : (
             <div className="flex items-center justify-center h-full text-gray-500">
               <p>Select "Secrets Setup" to see instructions, or view files on the left.</p>
             </div>
           )}
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