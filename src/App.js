import React from "react";

import Game from "./Game";
import SocketProvider from "./contexts/socket";

export default function OuterApp() {
  return (
    <SocketProvider>
      <Game />
    </SocketProvider>
  );
}
