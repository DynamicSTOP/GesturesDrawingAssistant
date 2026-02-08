
export type GestureAppState = "idle" | "slideshow" | "paused" | "singleImage";

export type GestureAppEvents = 'changeState' | 'changeCurrentMediaId' | 'changeCurrentSlideShowInterval';

export type GestureAppBaseEvent = Record<string, unknown>;
