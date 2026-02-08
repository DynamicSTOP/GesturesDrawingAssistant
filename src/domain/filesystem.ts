export interface MediaFile {
  isFile: boolean;
  id: string;
  path: string;
  size: number;
}
export type MediaFiles = MediaFile[];


export interface Folders extends Record<string, unknown> {
  path: string;
  folderNames: string[];
  files: number;
}