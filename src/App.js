import React, { useEffect, useState, useCallback } from "react";

console.log("node env:", process.env.NODE_ENV);

const READYSTATES = {
  0: "CONNECTING",
  1: "OPEN",
  2: "CLOSING",
  3: "CLOSED",
};

// Can this be set dynamically somehow?
const WS_URL =
  process.env.NODE_ENV === "development"
    ? "ws://localhost:5000"
    : window.location.origin.replace(/^http/, "ws");

const ws = new WebSocket(WS_URL);

export default function App() {
  const [apiData, setApiData] = useState(null);
  const [wsMessages, setWsMessages] = useState([]);

  const apiFetch = async () => {
    const res = await fetch("/api/hello");
    const data = await res.json();
    setApiData(data);
  };

  console.log(READYSTATES[ws.readyState]);

  const handleWSMessage = (message) => {
    console.log(message);
    setWsMessages([...wsMessages, message]);
  };

  // Check WS ready state before sending
  const sendWSMessage = (message) => {
    ws.send(message);
  };

  useEffect(() => {
    ws.onopen = () => {
      console.log("WS connected");
    };
    ws.onclose = () => {
      console.log("WS disconnected");
    };
    ws.onmessage = (event) => {
      console.log("WS message received");
      const message = event.data;
      handleWSMessage(message);
    };
  }, [handleWSMessage]);

  return (
    <div>
      <h1>HELLO WORLD DEV!</h1>
      <div>
        <h2>API</h2>
        <button onClick={apiFetch}>apiFetch</button>
        {apiData && JSON.stringify(apiData)}
      </div>
      <div>
        <h2>WS</h2>
        {JSON.stringify(wsMessages)}
      </div>
      <div>
        <h3>Send to server</h3>
        <button
          onClick={() =>
            sendWSMessage("this is the client sending a message to the server")
          }
        >
          Send message to server
        </button>
        <button onClick={() => sendWSMessage("broadcast")}>Broadcast</button>
        <button onClick={() => sendWSMessage("emit")}>Emit</button>
      </div>
    </div>
  );
}
