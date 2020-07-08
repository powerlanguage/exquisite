import React, { useEffect, useCallback, useState } from "react";

import Welcome from "./Welcome";
import Whiteboards from "./Whiteboards";
import { useSocket } from "./contexts/socket";
import useLocalStorage from "./hooks/useLocalStorage";

import styles from "./Game.module.css";

console.log("node env:", process.env.NODE_ENV);

export const GAME_STATUS = {
  WAITING: "WAITING",
  IN_PROGRESS: "IN_PROGRESS",
  FINISHED: "FINISHED",
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

export const WHITEBOARD_SIZE = 275;

export default function Game() {
  const [users, setUsers] = useState([]);
  const [lastMessage, setLastMessage] = useState(null);
  const [username, setUsername] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(0);
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.WAITING);
  const [whiteboardHistory, setWhiteboardHistory] = useState({});
  const [currentUser, setCurrentUser] = useState({});
  const [localStorage, setLocalStorage] = useLocalStorage("exquisite", {});
  const [neighborhood, setNeighborhood] = useState([]);
  const [finishedState, setFinishedState] = useState([[]]);
  const [ws, socketReadyState] = useSocket();

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

  const handleWSMessage = useCallback((message) => {
    console.log(message);
    const { type, payload } = JSON.parse(message);
    switch (type) {
      case "update game": {
        // console.log("setting users", payload);
        setUsers(payload.playersSummary);
        setGameStatus(payload.status);
        setMaxPlayers(payload.maxPlayers);
        setFinishedState(payload.finishedState || [[]]);

        return;
      }
      case "set current player": {
        setCurrentUser(payload);
        return;
      }
      case "set neighborhood": {
        console.log("setting neighborhood", payload);
        setNeighborhood(payload);
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
  }, []);

  useEffect(() => {
    if (!ws) return;
    ws.onmessage = (event) => {
      console.log("WS message received");
      const message = event.data;
      handleWSMessage(message);
    };
  }, [handleWSMessage, ws]);

  // TODO no longer need to store this locally, can just send up
  useEffect(() => {
    // Username check prevents running on initial render
    if (username) {
      joinGame();
    }
  }, [username, joinGame]);

  // Update local storage to reflect currentUser.
  // intentionally not including setLocalStorage in deps. Hook needs to be
  // updated with useCallback.
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
  }, [
    socketReadyState,
    localStorage.whiteboardId,
    attemptReconnect,
    currentUser.whiteboardId,
  ]);

  return (
    <div className={styles.container}>
      {gameStatus === GAME_STATUS.WAITING ? (
        <Welcome
          currentUser={currentUser}
          setUsername={setUsername}
          users={users}
          startGame={startGame}
          gameStatus={gameStatus}
          maxPlayers={maxPlayers}
        />
      ) : (
        <Whiteboards
          playerGrid={
            gameStatus === GAME_STATUS.IN_PROGRESS
              ? neighborhood
              : finishedState
          }
          sendWSMessage={sendWSMessage}
          lastMessage={lastMessage}
          currentUser={currentUser}
          gameStatus={gameStatus}
          // TODO rename this in local state to be plural
          whiteboardHistories={whiteboardHistory}
        />
      )}
    </div>
  );
}
