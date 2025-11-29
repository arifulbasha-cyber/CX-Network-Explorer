import React, { useState, useEffect } from 'react';
import { 
  getFiles, 
  getBreadcrumbs, 
  getFileById, 
  mountCloudDrive
} from './services/mockFileSystem';
import { FileData, FileType, HistoryItem } from './types';
import { 
  FolderIcon, 
  VideoIcon, 
  ServerIcon, 
  BackIcon, 
  HistoryIcon,
  PlusIcon
} from './components/Icons';
import FilePropertiesModal from './components/PlayerModal';
import AddConnectionModal from './components/AddConnectionModal';

// Styles for the Info button
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>('root');
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  // Modal States
  const [infoFile, setInfoFile] = useState<FileData | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Load initial data
  useEffect(() => {
    loadFiles(currentPath);
    const storedHistory = localStorage.getItem('cx_history');
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, [currentPath]);

  // Toast Timer
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  const loadFiles = async (pathId: string) => {
    setLoading(true);
    const data = await getFiles(pathId);
    setFiles(data);
    setLoading(false);
  };

  const handleConnectDrive = async (type: 'gdrive' | 'dropbox' | 'onedrive') => {
    await mountCloudDrive(type);
    loadFiles('root');
    setToastMsg("Drive connected successfully");
  };

  const generateM3uPlaylist = (targetFile: FileData, allFiles: FileData[]): string => {
    const videos = allFiles.filter(f => f.type === FileType.VIDEO);
    
    // Sort videos to ensure correct order
    const targetIndex = videos.findIndex(v => v.id === targetFile.id);
    if (targetIndex === -1) return '';

    // Create a reordered list starting from the target
    const ordered = [
      ...videos.slice(targetIndex),
      ...videos.slice(0, targetIndex)
    ];

    let m3u = "#EXTM3U\n";
    ordered.forEach(v => {
      if (v.url) {
        m3u += `#EXTINF:-1, ${v.name}\n`;
        m3u += `${v.url}\n`;
      }
    });
    return m3u;
  };

  const launchMxPlayer = (file: FileData) => {
    if (!file.url) return;

    // 1. Generate Playlist
    const m3uContent = generateM3uPlaylist(file, files);
    
    // 2. Create Data URI for the playlist
    const base64Playlist = btoa(unescape(encodeURIComponent(m3uContent)));
    const dataUri = `data:audio/x-mpegurl;base64,${base64Playlist}`;

    // 3. Construct Intent
    let intentUrl = '';
    
    if (dataUri.length < 50000) { 
       // Try Playlist Intent
       const title = encodeURIComponent(file.name);
       intentUrl = `intent:${dataUri}#Intent;package=com.mxtech.videoplayer.ad;type=audio/x-mpegurl;S.title=${title};end`;
    } else {
       // Fallback to single file
       const title = encodeURIComponent(file.name);
       intentUrl = `intent:${file.url}#Intent;package=com.mxtech.videoplayer.ad;type=video/*;S.title=${title};end`;
    }

    // Launch
    window.location.href = intentUrl;
  };

  const handleNavigate = (file: FileData) => {
    if (file.type === FileType.FOLDER) {
      setCurrentPath(file.id);
    } else if (file.type === FileType.VIDEO) {
      // Add to history
      addToHistory(file);
      // Open MX Player Immediately
      launchMxPlayer(file);
    }
  };

  const handleGoUp = () => {
    const current = getFileById(currentPath);
    if (current && current.parentId) {
      setCurrentPath(current.parentId);
    } else if (currentPath !== 'root') {
      setCurrentPath('root');
    }
  };

  const addToHistory = (file: FileData) => {
    const newItem: HistoryItem = {
      fileId: file.id,
      fileName: file.name,
      timestamp: Date.now(),
      filePath: currentPath 
    };
    
    setHistory(prev => {
      const filtered = prev.filter(i => i.fileId !== file.id);
      const updated = [newItem, ...filtered].slice(0, 50);
      localStorage.setItem('cx_history', JSON.stringify(updated));
      return updated;
    });
  };

  const breadcrumbs = getBreadcrumbs(currentPath);

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 font-sans select-none">
      
      {/* Native-like App Bar */}
      <header className="flex items-center h-14 px-4 bg-slate-800 shadow-lg border-b border-slate-700 z-10 shrink-0">
        {currentPath !== 'root' ? (
          <button 
            onClick={handleGoUp} 
            className="mr-4 p-1 rounded-full text-slate-300 hover:bg-slate-700 active:bg-slate-600 transition"
          >
            <BackIcon />
          </button>
        ) : (
          <div className="mr-4 p-1">
             <ServerIcon />
          </div>
        )}
        
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h1 className="text-lg font-bold text-white truncate leading-tight">
            {breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].name : 'Network'}
          </h1>
          {currentPath !== 'root' && (
            <p className="text-xs text-slate-400 truncate">
               {files.length} items
            </p>
          )}
        </div>

        <button 
          onClick={() => setShowHistory(!showHistory)}
          className={`p-2 rounded-full transition active:scale-95 ${showHistory ? 'bg-blue-600 text-white shadow-blue-500/50 shadow-md' : 'text-slate-400 hover:text-white'}`}
        >
          <HistoryIcon />
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative bg-slate-900">
        
        {/* Breadcrumb strip */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-slate-800/50 backdrop-blur text-xs flex items-center px-4 space-x-2 overflow-x-auto whitespace-nowrap z-0 border-b border-slate-700/50">
           {breadcrumbs.map((b, idx) => (
             <React.Fragment key={b.id}>
               <span className={idx === breadcrumbs.length - 1 ? "text-blue-400 font-semibold" : "text-slate-500"}>
                 {b.name}
               </span>
               {idx < breadcrumbs.length - 1 && <span className="text-slate-600">/</span>}
             </React.Fragment>
           ))}
        </div>

        {/* File List */}
        <main className={`flex-1 overflow-y-auto pt-8 pb-4 px-2 transition-all duration-300 ${showHistory ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
          {loading ? (
             <div className="flex flex-col justify-center items-center h-full text-slate-500 space-y-4">
               <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
               <p className="text-sm tracking-wider uppercase">Connecting...</p>
             </div>
          ) : (
            <div className="space-y-1">
              
              {/* Add New Connection Button (Only visible at root) */}
              {currentPath === 'root' && (
                <div 
                  className="group flex items-center p-3 rounded-xl active:bg-slate-800 transition-colors cursor-pointer border-2 border-dashed border-slate-700 hover:border-slate-500 mb-2"
                  onClick={() => setShowAddModal(true)}
                >
                  <div className="flex flex-1 items-center min-w-0">
                    <div className="shrink-0 mr-4 relative text-green-500">
                       <PlusIcon />
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="font-medium text-base truncate text-slate-300 group-active:text-green-400 transition-colors">
                        New Location
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">Remote, Cloud, SMB</p>
                    </div>
                  </div>
                </div>
              )}

              {files.map(file => (
                <div 
                  key={file.id}
                  className="group flex items-center p-2 rounded-xl active:bg-slate-800 transition-colors cursor-default"
                >
                  {/* Icon Area - Click to Navigate/Play */}
                  <div 
                    className="flex flex-1 items-center min-w-0"
                    onClick={() => handleNavigate(file)}
                  >
                    <div className="shrink-0 mr-4 relative">
                      {file.type === FileType.FOLDER ? (
                        <div className="text-yellow-500 drop-shadow-lg">
                           <FolderIcon />
                        </div>
                      ) : (
                         <div className="relative">
                            <div className="text-blue-500 drop-shadow-md">
                              <VideoIcon />
                            </div>
                            {/* Play overlay for video */}
                            <div className="absolute inset-0 flex items-center justify-center">
                               <div className="bg-black/20 rounded-full p-1">
                                 <svg className="w-4 h-4 text-white/90" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                               </div>
                            </div>
                         </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="font-medium text-base truncate text-slate-200 group-active:text-blue-400 transition-colors">
                        {file.name}
                      </p>
                      
                      {/* Special Rendering for Drives (Root Items with Usage) */}
                      {currentPath === 'root' && file.usagePct !== undefined ? (
                        <div className="mt-1">
                           <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${file.usagePct > 80 ? 'bg-red-500' : 'bg-blue-500'}`} 
                                style={{ width: `${file.usagePct}%` }}
                              ></div>
                           </div>
                           <div className="flex justify-between mt-1">
                             <span className="text-[10px] text-slate-400">{file.storageUsed} used</span>
                             <span className="text-[10px] text-slate-500">Total {file.storageTotal}</span>
                           </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-xs text-slate-500">{file.date}</span>
                          {file.size && (
                            <>
                              <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                              <span className="text-xs text-slate-500">{file.size}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info Button - Right side */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setInfoFile(file);
                    }}
                    className="p-3 rounded-full active:bg-slate-700 text-slate-600 hover:text-blue-400 transition"
                  >
                    <InfoIcon />
                  </button>
                </div>
              ))}

              {files.length === 0 && currentPath !== 'root' && (
                <div className="flex flex-col items-center justify-center pt-32 text-slate-600">
                  <div className="w-16 h-16 border-2 border-slate-700 border-dashed rounded-2xl flex items-center justify-center mb-4">
                    <span className="text-2xl">?</span>
                  </div>
                  <p>Folder is empty</p>
                </div>
              )}
            </div>
          )}
        </main>

        {/* History Drawer */}
        <aside 
          className={`absolute inset-y-0 right-0 w-80 bg-slate-900 border-l border-slate-700 shadow-2xl transform transition-transform duration-300 z-20 flex flex-col ${showHistory ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="h-14 px-4 border-b border-slate-700 flex justify-between items-center bg-slate-800 shrink-0">
            <div className="flex items-center space-x-2 text-slate-200">
               <HistoryIcon />
               <h3 className="font-bold">Watch History</h3>
            </div>
            <button onClick={() => setShowHistory(false)} className="text-slate-400 p-2 hover:bg-slate-700 rounded-full">✕</button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {history.length === 0 && (
              <div className="p-8 text-slate-500 text-center text-sm">
                Videos you watch will appear here.
              </div>
            )}
            <ul>
              {history.map((item, idx) => (
                <li 
                  key={`${item.fileId}-${idx}`} 
                  onClick={() => {
                     // History click plays the file
                     const f = getFileById(item.fileId); // Try to find in cache
                     // Fallback to minimal file object if not in current view (History navigation is complex without full FS index, assuming network persistence)
                     const fileToPlay = f || { id: item.fileId, name: item.fileName, type: FileType.VIDEO, parentId: null, url: '...' };
                     if (f) launchMxPlayer(f);
                  }}
                  className="p-4 border-b border-slate-800 active:bg-slate-800"
                >
                  <div className="flex items-start space-x-3">
                     <div className="mt-1 shrink-0 text-blue-500">
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                         <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                       </svg>
                     </div>
                     <div className="min-w-0">
                       <p className="text-sm font-medium text-slate-300 truncate leading-snug">{item.fileName}</p>
                       <p className="text-xs text-slate-500 mt-1">{new Date(item.timestamp).toLocaleString()}</p>
                       <p className="text-[10px] text-slate-600 truncate mt-0.5 font-mono">{item.filePath}</p>
                     </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* Info Modal */}
      {infoFile && (
        <FilePropertiesModal 
          file={infoFile}
          onClose={() => setInfoFile(null)}
        />
      )}

      {/* Add Connection Modal */}
      {showAddModal && (
         <AddConnectionModal 
            onClose={() => setShowAddModal(false)}
            onConnect={handleConnectDrive}
         />
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full shadow-lg border border-slate-700 animate-fade-in z-50 flex items-center space-x-2">
           <span className="text-green-400">✓</span>
           <span className="text-sm">{toastMsg}</span>
        </div>
      )}
    </div>
  );
};

export default App;