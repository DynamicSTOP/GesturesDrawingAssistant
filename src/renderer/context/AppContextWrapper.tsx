import type {ReactNode} from 'react';
import React, {useMemo, useState} from 'react'
import {AppContext, AppContextParams} from './AppContext';
import {Screens} from "../../domain/types";

export const AppContextWrapper = (props: { children: ReactNode }) => {
  const [currentScreen, setCurrentScreen] = useState<Screens>(Screens.Intro);

  const value = useMemo<AppContextParams>(() => ({
    currentScreen, setCurrentScreen
  }), [currentScreen]);

  return <AppContext.Provider value={value}>
    {props.children}
  </AppContext.Provider>

}