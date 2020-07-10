import React, { useState, useEffect } from "react";
import { useSocket } from "./contexts/socket";

const NAME_MAX_LENGTH = 9;

export default function SetUsername({ onSubmit }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [ws, socketReadyState] = useSocket();

  const handlePlayerNameChange = (e) => {
    const newUsername = e.target.value.trim();
    if (newUsername.length > NAME_MAX_LENGTH) return;
    setUsername(newUsername);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // This sends the join game WS message
    onSubmit(username);
  };

  // This is a trial of having a component manage its own events by listening to the websocket. Lots of copy pasta from Game.js. Not ideal.
  useEffect(() => {
    if (!ws) return;

    const handleError = (event) => {
      console.log("WS message received in SetUsername");
      const message = event.data;
      const { type, payload } = JSON.parse(message);
      if (type === "username error") {
        setError(payload);
      }
    };

    ws.addEventListener("message", handleError);
    return () => ws.removeEventListener("message", handleError);
  }, [ws]);

  return (
    <form onSubmit={handleSubmit}>
      <p>What do you call yourself?</p>
      <p>
        Communication is going to be important so use a name people will
        recognize.
      </p>
      <input
        value={username}
        onChange={handlePlayerNameChange}
        autoFocus
        autoCorrect="off"
        autoComplete="off"
        maxLength={NAME_MAX_LENGTH}
        spellCheck={false}
      />
      <div>
        {!error ? (
          <button className="btn" disabled={username.length === 0}>
            Let's Go!
          </button>
        ) : (
          <p style={{ color: "#ff0000" }}>{error}</p>
        )}
      </div>
    </form>
  );
}
