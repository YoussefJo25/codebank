export type Language = "cpp" | "python" | "java" | "javascript";

export interface UserProfile {
  id: string;
  full_name: string;
  phone_number: string;
  academic_status: string;
  university?: string | null;
  faculty?: string | null;
  gender: string;
  avatar_url?: string | null;
}

export interface Topic {
  id: string;
  folderId: string;
  title: string;
  language: Language;
  code: string;
  explanation: string;
  tags: string[];
  complexity: string;
  includeInExport: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Folder {
  id: string;
  parentId?: string | null;
  name: string;
  createdAt: number;
}

export interface CodeBankData {
  folders: Folder[];
  topics: Topic[];
}

export interface BackupFile extends CodeBankData {
  app: "codebank";
  version: 1;
  exportedAt: string;
}

export type PdfPageSize = "A4" | "LETTER";
export type PdfColumns = 1 | 2;

export interface PdfExportSettings {
  columns: PdfColumns;
  codeFontSize: number;
  pageSize: PdfPageSize;
  showPageNumbers: boolean;
  showHeaders: boolean;
  title: string;
  subtitle: string;
}
