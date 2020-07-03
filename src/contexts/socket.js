import React, { useEffect, useState, useContext } from "react";

const WS_URL =
  process.env.NODE_ENV === "development"
    ? "ws://localhost:5000"
    : window.location.origin.replace(/^http/, "ws");

const SocketContext = React.createContext();

export default function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [readyState, setReadyState] = useState(null);

  useEffect(() => {
    const socket = new WebSocket(WS_URL);
    setSocket(socket); // TODO
    setReadyState(socket.readyState);
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.onopen = () => {
      console.log("WS connected");
      setReadyState(socket.readyState);
    };
    socket.onclose = () => {
      console.log("WS disconnected");
      setReadyState(socket.readyState);
    };
    return () => {
      console.log("WS closing socket...");
      socket.close();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={[socket, readyState]}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
