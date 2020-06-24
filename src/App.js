import React, { useEffect, useCallback, useState } from "react";
// import throttle from "lodash.throttle";
import Whiteboard from "./Whiteboard";

import "./App.css";

console.log("node env:", process.env.NODE_ENV);

const READYSTATES = {
  0: "CONNECTING",
  1: "OPEN",
  2: "CLOSING",
  3: "CLOSED",
};

// Can this be set dynamically somehow?
const WS_URL =
  process.env.NODE_ENV === "development"
    ? "ws://localhost:5000"
    : window.location.origin.replace(/^http/, "ws");

const ws = new WebSocket(WS_URL);

export default function App() {
  // console.log(READYSTATES[ws.readyState]);

  const [canvasIds, setCanvasIds] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);

  // Check WS ready state before sending
  const sendWSMessage = useCallback((message) => {
    ws.send(message);
  }, []);

  const handleWSMessage = useCallback((message) => {
    console.log(message);
    const { type, payload } = JSON.parse(message);
    switch (type) {
      case "setup": {
        setCanvasIds(payload.ids);
        return;
      }
      case "draw": {
        setLastMessage(payload);
        console.log("TODO: App wants to draw to a canvas here plz");
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
        <div style={{ display: "flex", flexDirection: "row" }}>
          {canvasIds.map((id, index) => (
            <Whiteboard
              isActive={index === 0}
              id={id}
              width={300}
              height={300}
              onEmit={sendWSMessage}
              lineToDraw={
                lastMessage && lastMessage.id === id ? lastMessage : null
              }
            />
          ))}
        </div>
      )}
    </React.Fragment>
  );
}
