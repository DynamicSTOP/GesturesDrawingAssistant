import fs from "node:fs";
import path from "node:path";

import type { Folders } from "../../../domain/filesystem";
import type { ListFolderMessage } from "../../../domain/messages";

export const listFolder = ({ folderPath, showHidden = false }: { folderPath: string, showHidden?: boolean }): ListFolderMessage['data'] => {
  const files = fs.readdirSync(folderPath).filter(file => showHidden || !file.startsWith("."));
  const folders: Folders = {
    path: path.resolve(folderPath),
    folderNames: [],
    files: 0,
  };
  files.forEach(file => {
    try {
      const stats = fs.statSync(`${folderPath}/${file}`);
      if (stats.isDirectory()) {
        folders.folderNames.push(file);
      } else {
        folders.files++;
      }
    } catch (error) {
      console.error("Error getting stats for file", file, error);
    }
  });
  return folders;
}

const isImageExtension = (extension: string): boolean => [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(extension.toLowerCase());

export const listImagesInFolder = ({ folderPath }: { folderPath: string }): string[] => {
  const imageFiles: string[] = [];
  const files = fs.readdirSync(folderPath);

  files.forEach(file => {
    const stats = fs.statSync(`${folderPath}/${file}`);
    if (stats.isFile() && isImageExtension(path.extname(file))) {
      imageFiles.push(`${folderPath}/${file}`);
    } else if (stats.isDirectory()) {
      imageFiles.push(...listImagesInFolder({ folderPath: `${folderPath}/${file}/` }));
    }
  });

  return imageFiles;
}