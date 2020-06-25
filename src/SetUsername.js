import React, { useState } from "react";

const NAME_MAX_LENGTH = 9;

export default function SetUsername({ onSubmit }) {
  const [username, setUsername] = useState("");

  const handlePlayerNameChange = (e) => {
    const newUsername = e.target.value.trim();

    if (newUsername > NAME_MAX_LENGTH) return;

    setUsername(newUsername);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(username);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Who are you?
        <input
          value={username}
          onChange={handlePlayerNameChange}
          autoFocus
          autoCorrect="off"
          autoComplete="off"
          maxLength={NAME_MAX_LENGTH}
          spellCheck={false}
        />
      </label>
      <button disabled={username.length === 0}>Let's Go!</button>
    </form>
  );
}
