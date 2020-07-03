import React, { useEffect, useCallback, useState, useMemo } from "react";
import Whiteboard from "./Whiteboard";
import WhiteboardPlaceholder from "./WhiteboardPlaceholder";
import Welcome from "./Welcome";
import { useSocket } from "./contexts/socket";
import { shiftValueToCenterAndWrap } from "./utils/arrayHelpers";
import useLocalStorage from "./hooks/useLocalStorage";

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

const READYSTATES = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
};

const MAX_USERS = 9;
const WHITEBOARD_SIZE = 275;

export default function Game() {
  const [users, setUsers] = useState([]);
  const [lastMessage, setLastMessage] = useState(null);
  const [username, setUsername] = useState("");
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.WAITING);
  const [whiteboardHistory, setWhiteboardHistory] = useState({});
  const [currentUser, setCurrentUser] = useState({});
  const [playerId, setPlayerId] = useState(null);
  const [localStorage, setLocalStorage] = useLocalStorage("exquisite", {});
  const ws = useSocket();

  // Store this in a nullable value so we can use as a dep in useEffect
  const socketReadyState = ws ? ws.readyState : null;

  // Check WS ready state before sending
  const sendWSMessage = useCallback(
    (message) => {
      if (!ws || ws.readyState !== ws.OPEN) {
        console.log("WS cant send message, socket not ready", message);
        return;
      }
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
  const attemptReconnect = useCallback(() => {
    if (!localStorage.whiteboardId) return;
    console.log("attempting reconnect");
    sendWSMessage(
      JSON.stringify({
        type: "attempt reconnect",
        payload: localStorage.whiteboardId,
      })
    );
  }, [sendWSMessage, localStorage]);

  const handleWSMessage = useCallback(
    (message) => {
      console.log(message);
      const { type, payload } = JSON.parse(message);
      switch (type) {
        case "set player id": {
          setPlayerId(payload);
          return;
        }
        case "update game": {
          // console.log("setting users", payload);
          setUsers(payload.players);
          setGameStatus(payload.status);
          setCurrentUser(payload.currentPlayer);
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
    [playerId]
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
      joinGame();
    }
  }, [username, joinGame]);

  // Update local storage to reflect currentUser
  useEffect(() => {
    if (!currentUser.whiteboardId) return;
    if (currentUser.whiteboardId === localStorage.whiteboardId) return;
    setLocalStorage({ whiteboardId: currentUser.whiteboardId });
  }, [currentUser.whiteboardId, localStorage.whiteboardId]);

  // Attempt reconnect if we find local storage value
  useEffect(() => {
    if (
      socketReadyState === READYSTATES.OPEN &&
      currentUser.whiteboardId !== localStorage.whiteboardId
    ) {
      attemptReconnect();
    }
  }, [socketReadyState, localStorage.whiteboardId, attemptReconnect]);

  // We want to always display the current user in the center of the canvas and
  // re-wrap the other positions around them.
  // TODO: move this padding into the server.
  const rotateSelfToCenter = (users, currentUser) => {
    const [self] = users.filter(
      (user) => user.playerId === currentUser.playerId
    );
    const numMissingUsers = MAX_USERS - users.length;
    const paddedUsers = [...users, ...new Array(numMissingUsers).fill(null)];
    return shiftValueToCenterAndWrap(paddedUsers, self);
  };

  const rotatedUsers = useMemo(() => {
    return rotateSelfToCenter(users, currentUser);
  }, [users, currentUser]); // This is redundant as these are both objects?

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
                isActive={user.playerId === playerId}
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
