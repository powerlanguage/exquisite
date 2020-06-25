import React, { useEffect, useCallback, useState } from "react";
// import throttle from "lodash.throttle";
import Whiteboard from "./Whiteboard";
import styles from "./App.module.css";

// import "./App.css";

console.log("node env:", process.env.NODE_ENV);

const READYSTATES = {
  0: "CONNECTING",
  1: "OPEN",
  2: "CLOSING",
  3: "CLOSED",
};

const WHITEBOARD_SIZE = 350;

// Can this be set dynamically somehow?
const WS_URL =
  process.env.NODE_ENV === "development"
    ? "ws://localhost:5000"
    : window.location.origin.replace(/^http/, "ws");

const ws = new WebSocket(WS_URL);

export default function App() {
  // console.log(READYSTATES[ws.readyState]);

  const [canvasId, setCanvasId] = useState(null);
  const [canvasIds, setCanvasIds] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);

  // Check WS ready state before sending
  const sendWSMessage = useCallback((message) => {
    console.log("WS sending message", message);
    ws.send(message);
  }, []);

  const handleWSMessage = useCallback((message) => {
    console.log(message);
    const { type, payload } = JSON.parse(message);
    switch (type) {
      case "setup": {
        setCanvasId(payload.canvasId);
        setCanvasIds(payload.canvasIds);
        return;
      }
      case "draw": {
        setLastMessage(payload);
        return;
      }
      default: {
        console.log("WS Unknown message type received");
        return;
      }
    }
  }, []);

  useEffect(() => {
    ws.onopen = () => {
      console.log("WS connected");
    };
    ws.onclose = () => {
      console.log("WS disconnected");
    };
    ws.onmessage = (event) => {
      console.log("WS message received");
      const message = event.data;
      handleWSMessage(message);
    };
  }, [handleWSMessage]);

  return (
    <React.Fragment>
      {!canvasIds ? (
        "Loading..."
      ) : (
        <div
          className={styles.whiteboards}
          style={{ width: `${WHITEBOARD_SIZE * 3}px` }}
        >
          {canvasIds.map((id) => (
            <Whiteboard
              isActive={id === canvasId}
              id={id}
              width={WHITEBOARD_SIZE}
              height={WHITEBOARD_SIZE}
              onEmit={sendWSMessage}
              lineToDraw={
                lastMessage && lastMessage.id === id ? lastMessage : null
              }
              key={id}
            />
          ))}
        </div>
      )}
    </React.Fragment>
  );
}
