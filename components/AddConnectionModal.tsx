import React, { useState } from 'react';
import { GoogleDriveIcon, DropboxIcon, OneDriveIcon, ServerIcon } from './Icons';

interface AddConnectionModalProps {
  onClose: () => void;
  onConnect: (type: 'gdrive' | 'dropbox' | 'onedrive') => void;
}

type Step = 'SELECT_PROVIDER' | 'GOOGLE_AUTH_ACCOUNT' | 'GOOGLE_AUTH_PERMISSION' | 'CONNECTING';

const AddConnectionModal: React.FC<AddConnectionModalProps> = ({ onClose, onConnect }) => {
  const [step, setStep] = useState<Step>('SELECT_PROVIDER');
  const [selectedProvider, setSelectedProvider] = useState<'gdrive' | 'dropbox' | 'onedrive' | null>(null);

  const handleProviderSelect = (type: 'gdrive' | 'dropbox' | 'onedrive') => {
    setSelectedProvider(type);
    if (type === 'gdrive') {
      setStep('GOOGLE_AUTH_ACCOUNT');
    } else {
      // For others, just fast forward to connecting for now
      setStep('CONNECTING');
      setTimeout(() => {
        onConnect(type);
        onClose();
      }, 1500);
    }
  };

  const handleGoogleAccountSelect = () => {
    setStep('GOOGLE_AUTH_PERMISSION');
  };

  const handlePermissionAllow = () => {
    setStep('CONNECTING');
    setTimeout(() => {
      if (selectedProvider) {
        onConnect(selectedProvider);
        onClose();
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      
      {/* Container */}
      <div 
        className="bg-white w-full max-w-sm rounded-lg overflow-hidden shadow-2xl mx-4 relative"
        onClick={e => e.stopPropagation()}
        style={{ minHeight: '400px' }}
      >
        {/* STEP 1: SELECT PROVIDER */}
        {step === 'SELECT_PROVIDER' && (
          <div className="bg-gray-900 h-full text-white p-4">
             <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-2">
               <h3 className="font-semibold text-lg">New Location</h3>
               <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
             </div>
             
             <div className="grid grid-cols-2 gap-3">
               <button 
                  onClick={() => handleProviderSelect('gdrive')}
                  className="flex flex-col items-center justify-center p-6 bg-gray-800 hover:bg-gray-700 rounded-xl transition border border-gray-700 group"
               >
                  <div className="mb-3 transform group-hover:scale-110 transition-transform"><GoogleDriveIcon /></div>
                  <span className="text-sm font-medium">Google Drive</span>
               </button>

               <button 
                  onClick={() => handleProviderSelect('dropbox')}
                  className="flex flex-col items-center justify-center p-6 bg-gray-800 hover:bg-gray-700 rounded-xl transition border border-gray-700"
               >
                  <div className="mb-3"><DropboxIcon /></div>
                  <span className="text-sm font-medium">Dropbox</span>
               </button>

               <button 
                  onClick={() => handleProviderSelect('onedrive')}
                  className="flex flex-col items-center justify-center p-6 bg-gray-800 hover:bg-gray-700 rounded-xl transition border border-gray-700"
               >
                  <div className="mb-3"><OneDriveIcon /></div>
                  <span className="text-sm font-medium">OneDrive</span>
               </button>

               <button 
                  className="flex flex-col items-center justify-center p-6 bg-gray-800/50 rounded-xl border border-gray-700/50 opacity-50 cursor-not-allowed"
               >
                  <div className="mb-3"><ServerIcon /></div>
                  <span className="text-sm font-medium">SMB / LAN</span>
               </button>
             </div>
          </div>
        )}

        {/* STEP 2: GOOGLE ACCOUNT PICKER (Simulated Webview) */}
        {step === 'GOOGLE_AUTH_ACCOUNT' && (
           <div className="flex flex-col h-full bg-white text-gray-800">
              {/* Fake Chrome Address Bar */}
              <div className="bg-gray-100 p-2 flex items-center border-b border-gray-300">
                 <div className="text-gray-400 mr-2">🔒</div>
                 <div className="bg-white rounded-full px-3 py-1 text-xs text-green-700 flex-1 truncate">
                    accounts.google.com/signin/oauth/
                 </div>
                 <button onClick={() => setStep('SELECT_PROVIDER')} className="ml-2 text-gray-500">✕</button>
              </div>

              <div className="flex flex-col items-center pt-8 px-6 pb-6">
                 <div className="mb-4">
                    <svg viewBox="0 0 48 48" className="w-12 h-12">
                       <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                       <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                       <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                       <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                 </div>
                 <h2 className="text-xl font-medium mb-2">Sign in with Google</h2>
                 <p className="text-sm text-gray-600 mb-8 text-center">Choose an account to continue to CX Explorer</p>
                 
                 <div className="w-full space-y-2">
                    <button 
                       onClick={handleGoogleAccountSelect}
                       className="w-full flex items-center p-3 border border-gray-300 rounded hover:bg-gray-50 transition"
                    >
                       <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold mr-3">U</div>
                       <div className="text-left">
                          <p className="font-medium text-sm">User Account</p>
                          <p className="text-xs text-gray-500">user@gmail.com</p>
                       </div>
                    </button>
                    <button 
                       className="w-full flex items-center p-3 border border-gray-300 rounded hover:bg-gray-50 transition"
                    >
                       <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center mr-3">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                       </div>
                       <p className="font-medium text-sm text-gray-700">Use another account</p>
                    </button>
                 </div>
              </div>
           </div>
        )}

        {/* STEP 3: GOOGLE PERMISSION (Simulated Webview) */}
        {step === 'GOOGLE_AUTH_PERMISSION' && (
           <div className="flex flex-col h-full bg-white text-gray-800">
              <div className="bg-gray-100 p-2 flex items-center border-b border-gray-300">
                 <div className="text-gray-400 mr-2">🔒</div>
                 <div className="bg-white rounded-full px-3 py-1 text-xs text-green-700 flex-1 truncate">
                    accounts.google.com/signin/oauth/consent
                 </div>
              </div>

              <div className="p-6 flex-1 overflow-y-auto">
                 <div className="mb-6">
                    <GoogleDriveIcon />
                 </div>
                 
                 <h2 className="text-lg font-medium mb-4">CX Network Explorer wants access to your Google Account</h2>
                 
                 <div className="flex items-center space-x-3 mb-4 p-2 bg-gray-50 rounded">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold shrink-0">U</div>
                    <p className="text-sm text-gray-600">user@gmail.com</p>
                 </div>

                 <div className="space-y-4 mb-8">
                    <div className="flex items-start space-x-3">
                       <div className="mt-1 text-blue-600">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                       </div>
                       <p className="text-sm text-gray-600">See, edit, create, and delete all of your Google Drive files</p>
                    </div>
                    <div className="flex items-start space-x-3">
                       <div className="mt-1 text-blue-600">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                       </div>
                       <p className="text-sm text-gray-600">See your personal info, including any personal info you've made publicly available</p>
                    </div>
                 </div>

                 <div className="flex justify-end space-x-3 mt-auto">
                    <button 
                       onClick={() => setStep('SELECT_PROVIDER')}
                       className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                    >
                       Cancel
                    </button>
                    <button 
                       onClick={handlePermissionAllow}
                       className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700"
                    >
                       Allow
                    </button>
                 </div>
              </div>
           </div>
        )}

        {/* STEP 4: SPINNER */}
        {step === 'CONNECTING' && (
           <div className="bg-gray-900 h-full text-white flex flex-col items-center justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-lg font-medium">Connecting Drive...</p>
              <p className="text-sm text-gray-400 mt-2">Syncing file list</p>
           </div>
        )}

      </div>
    </div>
  );
};

export default AddConnectionModal;