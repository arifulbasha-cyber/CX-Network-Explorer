import { FileData, FileType } from '../types';

// Store files in a let variable so we can modify them at runtime (simulate mounting drives)
let mockFiles: FileData[] = [
  // Root Level - Initially just one local server
  { id: 'root', name: 'Network', type: FileType.FOLDER, parentId: null },
  
  // Existing SMB Server (Simulating a local NAS that is always there)
  { 
    id: 'smb-1', 
    name: 'Local NAS (SMB)', 
    type: FileType.FOLDER, 
    parentId: 'root', 
    size: '4TB', 
    date: 'Online',
    storageTotal: '4 TB',
    storageUsed: '2.8 TB',
    usagePct: 70
  },
  
  // Inside SMB
  { id: 'smb-movies', name: 'Movies', type: FileType.FOLDER, parentId: 'smb-1', date: '2023-10-20' },
  { id: 'smb-shows', name: 'TV Shows', type: FileType.FOLDER, parentId: 'smb-1', date: '2023-10-22' },
  
  // SMB Content
  { 
    id: 'mov-1', 
    name: '01_Big_Buck_Bunny.mp4', 
    type: FileType.VIDEO, 
    parentId: 'smb-movies', 
    size: '150MB', 
    date: '2008-05-20',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://picsum.photos/200/120?random=1'
  },
  { 
    id: 'mov-2', 
    name: '02_Elephant_Dreams.mp4', 
    type: FileType.VIDEO, 
    parentId: 'smb-movies', 
    size: '120MB', 
    date: '2006-03-24',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://picsum.photos/200/120?random=2'
  },
];

// Templates for Cloud Drives (to be injected when user "Logs in")
const cloudDriveTemplates: Record<string, FileData[]> = {
  'gdrive': [
    { 
      id: 'gd-root', 
      name: 'Google Drive', 
      type: FileType.FOLDER, 
      parentId: 'root', 
      size: '15GB', 
      date: 'Synced',
      storageTotal: '15 GB',
      storageUsed: '12.4 GB',
      usagePct: 82 
    },
    { id: 'gd-docs', name: 'My Documents', type: FileType.FOLDER, parentId: 'gd-root', date: '2023-11-01' },
    { id: 'gd-photos', name: 'Vacation Photos', type: FileType.FOLDER, parentId: 'gd-root', date: '2023-09-15' },
    { id: 'gd-vid-1', name: 'Project_Alpha_Demo.mp4', type: FileType.VIDEO, parentId: 'gd-root', size: '50MB', date: '2023-11-01', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
    { id: 'gd-vid-2', name: 'Meeting_Recording_Oct.mp4', type: FileType.VIDEO, parentId: 'gd-root', size: '200MB', date: '2023-10-05', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
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