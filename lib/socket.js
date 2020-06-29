const {
  game,
  addDrawOperationToHistory,
  clearHistory,
  createUser,
  deleteUser,
} = require("./game");

const WebSocket = require("ws");

let wss;

// Broadcast message to all users clients
function broadcast(message) {
  console.log("[ws] broadcasting", message);
  game.users.forEach((user) => user.socket.send(message));
}

// Broadcast message to all users _except_ the user that sent the message
function emit(socket, message) {
  console.log("[ws] emitting", message);
  game.users.forEach((user) => {
    if (user.socket !== socket) {
      user.socket.send(message);
    }
  });
}

function socketize(server) {
  wss = new WebSocket.Server({ server });

  // TODO: parse cookies from req to determine if recent connection
  wss.on("connection", (ws, req) => {
    try {
      console.log("[ws] connection received");
      console.log("[ws]", wss.clients.size, "connected clients");

      // Super dumb logger
      ws.on("message", (message) => {
        console.log("[ws] message received", message);
      });

      ws.on("message", (message) => {
        const { type, payload } = JSON.parse(message);
        switch (type) {
          case "new user": {
            if (createUser(payload.username, ws)) {
              broadcast(
                JSON.stringify({ type: "set users", payload: game.users })
              );
              return;
            }
          }
          case "start game": {
            broadcast(
              JSON.stringify({
                type: "start game",
                payload: { gameState: "IN_PROGRESS", history: game.history },
              })
            );
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
        console.log("[ws] closed");
        deleteUser(ws);
        // Should this broadcast to everyone?
        broadcast(JSON.stringify({ type: "set users", payload: game.users }));
      });
    } catch (error) {
      console.log(`[ws] error: ${error.message}`);
    }
  });
}

module.exports = { socketize, broadcast };
