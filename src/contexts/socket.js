import React, { useEffect, useState, useContext } from "react";

const WS_URL =
  process.env.NODE_ENV === "development"
    ? "ws://localhost:5000"
    : window.location.origin.replace(/^http/, "ws");

// const ws =

const SocketContext = React.createContext();

export default function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socket = new WebSocket(WS_URL);
    // console.log("socket", socket);
    setSocket(socket); // TODO
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.onopen = () => {
      console.log("WS connected");
    };
    socket.onclose = () => {
      console.log("WS disconnected");
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
