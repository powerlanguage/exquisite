import React, { useEffect, useCallback, useState, useMemo } from "react";
import Whiteboard from "./Whiteboard";
import WhiteboardPlaceholder from "./WhiteboardPlaceholder";
import Welcome from "./Welcome";
import { useSocket } from "./contexts/socket";
import { shiftValueToCenterAndWrap } from "./utils/arrayHelpers";

import styles from "./Game.module.css";
console.log("node env:", process.env.NODE_ENV);

const GAME_STATE = {
  WAITING: "WAITING",
  IN_PROGRESS: "IN_PROGRESS",
};

// const READYSTATES = {
//   0: "CONNECTING",
//   1: "OPEN",
//   2: "CLOSING",
//   3: "CLOSED",
// };

const MAX_USERS = 9;

const WHITEBOARD_SIZE = 350;

// // Can this be set dynamically somehow?
// const WS_URL =
//   process.env.NODE_ENV === "development"
//     ? "ws://localhost:5000"
//     : window.location.origin.replace(/^http/, "ws");

// const ws = new WebSocket(WS_URL);

export default function App() {
  // console.log(READYSTATES[ws.readyState]);

  const [users, setUsers] = useState([]);
  const [lastMessage, setLastMessage] = useState(null);
  const [username, setUsername] = useState("");
  const [gameState, setGameState] = useState(GAME_STATE.WAITING);

  const ws = useSocket();

  // Check WS ready state before sending
  const sendWSMessage = useCallback(
    (message) => {
      if (!ws) return;
      ws.send(message);
    },
    [ws]
  );

  const startGame = () => sendWSMessage(JSON.stringify({ type: "start game" }));

  const handleWSMessage = useCallback((message) => {
    // console.log(message);
    const { type, payload } = JSON.parse(message);
    switch (type) {
      case "set users": {
        // console.log("setting users", payload);
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
    if (!ws) return;
    ws.onmessage = (event) => {
      console.log("WS message received");
      const message = event.data;
      handleWSMessage(message);
    };
  }, [handleWSMessage, ws]);

  useEffect(() => {
    if (username) {
      // Username check prevents running on initial render
      sendWSMessage(
        JSON.stringify({ type: "new user", payload: { username } })
      );
    }
  }, [username, sendWSMessage]);

  // We want to always display the current user in the center of the canvas and
  // re-wrap the other positions around them.
  const rotateSelfToCenter = (users, username) => {
    const [self] = users.filter((user) => user.username === username);
    const numMissingUsers = MAX_USERS - users.length;
    const paddedUsers = [...users, ...new Array(numMissingUsers).fill(null)];
    return shiftValueToCenterAndWrap(paddedUsers, self);
  };

  const rotatedUsers = useMemo(() => {
    return rotateSelfToCenter(users, username);
  }, [users, username]);

  return (
    <div className={styles.container}>
      {gameState === GAME_STATE.WAITING ? (
        <Welcome
          username={username}
          setUsername={setUsername}
          users={users}
          // TODO: this doesn't feel great. maybe a dedicated helper function? Or a better username -> user map?
          isOwner={users.some(
            (user) => user.username === username && user.isOwner
          )}
          startGame={startGame}
        />
      ) : (
        <div
          className={styles.whiteboards}
          // TODO: figure this out. Unclear why width alone is wrapping for narrower windows
          style={{
            minWidth: `${WHITEBOARD_SIZE * 3}px`,
            maxWidth: `${WHITEBOARD_SIZE * 3}px`,
          }}
        >
          {rotatedUsers.map((user, index) =>
            !!user ? (
              <Whiteboard
                isActive={user.username === username}
                username={user.username}
                whiteboardId={user.whiteboardId}
                width={WHITEBOARD_SIZE}
                height={WHITEBOARD_SIZE}
                sendMessage={sendWSMessage}
                lastMessage={
                  lastMessage &&
                  lastMessage.payload &&
                  lastMessage.payload.whiteboardId === user.whiteboardId
                    ? lastMessage
                    : null
                }
                key={index}
              />
            ) : (
              <WhiteboardPlaceholder
                width={WHITEBOARD_SIZE}
                height={WHITEBOARD_SIZE}
                key={index}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
