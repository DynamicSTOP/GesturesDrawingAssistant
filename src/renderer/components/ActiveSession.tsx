import { Flex } from "@radix-ui/themes";

interface ActiveSessionProps {
  baseUrl: string;
  currentMediaId: string;
  currentSlideShowInterval: number;
}

export const ActiveSession: React.FC<ActiveSessionProps> = ({ baseUrl, currentMediaId, currentSlideShowInterval }) => (
  currentMediaId ? (
    <Flex align="center" justify="center" style={{ minHeight: "100vh" }}>
      <img
        src={`${baseUrl}${currentMediaId}`}
        alt="Media"
        style={{
          maxWidth: "98vw",
          maxHeight: "98vh",
          width: "auto",
          height: "auto",
          display: "block",
          margin: "auto",
          objectFit: "contain"
        }}
      />
      {/* Progress Bar at the bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100vw",
          height: "20px",
          background: "#222",
          zIndex: 10,
          overflow: "hidden"
        }}
      >
        <div
          key={currentMediaId} // restart animation on index change
          style={{
            height: "100%",
            width: "100%",
            background: "linear-gradient(90deg, #A78BFA, #7C3AED)",
            transform: "scaleX(0)",
            transformOrigin: "left",
            animation: `session-progress-bar-grow ${currentSlideShowInterval}ms linear forwards`
          }}
        />
        <style>
          {`
            @keyframes session-progress-bar-grow {
              from {
                transform: scaleX(0);
              }
              to {
                transform: scaleX(1);
              }
            }
          `}
        </style>
      </div>
    </Flex>) : null
);