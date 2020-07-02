const {
  game,
  sockets,
  history,
  addDrawOperationToHistory,
  clearHistory,
  joinGame,
  startGame,
  rejoinGame,
  whiteboardIdExists,
  initializePlayer,
} = require("./game");

const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");

// Broadcast message to all users clients
function broadcast(message) {
  console.log("[ws] broadcasting");
  game.players.forEach((player) => {
    const playerSocket = sockets[player.playerId];
    if (playerSocket && playerSocket.readyState === playerSocket.OPEN) {
      playerSocket.send(message);
      return;
    }
    console.log(`[ws] player ${player.username} socket not open`);
  });
}

// Broadcast message to all users _except_ the user that sent the message
function emit(socket, message) {
  console.log("[ws] emitting");
  game.players.forEach((player) => {
    const playerSocket = sockets[player.playerId];
    if (playerSocket === socket) return;
    if (playerSocket && playerSocket.readyState === playerSocket.OPEN) {
      playerSocket.send(message);
      return;
    }
    console.log(`[ws] player ${player.username} socket not open`);
  });
}

function broadcastGameUpdate() {
  broadcast(JSON.stringify({ type: "update game", payload: game }));
}

function socketize(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws, req) => {
    try {
      console.log("[ws] connection received");
      console.log("[ws]", wss.clients.size, "connected clients");

      const playerId = uuidv4();
      initializePlayer(playerId, ws);
      ws.send(JSON.stringify({ type: "set player id", payload: playerId }));

      ws.on("message", (message) => {
        const { type, payload } = JSON.parse(message);
        console.log("[ws] message received", type);
        switch (type) {
          case "join game": {
            joinGame(playerId, payload);
            broadcastGameUpdate();
            if (game.status === "IN_PROGRESS") {
              ws.send(
                JSON.stringify({ type: "set history", payload: history })
              );
            }
            return;
          }
          case "attempt reconnect": {
            if (game.status === "IN_PROGRESS" && whiteboardIdExists(payload)) {
              rejoinGame(playerId, payload);
              broadcastGameUpdate();
              // TODO DRY, Copypasta from above
              ws.send(
                JSON.stringify({ type: "set history", payload: history })
              );
            }
            return;
          }
          case "start game": {
            startGame();
            broadcastGameUpdate();
            return;
          }
          case "emit draw": {
            if (!payload.whiteboardId && payload.whiteboardId !== 0) {
              console.log("[ws] received draw event with no id");
              return;
            }
            emit(ws, JSON.stringify({ type: "draw", payload }));
            addDrawOperationToHistory(payload);
            return;
          }
          case "emit clear": {
            if (!payload.whiteboardId && payload.whiteboardId !== 0) {
              // TODO DRY
              console.log("[ws] received clear event with no id");
              return;
            }
            emit(ws, JSON.stringify({ type: "clear", payload }));
            clearHistory(payload);
            return;
          }
          default:
            console.log("[ws] unknown message");
        }
      });

      ws.on("close", () => {
        console.log("[ws] closed TODO");
        delete sockets[playerId];
      });
    } catch (error) {
      console.log(`[ws] error: ${error}`);
    }
  });
}

module.exports = { socketize, broadcastGameUpdate };
