import crypto from "node:crypto";
import fs from "node:fs";

import type Database from "better-sqlite3";

import type { GestureAppBaseEvent, GestureAppEvents, GestureAppState } from "../domain/gestureApp";
import { GestureAppStateEnum } from "../domain/gestureApp";
import { shuffleArray } from "../domain/helpers";
import { getDBSetting, upsertDBSetting } from "./database";
import { listImagesInFolder } from "./server/api/listFolder";

export class GestureApp extends EventTarget {
  constructor({ db }: { db: Database.Database }) {
    super();
    this.db = db;
    this.init();
  }

  private readonly db: Database.Database;

  private mediaFolder: string = process.cwd();

  private state: GestureAppState = GestureAppStateEnum.IDLE;

  private currentSlideShowInterval = 40000;

  private currentGreyscale = 0;

  private randomFlip = false;

  private readMediaFolderFromDB(): string {
    try {
      const folder = getDBSetting(this.db, "media_folder");
      if (folder === undefined || folder.trim() === '') {
        return process.cwd();
      }
      const folderStats = fs.statSync(folder);
      if (folderStats.isDirectory()) {
        return folder;
      }
    } catch {
      // fallthrough
    }
    return process.cwd();
  }

  private readRandomFlipFromDB(): boolean {
    try {
      const randomFlip = getDBSetting(this.db, "random_flip");
      if (randomFlip === undefined) {
        return false;
      }
      return randomFlip === "true";
    } catch {
      return false;
    }
  }

  private readCurrentSlideShowIntervalFromDB(): number {
    try {
      const interval = getDBSetting(this.db, "current_slide_show_interval");
      if (interval === undefined) {
        return 40000;
      }
      const n = Number.parseInt(interval, 10);
      if (!Number.isNaN(n) && n > 0 && n < 600000) {
        return n;
      }
    } catch {
      // fallthrough
    }
    return 40000;
  }

  private readCurrentGreyscaleFromDB(): number {
    try {
      const greyscale = getDBSetting(this.db, "current_greyscale");
      if (greyscale === undefined) {
        return 0;
      }
      const n = Number.parseInt(greyscale, 10);
      if (!Number.isNaN(n) && n >= 0 && n <= 100) {
        return n;
      }
    } catch {
      // fallthrough
    }
    return 0;
  }

  private init() {
    this.randomFlip = this.readRandomFlipFromDB();
    this.mediaFolder = this.readMediaFolderFromDB();
    this.currentSlideShowInterval = this.readCurrentSlideShowIntervalFromDB();
    this.currentGreyscale = this.readCurrentGreyscaleFromDB();
  }

  static makeEvent(type: GestureAppEvents, detail: GestureAppBaseEvent): CustomEvent<GestureAppBaseEvent> {
    return new CustomEvent<GestureAppBaseEvent>(type, { detail });
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
    if (state === GestureAppStateEnum.SLIDESHOW) {
      this.startSlideShow();
    }
    if (state === GestureAppStateEnum.MANUAL) {
      this.pauseSlideShow();
    }
    if (state === GestureAppStateEnum.IDLE) {
      this.stopSlideShow();
    }
  }


  getMediaFolder(): string {
    return this.mediaFolder;
  }

  setMediaFolder(folder: string) {
    upsertDBSetting(this.db, "media_folder", folder);
    this.mediaFolder = folder;
    this.setCurrentMediaId("");
    this.mediaIdsMap.clear();
    this.dispatchEvent(GestureApp.makeEvent('changeMediaFolder', { mediaFolder: this.mediaFolder }));
  }

  private readonly mediaIdsMap = new Map<string, string>();

  private getMediaIdsList(): string[] {
    console.log("getMediaIdsList", this.mediaFolder);
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

  getCurrentGreyscale(): number {
    return this.currentGreyscale;
  }

  setCurrentGreyscale(greyscale?: number) {
    if (greyscale === undefined || this.currentGreyscale === greyscale) {
      return;
    }
    this.currentGreyscale = Math.max(0, Math.min(100, greyscale));
    upsertDBSetting(this.db, "current_greyscale", String(this.currentGreyscale));
    this.dispatchEvent(GestureApp.makeEvent('changeCurrentGreyscale', { greyscale: this.currentGreyscale }));
  }

  getCurrentSlideShowInterval(): number {
    return this.currentSlideShowInterval;
  }

  setCurrentSlideShowInterval(interval?: number) {
    if (interval === undefined || this.currentSlideShowInterval === interval) {
      return;
    }
    this.currentSlideShowInterval = interval;
    upsertDBSetting(this.db, "current_slide_show_interval", String(this.currentSlideShowInterval));
    this.dispatchEvent(GestureApp.makeEvent('changeCurrentSlideShowInterval', { interval: this.currentSlideShowInterval }));
  }

  getCurrentMediaId(): string | null {
    return this.currentMediaId;
  }

  setCurrentMediaId(mediaId: string) {
    console.log("setCurrentMediaId", mediaId);
    this.currentMediaId = mediaId;
    this.dispatchEvent(GestureApp.makeEvent('changeCurrentMediaId', { mediaId: this.currentMediaId }));
  }

  private slideShowInterval: NodeJS.Timeout | null = null;

  private slideShowList: string[] = [];

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
    this.slideShowList = list;
    this.setState(GestureAppStateEnum.SLIDESHOW);
    this.slideShowInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % list.length;
      const newMediaId = list[currentIndex];
      this.setCurrentMediaId(newMediaId);
    }, this.currentSlideShowInterval);
  }

  public pauseSlideShow() {
    if (this.slideShowInterval !== null) {
      clearInterval(this.slideShowInterval);
    }
    this.slideShowInterval = null;
    this.setState(GestureAppStateEnum.MANUAL);
  }

  public switchMedia(forward: boolean) {
    if (this.slideShowList.length === 0) {
      return;
    }
    let currentIndex = 0;
    if (this.currentMediaId !== null) {
      currentIndex = this.slideShowList.indexOf(this.currentMediaId);
    }
    const newIndex = (forward ? (currentIndex + 1) : (currentIndex - 1 + this.slideShowList.length)) % this.slideShowList.length;
    this.setCurrentMediaId(this.slideShowList[newIndex]);
    this.pauseSlideShow();
  }

  public stopSlideShow() {
    if (this.slideShowInterval !== null) {
      clearInterval(this.slideShowInterval);
    }
    this.slideShowInterval = null;
    this.setState(GestureAppStateEnum.IDLE);
  }

  getRandomFlip(): boolean {
    return this.randomFlip;
  }

  setRandomFlip(randomFlip = false) {
    if(this.randomFlip === randomFlip) {
      return;
    }
    this.randomFlip = randomFlip;
    upsertDBSetting(this.db, "random_flip", String(this.randomFlip));
    this.dispatchEvent(GestureApp.makeEvent('changeRandomFlip', { randomFlip: this.randomFlip }));
  }

  private readonly mediaIdsFlippedMap = new Map<string, boolean>();

  isMediaIdFlipped(mediaId: string | null): boolean {
    if (mediaId === null || !this.getRandomFlip()) {
      return false;
    }
    const isMediaFlipped = this.mediaIdsFlippedMap.get(mediaId);

    if (isMediaFlipped === undefined) {
      const isFlipped = Math.random() < 0.5;
      this.mediaIdsFlippedMap.set(mediaId, isFlipped);
      return isFlipped;
    }

    return isMediaFlipped;
  }
}

