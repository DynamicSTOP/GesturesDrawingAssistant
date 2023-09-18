import React, {useContext} from "react";
import {MainBody} from "./ui/MainBody";
import {Screens} from "../domain/types";
import {Intro} from "./components/Intro";
import {Container} from "./ui/Container";
import {AppContext} from "./context/AppContext";

export const App: React.FC = () => {
  const {currentScreen} = useContext(AppContext);

  return <MainBody>
    <Container $visible={currentScreen === Screens.Intro}>
      <Intro/>
    </Container>
  </MainBody>
}