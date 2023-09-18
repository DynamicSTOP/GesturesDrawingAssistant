import React, {useCallback, useContext} from "react";
import {ButtonTo} from "../ui/ButtonTo";
import {ButtonRow} from "../ui/ButtonRow";
import {AppContext} from "../context/AppContext";
import {Screens} from "../../domain/types";


const nav = [
  {screen: Screens.Intro, text: 'Home'},
  {screen: Screens.ImportFiles, text: 'Import'},
  {screen: Screens.Gallery, text: 'Gallery'},
  {screen: Screens.Settings, text: 'Settings'},
  {screen: Screens.Practice, text: 'Practice'}
]

export const Intro = () => {
  const {currentScreen, setCurrentScreen} = useContext(AppContext);

  const goTo = useCallback<React.MouseEventHandler<HTMLElement>>((e) => {
    console.log(Number.parseInt(e.currentTarget.dataset.screen, 10));
    setCurrentScreen(Number.parseInt(e.currentTarget.dataset.screen, 10));
  }, [setCurrentScreen]);

  return <ButtonRow>
    {nav.map(({screen, text}) => <ButtonTo key={screen} $active={screen === currentScreen} onClick={goTo}
                                           data-screen={screen}>{text}</ButtonTo>)}
  </ButtonRow>
}