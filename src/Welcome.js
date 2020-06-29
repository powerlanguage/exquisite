import React from "react";
import SetUsername from "./SetUsername";

import { GAME_STATUS } from "./Game";

import styles from "./Welcome.module.css";

export default function Welcome({
  setUsername,
  users,
  startGame,
  joinGame,
  currentUser,
  gameStatus,
}) {
  return (
    <div className={styles.container}>
      <h1>E X Q U I S I T E</h1>
      {!currentUser.username ? (
        <SetUsername onSubmit={setUsername} />
      ) : (
        <div>
          <p>
            Hello <strong>{currentUser.username}</strong>
          </p>
          <p>
            This is a collaborative experience. You'll need some way of
            communicating with your fellow players (e.g. Slack).
          </p>
          <p>
            {users &&
              `Connected users: ${users
                .map((user) => user.username)
                .join(", ")}`}
          </p>
          {gameStatus === GAME_STATUS.WAITING ? (
            currentUser.isOwner ? (
              <button onClick={startGame}>Start</button>
            ) : (
              <p>Waiting for more players to join.</p>
            )
          ) : (
            <button onClick={joinGame}>Join</button>
          )}
        </div>
      )}
    </div>
  );
}
