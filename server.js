const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const http = require("http");
const path = require("path");
const WebSocket = require("ws");

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 5000;

const MAX_USERS = 9;
nextCanvasId = 0;
const canvasIds = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const users = [];

app.use(express.static(`${__dirname}/build`));

function broadcast(message) {
  wss.clients.forEach((client) => client.send(message));
}

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

// Shitty logger
app.use((req, res, next) => {
  console.log("[http]", req.path);
  next();
});

app.get("/api/start", (req, res) => {
  broadcast(JSON.stringify({ type: "set game state", payload: "IN_PROGRESS" }));
  res.send("starting");
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build/index.html"));
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
