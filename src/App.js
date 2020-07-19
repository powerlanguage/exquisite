import React from "react";

import Game from "./Game";
import SocketProvider from "./contexts/socket";
import { ControlsProvider } from "./contexts/controls";

export default function App() {
  return (
    <SocketProvider>
      <ControlsProvider>
        <Game />
      </ControlsProvider>
    </SocketProvider>
  );
}
