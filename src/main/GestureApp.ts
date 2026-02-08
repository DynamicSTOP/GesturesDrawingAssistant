import crypto from "node:crypto";
import path from "node:path";

import type Database from "better-sqlite3";

import type { GestureAppBaseEvent, GestureAppEvents, GestureAppState } from "../domain/gestureApp";
import { getDBSetting, upsertDBSetting } from "./database";
import { listImagesInFolder } from "./server/api/listFolder";

export class GestureApp extends EventTarget {
  constructor({ db }: { db: Database.Database }) {
    super();
    this.db = db;
  }

  private readonly db: Database.Database;

  private state: GestureAppState = "idle";

  static makeEvent(type: GestureAppEvents, detail: GestureAppBaseEvent): CustomEvent<GestureAppBaseEvent> {
    return new CustomEvent<GestureAppBaseEvent>(type, { detail });
  }

  getSetting(key: string) {
    return getDBSetting(this.db, key);
  }

  getState() {
    return this.state;
  }

  switchState(state: GestureAppState) {
    if (this.state === state) {
      console.warn(`State ${state} is already active`);
      return;
    }
    this.state = state;
    this.dispatchEvent(GestureApp.makeEvent('changeState', { state: this.state }));
  }

  getMediaFolder(): string {
    return getDBSetting(this.db, "media_folder") ?? process.cwd();
  }

  setMediaFolder(folder: string) {
    upsertDBSetting(this.db, "media_folder", folder);
  }

  private readonly mediaIdsMap = new Map<string, string>();

  public getMediaIdsList(): string[] {
    // return getDBSetting(this.db, "media_ids_list") ?? [];

    const files = listImagesInFolder({ folderPath: `${this.getMediaFolder()}/` });
    files.forEach(file => {
      this.mediaIdsMap.set(crypto.randomUUID(), file);
    });
    return Array.from(this.mediaIdsMap.keys());
  }

  getMediaIdFilePath(mediaId: string | undefined = ''): string {
    return this.mediaIdsMap.get(mediaId) ?? "";
  }
}

