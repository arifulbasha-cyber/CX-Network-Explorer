import { FileData, FileType } from '../types';

// Store files in a let variable so we can modify them at runtime (simulate mounting drives)
let mockFiles: FileData[] = [
  // Root Level - Initially EMPTY (Pure Cloud App)
  { id: 'root', name: 'Network', type: FileType.FOLDER, parentId: null },
];

// Templates for Cloud Drives (to be injected when user "Logs in")
const cloudDriveTemplates: Record<string, FileData[]> = {
  'gdrive': [
    // Root of Google Drive
    { 
      id: 'gd-root', 
      name: 'Google Drive', 
      type: FileType.FOLDER, 
      parentId: 'root', 
      size: '15GB', 
      date: 'Synced',
      storageTotal: '100 GB',
      storageUsed: '45 GB',
      usagePct: 45 
    },
    
    // Folders
    { id: 'gd-movies', name: 'Movies', type: FileType.FOLDER, parentId: 'gd-root', date: '2023-11-10' },
    { id: 'gd-tv', name: 'TV Shows', type: FileType.FOLDER, parentId: 'gd-root', date: '2023-11-12' },
    { id: 'gd-docs', name: 'Documents', type: FileType.FOLDER, parentId: 'gd-root', date: '2023-10-05' },

    // MOVIE CONTENT (For Playlist Testing)
    { 
      id: 'mov-1', 
      name: 'Big Buck Bunny.mp4', 
      type: FileType.VIDEO, 
      parentId: 'gd-movies', 
      size: '150MB', 
      date: '2023-11-01', 
      url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' 
    },
    { 
      id: 'mov-2', 
      name: 'Elephant Dreams.mp4', 
      type: FileType.VIDEO, 
      parentId: 'gd-movies', 
      size: '120MB', 
      date: '2023-11-02', 
      url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' 
    },
    { 
      id: 'mov-3', 
      name: 'Sintel (4K).mp4', 
      type: FileType.VIDEO, 
      parentId: 'gd-movies', 
      size: '210MB', 
      date: '2023-11-03', 
      url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' 
    },
    { 
      id: 'mov-4', 
      name: 'Tears of Steel.mp4', 
      type: FileType.VIDEO, 
      parentId: 'gd-movies', 
      size: '180MB', 
      date: '2023-11-04', 
      url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' 
    },

    // TV SHOW CONTENT
    { 
      id: 'tv-1', 
      name: 'Review_S01E01.mp4', 
      type: FileType.VIDEO, 
      parentId: 'gd-tv', 
      size: '450MB', 
      date: '2023-12-01', 
      url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4' 
    },
    { 
      id: 'tv-2', 
      name: 'Joyrides_S01E02.mp4', 
      type: FileType.VIDEO, 
      parentId: 'gd-tv', 
      size: '120MB', 
      date: '2023-12-02', 
      url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' 
    },
  ],
  'dropbox': [
    { 
      id: 'db-root', 
      name: 'Dropbox', 
      type: FileType.FOLDER, 
      parentId: 'root', 
      size: '2TB', 
      date: 'Synced',
      storageTotal: '2 TB',
      storageUsed: '450 GB',
      usagePct: 22 
    },
    { id: 'db-work', name: 'Work Share', type: FileType.FOLDER, parentId: 'db-root', date: '2023-12-01' },
    { id: 'db-vid-1', name: 'Design_Review.mp4', type: FileType.VIDEO, parentId: 'db-work', size: '450MB', date: '2023-12-02', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4' },
  ],
  'onedrive': [
    { 
      id: 'od-root', 
      name: 'OneDrive', 
      type: FileType.FOLDER, 
      parentId: 'root', 
      size: '1TB', 
      date: 'Synced',
      storageTotal: '1 TB',
      storageUsed: '890 GB',
      usagePct: 89 
    },
    { id: 'od-backup', name: 'PC Backup', type: FileType.FOLDER, parentId: 'od-root', date: '2023-12-01' },
    { id: 'od-vid-1', name: 'Family_Video.mp4', type: FileType.VIDEO, parentId: 'od-root', size: '120MB', date: '2023-12-10', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
  ]
};

export const getFiles = (parentId: string): Promise<FileData[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockFiles.filter(f => f.parentId === parentId));
    }, 150); 
  });
};

export const getFileById = (id: string): FileData | undefined => {
  return mockFiles.find(f => f.id === id);
};

export const getBreadcrumbs = (currentId: string): {id: string, name: string}[] => {
  const crumbs = [];
  let current = getFileById(currentId);
  while (current) {
    crumbs.unshift({ id: current.id, name: current.name });
    if (!current.parentId) break;
    current = getFileById(current.parentId);
  }
  if (crumbs.length === 0 && currentId === 'root') {
    crumbs.push({ id: 'root', name: 'Network' });
  }
  return crumbs;
};

// New function to simulate mounting a drive after login
export const mountCloudDrive = (serviceType: 'gdrive' | 'dropbox' | 'onedrive'): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Check if already exists to prevent duplicates
      const exists = mockFiles.some(f => f.parentId === 'root' && f.id.startsWith(serviceType.substring(0, 2)));
      
      if (!exists) {
        const newFiles = cloudDriveTemplates[serviceType];
        if (newFiles) {
          mockFiles = [...mockFiles, ...newFiles];
        }
      }
      resolve();
    }, 1500); // Simulate network handshake
  });
};

export const getSiblings = (parentId: string | null): FileData[] => {
   if(!parentId) return [];
   return mockFiles.filter(f => f.parentId === parentId && f.type === FileType.VIDEO);
}