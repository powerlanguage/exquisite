import React from "react";
import SetUsername from "./SetUsername";

import { GAME_STATUS } from "./Game";

import styles from "./Welcome.module.css";

export default function Welcome({
  users,
  startGame,
  currentUser,
  gameStatus,
  maxPlayers,
  joinGame,
}) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1>E X Q U I S I T E</h1>
        {!currentUser.username ? (
          <SetUsername onSubmit={joinGame} />
        ) : (
          <div>
            <p>
              Hello <strong>{currentUser.username}</strong>
            </p>
            <p>
              This is a collaborative experience. You'll need some way of
              communicating with your fellow players (e.g. Slack).
            </p>
            {users && (
              <React.Fragment>
                <p>
                  Connected users:{" "}
                  {users.map((user) => user.username).join(", ")}
                </p>
                <p>{`${users.length}/${maxPlayers}`}</p>
              </React.Fragment>
            )}
            {gameStatus === GAME_STATUS.WAITING &&
              (currentUser.isOwner ? (
                <button onClick={startGame}>Start</button>
              ) : (
                <p>Waiting for more players to join.</p>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
