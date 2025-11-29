export enum FileType {
  FOLDER = 'FOLDER',
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  UNKNOWN = 'UNKNOWN'
}

export interface FileData {
  id: string;
  name: string;
  type: FileType;
  size?: string;
  date?: string;
  url?: string; // For network files
  parentId: string | null;
  thumbnail?: string;
  // Storage usage for Drives (Root level items)
  storageTotal?: string;
  storageUsed?: string;
  usagePct?: number; 
}

export interface HistoryItem {
  fileId: string;
  fileName: string;
  timestamp: number;
  filePath: string;
}

export interface Breadcrumb {
  id: string;
  name: string;
}