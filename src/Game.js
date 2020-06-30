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

export default function Game() {
  const [users, setUsers] = useState([]);
  const [lastMessage, setLastMessage] = useState(null);
  const [username, setUsername] = useState("");
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.WAITING);
  const [whiteboardHistory, setWhiteboardHistory] = useState({});

  const ws = useSocket();

  // Check WS ready state before sending
  const sendWSMessage = useCallback(
    (message) => {
      if (!ws) return;
      ws.send(message);
    },
    [ws]
  );

  const startGame = useCallback(
    () => sendWSMessage(JSON.stringify({ type: "start game" })),
    [sendWSMessage]
  );
  const joinGame = useCallback(
    () =>
      sendWSMessage(JSON.stringify({ type: "join game", payload: username })),
    [sendWSMessage, username]
  );

  const handleWSMessage = useCallback(
    (message) => {
      console.log(message);
      const { type, payload } = JSON.parse(message);
      switch (type) {
        case "update game": {
          // console.log("setting users", payload);
          setUsers(payload.players);
          setGameStatus(payload.status);
          return;
        }
        case "clear":
        case "draw": {
          // TODO this word
          setLastMessage({ type, payload });
          return;
        }
        case "set history": {
          setWhiteboardHistory(payload);
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
    // Username check prevents running on initial render
    if (username) {
      console.log("Join game");
      joinGame();
    }
  }, [username, joinGame]);

  // We want to always display the current user in the center of the canvas and
  // re-wrap the other positions around them.
  // TODO: move this padding into the server.
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

  console.log({ currentUser });
  return (
    <div className={styles.container}>
      {gameStatus === GAME_STATUS.WAITING ? (
        <Welcome
          currentUser={currentUser}
          setUsername={setUsername}
          users={users}
          startGame={startGame}
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
                whiteboardHistory={whiteboardHistory[user.whiteboardId] || null}
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
