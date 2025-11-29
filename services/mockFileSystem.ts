import { FileData, FileType } from '../types';

// ==========================================
// CONFIGURATION: REAL VS MOCK
// ==========================================
// To make this app REAL, paste your Google Cloud Web Client ID here.
// You must also add 'http://localhost:3000' (or your domain) to "Authorized JavaScript origins" in Google Cloud Console.
const CLIENT_ID = ''; // e.g., "123456789-abc...apps.googleusercontent.com"
const API_KEY = ''; // Optional: API Key for faster non-user data, but Client ID is main requirement for Auth.
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/drive.readonly";

// ==========================================
// MOCK DATA (Fallback)
// ==========================================
let mockFiles: FileData[] = [
  { id: 'root', name: 'Network', type: FileType.FOLDER, parentId: null },
];

const cloudDriveTemplates: Record<string, FileData[]> = {
  'gdrive': [
    { 
      id: 'gd-root', 
      name: 'Google Drive (Demo)', 
      type: FileType.FOLDER, 
      parentId: 'root', 
      size: '15GB', 
      date: 'Synced',
      storageTotal: '100 GB',
      storageUsed: '45 GB',
      usagePct: 45 
    },
    { id: 'gd-movies', name: 'Movies', type: FileType.FOLDER, parentId: 'gd-root', date: '2023-11-10' },
    { id: 'gd-tv', name: 'TV Shows', type: FileType.FOLDER, parentId: 'gd-root', date: '2023-11-12' },
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
      id: 'tv-1', 
      name: 'Review_S01E01.mp4', 
      type: FileType.VIDEO, 
      parentId: 'gd-tv', 
      size: '450MB', 
      date: '2023-12-01', 
      url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4' 
    },
  ]
};

// ==========================================
// REAL API UTILS
// ==========================================
let tokenClient: any;
let gapiInited = false;
let gisInited = false;

export const initGoogleDrive = async (): Promise<boolean> => {
  if (!CLIENT_ID) return false;

  return new Promise((resolve) => {
    const checkScripts = () => {
      if ((window as any).gapi && (window as any).google) {
        // Load GAPI
        (window as any).gapi.load('client', async () => {
          await (window as any).gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: DISCOVERY_DOCS,
          });
          gapiInited = true;
          
          // Load GIS
          tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: '', // defined at request time
          });
          gisInited = true;
          resolve(true);
        });
      } else {
        setTimeout(checkScripts, 500);
      }
    };
    checkScripts();
  });
};

export const loginToGoogleDrive = async (): Promise<boolean> => {
  // If no Client ID, we simulate a login
  if (!CLIENT_ID || !tokenClient) {
    await new Promise(r => setTimeout(r, 1500));
    await mountMockDrive('gdrive');
    return true;
  }

  // Real Login
  return new Promise((resolve, reject) => {
    tokenClient.callback = async (resp: any) => {
      if (resp.error !== undefined) {
        reject(resp);
      }
      resolve(true);
    };
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
};

// ==========================================
// UNIFIED FILE SYSTEM API
// ==========================================

export const getFiles = async (parentId: string): Promise<FileData[]> => {
  // 1. MOCK PATH (Default or if ID is root)
  if (!CLIENT_ID || parentId === 'root' || parentId.startsWith('gd-') || parentId.startsWith('mov-')) {
    // If using Real API, we need to fetch the REAL root folder ID from Google Drive if path is "root"
    if (CLIENT_ID && gapiInited && parentId === 'root') {
        // Return a virtual "Drive" folder that points to real drive root
        // We still need a "Drive" entry point in the UI
        return [{
            id: 'real-drive-root',
            name: 'Google Drive (Real)',
            type: FileType.FOLDER,
            parentId: 'root',
            storageTotal: 'Unknown',
            storageUsed: 'Unknown',
            usagePct: 50
        }];
    }
    
    // Fallback to Mock Logic
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockFiles.filter(f => f.parentId === parentId));
      }, 150); 
    });
  }

  // 2. REAL API PATH
  // Mapping 'real-drive-root' to actual Google Drive 'root'
  const searchId = parentId === 'real-drive-root' ? 'root' : parentId;

  try {
    const response = await (window as any).gapi.client.drive.files.list({
      'pageSize': 100,
      'fields': "files(id, name, mimeType, size, createdTime, webContentLink, iconLink, parents)",
      'q': `'${searchId}' in parents and trashed = false`
    });

    const files = response.result.files;
    return files.map((f: any) => {
        // Determine type
        let type = FileType.UNKNOWN;
        if (f.mimeType === 'application/vnd.google-apps.folder') type = FileType.FOLDER;
        else if (f.mimeType.startsWith('video/')) type = FileType.VIDEO;
        else if (f.mimeType.startsWith('image/')) type = FileType.IMAGE;

        // For video files, webContentLink allows download/stream if public/authed
        // Note: Playing private drive videos in MX Player via Intent often requires the file to be downloadable
        // or for the user to be signed in on the device browser.
        return {
            id: f.id,
            name: f.name,
            type: type,
            parentId: parentId, // Keep our virtual parent ID
            size: f.size ? `${(parseInt(f.size)/1024/1024).toFixed(1)} MB` : undefined,
            date: f.createdTime ? new Date(f.createdTime).toLocaleDateString() : '',
            url: f.webContentLink,
            thumbnail: f.iconLink
        } as FileData;
    });

  } catch (err) {
    console.error("Real Drive API Error", err);
    return [];
  }
};

export const getFileById = (id: string): FileData | undefined => {
  // Only works reliably for mock files synchronously. 
  // Real files would need an async fetch, but our app architecture caches the current folder in state.
  return mockFiles.find(f => f.id === id);
};

export const getBreadcrumbs = (currentId: string): {id: string, name: string}[] => {
  // Simple breadcrumb for Mock
  const crumbs = [];
  let current = getFileById(currentId);
  while (current) {
    crumbs.unshift({ id: current.id, name: current.name });
    if (!current.parentId) break;
    current = getFileById(current.parentId);
  }
  
  // Real Drive Breadcrumb handling would require fetching parents recursively or storing path history.
  // For this prototype, if it's a real ID (not in mock), we just show "..." or simple path.
  if (crumbs.length === 0 && currentId !== 'root') {
      if (currentId === 'real-drive-root') {
          crumbs.push({ id: 'root', name: 'Network' });
          crumbs.push({ id: 'real-drive-root', name: 'Google Drive' });
      } else {
          // Fallback for deep real folders
          crumbs.push({ id: 'root', name: 'Network' });
          crumbs.push({ id: 'real-drive-root', name: 'Google Drive' });
          crumbs.push({ id: currentId, name: 'Current Folder' });
      }
  } else if (crumbs.length === 0 && currentId === 'root') {
    crumbs.push({ id: 'root', name: 'Network' });
  }
  
  return crumbs;
};

// Helper for Simulation
export const mountMockDrive = (serviceType: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const exists = mockFiles.some(f => f.parentId === 'root' && f.name.includes('Drive'));
      if (!exists && cloudDriveTemplates[serviceType]) {
        mockFiles = [...mockFiles, ...cloudDriveTemplates[serviceType]];
      }
      resolve();
    }, 1500); 
  });
};