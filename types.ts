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