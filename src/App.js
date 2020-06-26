import React, { useEffect, useCallback, useState } from "react";
import Whiteboard from "./Whiteboard";
import Welcome from "./Welcome";

import styles from "./App.module.css";
console.log("node env:", process.env.NODE_ENV);

const GAME_STATE = {
  WAITING: "WAITING",
  IN_PROGRESS: "IN_PROGRESS",
};

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

  const [users, setUsers] = useState([]);
  const [lastMessage, setLastMessage] = useState(null);
  const [username, setUsername] = useState("");
  const [gameState, setGameState] = useState(GAME_STATE.WAITING);

  // Check WS ready state before sending
  const sendWSMessage = useCallback((message) => {
    console.log("WS sending message", message);
    ws.send(message);
  }, []);

  const handleWSMessage = useCallback((message) => {
    console.log(message);
    const { type, payload } = JSON.parse(message);
    switch (type) {
      case "set users": {
        console.log("setting users", payload);
        setUsers(payload);
        return;
      }
      case "clear":
      case "draw": {
        // TODO this word
        setLastMessage({ type, payload });
        return;
      }
      case "set game state": {
        setGameState(payload);
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

  useEffect(() => {
    if (username) {
      // Check prevents running on initial render
      sendWSMessage(
        JSON.stringify({ type: "new user", payload: { username } })
      );
    }
  }, [username, sendWSMessage]);

  return (
    <div className={styles.container}>
      {gameState === GAME_STATE.WAITING ? (
        <Welcome username={username} setUsername={setUsername} users={users} />
      ) : (
        <div
          className={styles.whiteboards}
          style={{ width: `${WHITEBOARD_SIZE * 3}px` }}
        >
          {users.map((user) => (
            <Whiteboard
              isActive={user.username === username}
              username={user.username}
              id={user.canvasId}
              width={WHITEBOARD_SIZE}
              height={WHITEBOARD_SIZE}
              onEmit={sendWSMessage}
              lastMessage={
                lastMessage &&
                lastMessage.payload &&
                lastMessage.payload.id === user.canvasId
                  ? lastMessage
                  : null
              }
              key={user.canvasId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
