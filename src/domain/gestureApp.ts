
export type GestureAppState = "idle" | "slideshow" | "paused" | "singleImage";

export type GestureAppEvents = 'changeState';

export type GestureAppBaseEvent = Record<string, unknown>;
