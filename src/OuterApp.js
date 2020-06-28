import React from "react";

import App from "./App";
import SocketProvider from "./contexts/socket";

export default function OuterApp() {
  return (
    <SocketProvider>
      <App />
    </SocketProvider>
  );
}
