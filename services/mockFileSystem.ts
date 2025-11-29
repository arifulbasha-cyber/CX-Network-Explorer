import { FileData, FileType } from '../types';

// Simulating a flat database for a tree structure
const mockFiles: FileData[] = [
  // Root Level - Network Only
  { id: 'root', name: 'Network', type: FileType.FOLDER, parentId: null },
  
  // SMB Server
  { id: 'smb-1', name: 'Home NAS (SMB)', type: FileType.FOLDER, parentId: 'root', size: '4TB', date: 'Online' },
  { id: 'cloud-1', name: 'Google Drive', type: FileType.FOLDER, parentId: 'root', size: '100GB', date: 'Synced' },
  { id: 'cloud-2', name: 'Dropbox', type: FileType.FOLDER, parentId: 'root', size: '2TB', date: 'Synced' },
  
  // Inside SMB
  { id: 'smb-movies', name: 'Movies', type: FileType.FOLDER, parentId: 'smb-1', date: '2023-10-20' },
  { id: 'smb-shows', name: 'TV Shows', type: FileType.FOLDER, parentId: 'smb-1', date: '2023-10-22' },
  
  // Inside Movies (Playlist Content)
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
  { 
    id: 'mov-3', 
    name: '03_For_Bigger_Blazes.mp4', 
    type: FileType.VIDEO, 
    parentId: 'smb-movies', 
    size: '15MB', 
    date: '2020-01-01',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://picsum.photos/200/120?random=3'
  },
  { 
    id: 'mov-4', 
    name: '04_For_Bigger_Escapes.mp4', 
    type: FileType.VIDEO, 
    parentId: 'smb-movies', 
    size: '15MB', 
    date: '2020-01-02',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://picsum.photos/200/120?random=4'
  },

  // Inside Google Drive
  { id: 'gd-docs', name: 'Work Documents', type: FileType.FOLDER, parentId: 'cloud-1', date: '2023-11-01' },
  { id: 'gd-vid', name: 'Project_Alpha_Demo.mp4', type: FileType.VIDEO, parentId: 'cloud-1', size: '50MB', date: '2023-11-01', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
];

export const getFiles = (parentId: string): Promise<FileData[]> => {
  return new Promise((resolve) => {
    // Faster simulation for snappier native feel
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

// Helper to get sibling files for playlist construction
export const getSiblings = (parentId: string | null): FileData[] => {
   if(!parentId) return [];
   return mockFiles.filter(f => f.parentId === parentId && f.type === FileType.VIDEO);
}