import React from "react";
import SetUsername from "./SetUsername";

import styles from "./Welcome.module.css";

export default function Welcome({ username, setUsername, users }) {
  return (
    <div className={styles.container}>
      <h1>E X Q U I S I T E</h1>
      {!username ? (
        <SetUsername onSubmit={setUsername} />
      ) : (
        <div>
          <p>
            Hello <strong>{username}</strong>
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
          <p>Waiting for more players to join.</p>
        </div>
      )}
    </div>
  );
}
