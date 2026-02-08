import type Database from "better-sqlite3";

import { getDBSetting } from "./database";

export type GestureAppState = "idle" | "slideshow" | "paused" | "singleImage";

export type GestureAppEvents = 'changeState';

export type GestureAppBaseEvent = Record<string, unknown>;

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
}

