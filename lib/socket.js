const {
  users,
  MAX_USERS,
  history,
  incrementWhiteboardId,
  getNextWhiteboardId,
  addDrawOperationToHistory,
  clearHistory,
} = require("./game");

const WebSocket = require("ws");

let wss;

// Broadcast message to all connected clients
function broadcast(message) {
  console.log("[ws] broadcasting", message);
  users.forEach((user) => user.socket.send(message));
}

// Broadcast message to all clients _except_ the client that sent the message
function emit(socket, message) {
  console.log("[ws] emitting", message);
  users.forEach((user) => {
    if (user.socket !== socket) {
      client.send(message);
    }
  });
}

function userExists(username) {
  return Object.values(users).some((user) => user.username === username);
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
            if (userExists(payload.username)) {
              ws.send(
                JSON.stringify({
                  type: "error",
                  payload: "That username is already taken. Pick another.",
                })
              );
            }
            if (users.length < MAX_USERS) {
              const newUser = {
                username: payload.username,
                whiteboardId: getNextWhiteboardId(),
                socket: ws,
              };
              // If first person to connect, make them the owner
              if (users.length === 0) {
                newUser.isOwner = true;
              }
              users.push(newUser);
              // TODO: Move create user to a fn in game.js
              incrementWhiteboardId();
              // DRY - This repeats the broadcast code below
              broadcast(JSON.stringify({ type: "set users", payload: users }));
              return;
            } else {
              console.log("[ws] hit limit for number of users");
            }
          }
          case "broadcast": {
            broadcast("TODO: server broadcasting message to all clients");
            return;
          }
          case "start game": {
            broadcast(
              JSON.stringify({
                type: "start game",
                payload: { gameState: "IN_PROGRESS", history },
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
    } catch (error) {
      console.log(`[ws] error: ${error.message}`);
    }
  });
}

module.exports = { socketize, broadcast };
