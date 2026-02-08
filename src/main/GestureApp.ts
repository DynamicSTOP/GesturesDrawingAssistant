import type Database from "better-sqlite3";

import type { GestureAppBaseEvent, GestureAppEvents, GestureAppState } from "../domain/gestureApp";
import { getDBSetting, upsertDBSetting } from "./database";

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
}

