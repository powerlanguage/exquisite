import React from "react";
import SetUsername from "./SetUsername";

import styles from "./Welcome.module.css";

export default function Welcome({ username, setUsername, users }) {
  return (
    <div className={styles.container}>
      <h1>Setting up game</h1>
      {!username ? (
        <SetUsername onSubmit={setUsername} />
      ) : (
        <div>
          <p>Hello {username}</p>
          <p>
            {users &&
              `Connected users: ${users
                .map((user) => user.username)
                .join(", ")}`}
          </p>
        </div>
      )}
    </div>
  );
}
