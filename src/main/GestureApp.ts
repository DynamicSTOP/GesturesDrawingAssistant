import crypto from "node:crypto";

import type Database from "better-sqlite3";

import type { GestureAppBaseEvent, GestureAppEvents, GestureAppState } from "../domain/gestureApp";
import { shuffleArray } from "../domain/helpers";
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

  private setState(state: GestureAppState) {
    if (this.state === state) {
      console.warn(`State ${state} is already active`);
      return;
    }
    this.state = state;
    console.log("switchState", state);
    this.dispatchEvent(GestureApp.makeEvent('changeState', { state: this.state }));
  }

  public switchState(state: GestureAppState) {
    if (state === this.getState()) {
      return;
    }
    if (state === 'slideshow') {
      this.startSlideShow();
    }
    if (state === 'idle') {
      this.stopSlideShow();
    }
  }

  getMediaFolder(): string {
    return getDBSetting(this.db, "media_folder") ?? process.cwd();
  }

  setMediaFolder(folder: string) {
    upsertDBSetting(this.db, "media_folder", folder);
    this.setCurrentMediaId("");
    this.mediaIdsMap.clear();
  }

  private readonly mediaIdsMap = new Map<string, string>();

  public getMediaIdsList(): string[] {
    const files = listImagesInFolder({ folderPath: `${this.getMediaFolder()}/` });
    files.forEach(file => {
      this.mediaIdsMap.set(crypto.randomUUID(), file);
    });
    return Array.from(this.mediaIdsMap.keys());
  }

  getMediaIdFilePath(mediaId: string | undefined = ''): string {
    return this.mediaIdsMap.get(mediaId) ?? "";
  }

  private currentMediaId: string | null = null;

  getCurrentMediaId(): string | null {
    return this.currentMediaId;
  }

  private currentSlideShowInterval = 30000;

  setCurrentSlideShowInterval(interval: number) {
    this.currentSlideShowInterval = interval;
    this.dispatchEvent(GestureApp.makeEvent('changeCurrentSlideShowInterval', { interval: this.currentSlideShowInterval }));
  }

  getCurrentSlideShowInterval(): number {
    return this.currentSlideShowInterval;
  }

  setCurrentMediaId(mediaId: string) {
    console.log("setCurrentMediaId", mediaId);
    this.currentMediaId = mediaId;
    this.dispatchEvent(GestureApp.makeEvent('changeCurrentMediaId', { mediaId: this.currentMediaId }));
  }

  private slideShowInterval: NodeJS.Timeout | null = null;

  public startSlideShow() {
    if (this.slideShowInterval !== null) {
      clearInterval(this.slideShowInterval);
    }
    const list = this.getMediaIdsList();
    if (list.length === 0) {
      return;
    }

    shuffleArray(list);
    let currentIndex = 0;
    this.setCurrentMediaId(list[currentIndex]);

    this.setState("slideshow");
    this.slideShowInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % list.length;
      const newMediaId = list[currentIndex];
      this.setCurrentMediaId(newMediaId);
    }, this.currentSlideShowInterval);
  }

  public stopSlideShow() {
    if (this.slideShowInterval !== null) {
      clearInterval(this.slideShowInterval);
    }
    this.slideShowInterval = null;
    this.setState("idle");
  }
}

