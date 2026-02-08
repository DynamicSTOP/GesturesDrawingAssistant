import type { CurrentScreen } from "../Privileged";

interface ActiveSessionProps {
  setCurrentScreen: (screen: CurrentScreen) => void;
}

export const ActiveSession: React.FC<ActiveSessionProps> = () => (
  <div>ActiveSession</div>
);