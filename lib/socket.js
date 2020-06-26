const WebSocket = require("ws");

const MAX_USERS = 9;
nextCanvasId = 0;
const users = [];

let wss;

// Broadcast message to all connected clients
function broadcast(message) {
  wss.clients.forEach((client) => client.send(message));
}

// Broadcast message to all clients _except_ the client that sent the message
function emit(socket, message) {
  wss.clients.forEach((client) => {
    if (client !== socket) {
      client.send(message);
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
            if (users.length < MAX_USERS) {
              const newUser = {
                username: payload.username,
                canvasId: nextCanvasId,
              };
              users.push(newUser);
              nextCanvasId += 1;
              // DRY - This repeats the broadcast code below
              broadcast(JSON.stringify({ type: "set users", payload: users }));
              return;
            } else {
              console.log("[ws] hit limit for number of users");
            }
          }
          case "broadcast": {
            boardcast("TODO: server broadcasting message to all clients");
            return;
          }
          case "emit draw": {
            if (!payload.id && payload.id !== 0) {
              console.log("[ws] received draw event with no id");
              return;
            }
            emit(ws, JSON.stringify({ type: "draw", payload }));
            return;
          }
          case "emit clear": {
            if (!payload.id && payload.id !== 0) {
              // TODO DRY
              console.log("[ws] received clear event with no id");
              return;
            }
            emit(ws, JSON.stringify({ type: "clear", payload }));
            return;
          }
          default:
            console.log("[ws] unknown message");
        }
      });
    } catch (error) {
      console.log(`[ws] error: ${error.message}`);
    }
  });
}

module.exports = { socketize, broadcast };
