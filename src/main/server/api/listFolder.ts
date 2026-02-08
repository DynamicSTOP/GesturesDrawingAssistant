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