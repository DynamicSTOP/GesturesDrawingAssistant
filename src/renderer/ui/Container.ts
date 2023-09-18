import styled, {css} from "styled-components";

export const Container = styled.div<{ $visible?: boolean; }>`
  display: flex;
  flex-direction: column;
  width: 100%;

  ${props => props.$visible === false && css`display: none;`}
`;