export enum GestureAppStateEnum {
  IDLE = "idle",
  SLIDESHOW = "slideshow",
  MANUAL = "manual",
  SINGLE_IMAGE = "singleImage",
}

export type GestureAppState = GestureAppStateEnum.IDLE | GestureAppStateEnum.SLIDESHOW | GestureAppStateEnum.MANUAL | GestureAppStateEnum.SINGLE_IMAGE;

export type GestureAppEvents = 'changeState' | 'changeCurrentMediaId' | 'changeCurrentSlideShowInterval' | 'changeCurrentGreyscale' | 'changeMediaFolder' | 'changeRandomFlip';

export type GestureAppBaseEvent = Record<string, unknown>;
