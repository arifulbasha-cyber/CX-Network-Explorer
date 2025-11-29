import React, { useState } from 'react';
import { GoogleDriveIcon, DropboxIcon, OneDriveIcon, ServerIcon } from './Icons';

interface AddConnectionModalProps {
  onClose: () => void;
  onConnect: (type: 'gdrive' | 'dropbox' | 'onedrive') => void;
}

const AddConnectionModal: React.FC<AddConnectionModalProps> = ({ onClose, onConnect }) => {
  const [connectingTo, setConnectingTo] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string>("Connecting...");

  const handleConnect = (type: 'gdrive' | 'dropbox' | 'onedrive', name: string) => {
    setConnectingTo(name);
    
    // Simulate realistic OAuth steps
    setStatusText("Contacting server...");
    
    setTimeout(() => {
      setStatusText("Verifying credentials...");
    }, 700);

    setTimeout(() => {
      setStatusText("Requesting permissions...");
    }, 1500);

    setTimeout(() => {
      setStatusText("Finalizing connection...");
    }, 2200);

    setTimeout(() => {
      onConnect(type);
      onClose();
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-gray-800 w-full max-w-sm rounded-xl overflow-hidden shadow-2xl border border-gray-700 mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-750">
          <h3 className="font-semibold text-gray-100">New Location</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="p-2">
          {connectingTo ? (
             <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <p className="text-gray-200 font-medium">{connectingTo}</p>
                <p className="text-sm text-gray-400 animate-pulse">{statusText}</p>
             </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 p-2">
               <button 
                  onClick={() => handleConnect('gdrive', 'Google Drive')}
                  className="relative flex flex-col items-center justify-center p-6 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition border border-gray-600/30 hover:border-blue-500/50 group"
               >
                  <div className="absolute top-2 right-2 bg-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded text-white shadow-sm">
                    RECOMMENDED
                  </div>
                  <div className="mb-3 transform group-hover:scale-110 transition-transform"><GoogleDriveIcon /></div>
                  <span className="text-sm font-medium text-gray-200">Google Drive</span>
               </button>

               <button 
                  onClick={() => handleConnect('dropbox', 'Dropbox')}
                  className="flex flex-col items-center justify-center p-6 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition border border-gray-600/30 hover:border-gray-500"
               >
                  <div className="mb-3"><DropboxIcon /></div>
                  <span className="text-sm font-medium text-gray-200">Dropbox</span>
               </button>

               <button 
                  onClick={() => handleConnect('onedrive', 'OneDrive')}
                  className="flex flex-col items-center justify-center p-6 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition border border-gray-600/30 hover:border-gray-500"
               >
                  <div className="mb-3"><OneDriveIcon /></div>
                  <span className="text-sm font-medium text-gray-200">OneDrive</span>
               </button>

               <button 
                  className="flex flex-col items-center justify-center p-6 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition border border-gray-600/30 hover:border-gray-500 opacity-50 cursor-not-allowed"
                  title="Coming Soon"
               >
                  <div className="mb-3"><ServerIcon /></div>
                  <span className="text-sm font-medium text-gray-200">SMB / LAN</span>
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddConnectionModal;