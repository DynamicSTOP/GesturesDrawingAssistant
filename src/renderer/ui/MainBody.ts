import styled from "styled-components";
import {device} from "./devices";

export const MainBody = styled.div`
  background-color: black;
  color: white;
  width: 100%;
  height: 100%;

  @media ${device.laptop} {
    max-width: 1024px;
  }
  

`;