import React, { useEffect, useCallback, useState, useMemo } from "react";
import Whiteboard from "./Whiteboard";
import WhiteboardPlaceholder from "./WhiteboardPlaceholder";
import Welcome from "./Welcome";
import { useSocket } from "./contexts/socket";
import { shiftValueToCenterAndWrap } from "./utils/arrayHelpers";
import { getUserByUsername } from "./utils/userHelpers";

import styles from "./Game.module.css";
console.log("node env:", process.env.NODE_ENV);

export const GAME_STATUS = {
  WAITING: "WAITING",
  IN_PROGRESS: "IN_PROGRESS",
};

export const USER_STATUS = {
  WAITING: "WAITING",
  PLAYING: "PLAYING",
};

// const READYSTATES = {
//   0: "CONNECTING",
//   1: "OPEN",
//   2: "CLOSING",
//   3: "CLOSED",
// };

const MAX_USERS = 9;

const WHITEBOARD_SIZE = 275;

// // Can this be set dynamically somehow?
// const WS_URL =
//   process.env.NODE_ENV === "development"
//     ? "ws://localhost:5000"
//     : window.location.origin.replace(/^http/, "ws");

// const ws = new WebSocket(WS_URL);

export default function Game() {
  // console.log(READYSTATES[ws.readyState]);

  const [users, setUsers] = useState([]);
  const [lastMessage, setLastMessage] = useState(null);
  const [username, setUsername] = useState("");
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.WAITING);
  const [whiteboardHistories, setWhiteboardHistories] = useState({});

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
  const joinGame = () => sendWSMessage(JSON.stringify({ type: "join game" }));

  const handleWSMessage = useCallback(
    (message) => {
      console.log(message);
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
        case "set game status": {
          setGameStatus(payload);
          return;
        }
        case "join game": {
          setWhiteboardHistories(payload.history);
          return;
        }
        default: {
          console.log("WS Unknown message type received");
          return;
        }
      }
    },
    [username]
  );

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

  // Having users only in one place in state means we do not
  // have to keep them in sync if an attribute changes (e.g. status)
  const currentUser = useMemo(() => {
    const [user] = users.filter((user) => user.username === username);
    return user || {};
  }, [users, username]);

  console.log(currentUser);

  return (
    <div className={styles.container}>
      {gameStatus === GAME_STATUS.WAITING ||
      currentUser.status === USER_STATUS.WAITING ? (
        <Welcome
          currentUser={currentUser}
          setUsername={setUsername}
          users={users}
          startGame={startGame}
          joinGame={joinGame}
          gameStatus={gameStatus}
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
                isActive={user.username === currentUser.username}
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
                whiteboardHistory={
                  whiteboardHistories[user.whiteboardId] || null
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
