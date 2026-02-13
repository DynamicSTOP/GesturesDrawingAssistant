export const mediaFolderName = (mediaFolder: string): string => mediaFolder.split("/").pop() ?? "";
