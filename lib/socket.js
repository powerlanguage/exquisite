const WebSocket = require("ws");

const MAX_USERS = 9;
nextCanvasId = 0;
const users = [];

let wss;

// Helper fns
function broadcast(message) {
  wss.clients.forEach((client) => client.send(message));
}

function socketize(server) {
  wss = new WebSocket.Server({ server });

  // TODO: parse cookies from req to determine if recent connection
  wss.on("connection", (ws, req) => {
    console.log("[ws] connection received");

    console.log("[ws]", wss.clients.size, "connected clients");

    ws.on("message", (message) => {
      const { type, payload } = JSON.parse(message);

      console.log("[ws] message received", message);

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
          wss.clients.forEach((client) =>
            client.send("TODO: server broadcasting message to all clients")
          );
          return;
        }
        case "emit draw": {
          if (!payload.id && payload.id !== 0) {
            console.log("[ws] received draw event with no id");
            return;
          }
          wss.clients.forEach((client) => {
            if (client !== ws) {
              client.send(JSON.stringify({ type: "draw", payload }));
            }
          });
          return;
        }
        default:
          console.log("[ws] unknown message");
      }
    });
  });
}

module.exports = { socketize, broadcast };
