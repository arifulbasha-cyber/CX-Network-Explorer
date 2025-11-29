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
             I have configured <code>.github/workflows/build.yml</code> to build a <strong>Signed Release APK</strong>.
          </p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Simple File Explorer for the Generated Files */}
        <div className="w-64 bg-[#252526] border-r border-[#333] flex flex-col pt-4">
          <div className="px-4 pb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">CI / CD</div>
          <FileItem name="Secrets Guide" active={activeTab === 'ci-guide'} onClick={() => setActiveTab('ci-guide')} icon="🔑" />
          <FileItem name="build.yml" active={activeTab === 'workflow'} onClick={() => setActiveTab('workflow')} icon="⚙️" />
          
          <div className="mt-4 px-4 pb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Android Source</div>
          <FileItem name="build.gradle (App)" active={activeTab === 'gradle-app'} onClick={() => setActiveTab('gradle-app')} indent />
          <FileItem name="MainActivity.kt" active={activeTab === 'main'} onClick={() => setActiveTab('main')} indent />
          <FileItem name="AndroidManifest.xml" active={activeTab === 'manifest'} onClick={() => setActiveTab('manifest')} indent />

        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-[#1e1e1e] p-8 overflow-auto">
           {activeTab === 'ci-guide' ? (
             <div className="max-w-3xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Build Setup Guide</h1>
                    <p className="text-gray-400">Follow these steps to enable automatic APK building on GitHub.</p>
                </div>
                
                {/* STEP 1 */}
                <div className="bg-[#2d2d30] p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center mb-4">
                        <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">1</div>
                        <h2 className="text-xl font-semibold text-white">Generate Signing Key</h2>
                    </div>
                    <div className="ml-11 space-y-4">
                        <p className="text-sm">You need the <strong>Java Development Kit (JDK)</strong> installed on your computer to use the <code>keytool</code> command.</p>
                        
                        <div className="bg-black/30 p-3 rounded text-sm border border-gray-600">
                             <strong className="text-gray-400 block mb-1">Check if you have it:</strong>
                             <code className="text-green-400">java -version</code>
                             <p className="mt-1 text-gray-500">If command not found, download <a href="https://adoptium.net/" target="_blank" className="text-blue-400 underline">OpenJDK here</a>.</p>
                        </div>

                        <p className="text-sm">Open your Terminal (Mac/Linux) or Command Prompt (Windows) and run this to create the file:</p>
                        <div className="bg-black p-4 rounded-lg overflow-x-auto border border-gray-700">
                            <code className="text-green-400 whitespace-pre">keytool -genkey -v -keystore release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-alias</code>
                        </div>
                        <p className="text-xs text-gray-500 italic">It will ask for a password. Remember this password!</p>
                    </div>
                </div>

                {/* STEP 2 */}
                <div className="bg-[#2d2d30] p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center mb-4">
                        <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">2</div>
                        <h2 className="text-xl font-semibold text-white">Convert to Base64</h2>
                    </div>
                    <div className="ml-11 space-y-4">
                        <p className="text-sm">GitHub secrets cannot store files, so we convert the file to text.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Mac / Linux</p>
                                <div className="bg-black p-3 rounded border border-gray-700">
                                    <code className="text-green-400 text-xs break-all">base64 release.jks &gt; release.base64.txt</code>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Windows (PowerShell)</p>
                                <div className="bg-black p-3 rounded border border-gray-700">
                                    <code className="text-green-400 text-xs break-all">[Convert]::ToBase64String([IO.File]::ReadAllBytes("./release.jks")) | Out-File -Encoding ascii release.base64.txt</code>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm">Open the resulting text file and copy the <strong>entire</strong> long string.</p>
                    </div>
                </div>

                {/* STEP 3 */}
                <div className="bg-[#2d2d30] p-6 rounded-xl border border-gray-700">
                    <div className="flex items-center mb-4">
                        <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">3</div>
                        <h2 className="text-xl font-semibold text-white">Add Secrets to GitHub</h2>
                    </div>
                    <div className="ml-11">
                        <p className="text-sm mb-4">Go to Repo <strong>Settings</strong> &gt; <strong>Secrets and variables</strong> &gt; <strong>Actions</strong> &gt; <strong>New repository secret</strong>.</p>
                        
                        <div className="space-y-3">
                            <SecretRow name="ANDROID_KEYSTORE_BASE64" desc="The long text string from Step 2" />
                            <SecretRow name="ANDROID_KEYSTORE_PASSWORD" desc="The password you created in Step 1" />
                            <SecretRow name="ANDROID_KEY_ALIAS" desc="The alias name (e.g., 'my-alias')" />
                            <SecretRow name="ANDROID_KEY_PASSWORD" desc="Same as store password (usually)" />
                        </div>
                    </div>
                </div>

             </div>
           ) : (
             <div className="flex items-center justify-center h-full text-gray-500">
               <p>Select "Secrets Guide" for instructions.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const SecretRow = ({ name, desc }: { name: string, desc: string }) => (
    <div className="flex flex-col sm:flex-row sm:items-center bg-black/20 p-3 rounded border border-gray-700/50">
        <code className="text-green-400 font-bold text-sm sm:w-1/2 break-all">{name}</code>
        <span className="text-gray-400 text-xs sm:text-sm sm:w-1/2 mt-1 sm:mt-0">{desc}</span>
    </div>
);

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