import {createContext} from 'react'
import {OldOrSetter, Screens} from "../../domain/types";

const errorFunc = () => {
  throw new TypeError('not defined');
}

export interface AppContextParams {
  currentScreen: Screens
  setCurrentScreen: OldOrSetter<Screens>
}

export const AppContextMockupVal = {
  currentScreen: Screens.Intro,
  setCurrentScreen: errorFunc,
}

export const AppContext = createContext<AppContextParams>(AppContextMockupVal);