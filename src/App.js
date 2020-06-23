import React, { useEffect, useState } from "react";

console.log(process.env);

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

  useEffect(() => {
    ws.onopen = () => {
      console.log("WS connected");
    };
    ws.onclose = () => {
      console.log("WS disconnected");
    };
    ws.onmessage = (event) => {
      console.log("WS message received");
      console.log("existing messages", wsMessages);
      console.log("new data", event.data);
      setWsMessages([...wsMessages, event.data]);
    };
  }, [wsMessages]);

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
    </div>
  );
}
