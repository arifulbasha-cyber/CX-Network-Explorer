import React, { useRef, useEffect } from 'react';
import { FileData } from '../types';

interface VideoPlayerProps {
  file: FileData;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ file, onClose, onNext, onPrev, hasNext, hasPrev }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Auto play when file changes
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(e => console.log("Autoplay blocked", e));
    }
  }, [file]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-center items-center">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center z-10">
        <button onClick={onClose} className="text-white p-2 rounded-full hover:bg-white/10">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <span className="text-white font-medium truncate px-4">{file.name}</span>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      {/* Video */}
      <div className="w-full h-full flex items-center bg-black">
        <video 
          ref={videoRef}
          controls 
          className="w-full max-h-screen aspect-video"
          src={file.url}
          onEnded={onNext} // Auto next
        />
      </div>

      {/* Controls Overlay (Custom Prev/Next) */}
      <div className="absolute bottom-20 left-0 right-0 flex justify-center space-x-12 pointer-events-none">
        <button 
          onClick={onPrev} 
          disabled={!hasPrev}
          className={`pointer-events-auto p-4 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition ${!hasPrev ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" className="w-6 h-6">
            <path d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        
        <button 
          onClick={onNext} 
          disabled={!hasNext}
          className={`pointer-events-auto p-4 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition ${!hasNext ? 'opacity-30 cursor-not-allowed' : 'opacity-100'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" className="w-6 h-6">
            <path d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;