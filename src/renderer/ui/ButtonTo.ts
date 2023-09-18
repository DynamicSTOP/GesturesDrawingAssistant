import styled, {css} from "styled-components";
import {device} from "./devices";

export const ButtonTo = styled.button<{ $active?: boolean }>`
  border: 1px solid grey;
  border-radius: 5px;
  padding: 0.5rem 0.75rem;
  background: none;
  color: white;

  ${({$active}) => $active && css`border-color: green;`}
  &:hover {
    background: #535353;
    cursor: pointer;
  }
`;