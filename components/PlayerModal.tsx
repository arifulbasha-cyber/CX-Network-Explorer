import React, { useState, useEffect } from 'react';
import { FileData } from '../types';
import { analyzeFilename } from '../services/geminiService';
import { AiSparkleIcon } from './Icons';

interface FilePropertiesModalProps {
  file: FileData;
  onClose: () => void;
}

const FilePropertiesModal: React.FC<FilePropertiesModalProps> = ({ file, onClose }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    // Auto-analyze when properties are opened to give that "Smart File Manager" feel
    handleAiAnalyze();
  }, [file]);

  const handleAiAnalyze = async () => {
    setLoadingAi(true);
    const result = await analyzeFilename(file.name);
    setAiAnalysis(result);
    setLoadingAi(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-gray-800 w-full sm:w-[400px] sm:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl border-t sm:border border-gray-700"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 bg-gray-750 border-b border-gray-700 flex justify-between items-center">
          <h3 className="font-semibold text-gray-100">Properties</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white bg-gray-700 rounded-full">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
               <span className="text-3xl">🎬</span>
            </div>
            <div>
               <h2 className="text-lg font-bold text-white leading-snug break-all">{file.name}</h2>
               <p className="text-blue-400 text-sm mt-1">{file.type}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
             <div className="bg-gray-700/30 p-3 rounded-lg">
                <p className="text-gray-500 text-xs uppercase font-bold mb-1">Size</p>
                <p className="text-gray-200">{file.size || 'Unknown'}</p>
             </div>
             <div className="bg-gray-700/30 p-3 rounded-lg">
                <p className="text-gray-500 text-xs uppercase font-bold mb-1">Date</p>
                <p className="text-gray-200">{file.date || 'Unknown'}</p>
             </div>
          </div>

          {/* AI Analysis Section */}
          <div className="bg-gray-700/20 rounded-xl p-4 border border-gray-600/50">
             <div className="flex items-center space-x-2 mb-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                <AiSparkleIcon />
                <span>AI Content Analysis</span>
             </div>
             {loadingAi ? (
                <div className="flex space-x-2 animate-pulse">
                   <div className="h-2 bg-gray-600 rounded w-3/4"></div>
                   <div className="h-2 bg-gray-600 rounded w-1/4"></div>
                </div>
             ) : (
                <p className="text-gray-300 text-sm leading-relaxed italic">
                   "{aiAnalysis || 'No analysis available.'}"
                </p>
             )}
          </div>
          
          {file.url && (
            <div className="pt-2">
               <p className="text-xs text-gray-500 mb-1 break-all font-mono">{file.url}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePropertiesModal;