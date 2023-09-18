export enum Screens {
  Intro, // intro screen
  ImportFiles, // import files into db
  Gallery, // manage tags for files
  Practice,
  Settings, // stay on top etc
  Info, // some advices like books etc
  Journal, // amount of practice for last 30 days
}

export type OldOrSetter<S> = (state: S | ((oldState: S) => S)) => void;
