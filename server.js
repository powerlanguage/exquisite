const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const http = require("http");
const path = require("path");
const WebSocket = require("ws");

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 5000;

let clients = 0;
const canvasIds = [0, 1];

app.use(express.static(`${__dirname}/build`));

// TODO: parse cookies from req to determine if recent connection
wss.on("connection", (ws, req) => {
  console.log("[ws] connection received");

  console.log("[ws]", wss.clients.size, "connected clients");

  ws.on("message", (message) => {
    const { type, payload } = JSON.parse(message);

    if (!payload.id && payload.id !== 0) {
      console.log("[ws] no id received");
      return;
    }

    console.log("[ws] message received", message);

    switch (type) {
      case "broadcast": {
        wss.clients.forEach((client) =>
          client.send("server broadcasting message to all clients")
        );
        return;
      }
      case "emit": {
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

  if (clients === 0) {
    ws.send(JSON.stringify({ type: "setup", payload: { ids: [0, 1] } }));
  } else {
    ws.send(JSON.stringify({ type: "setup", payload: { ids: [1, 0] } }));
  }
  clients += 1;
});

// Shitty logger
app.use((req, res, next) => {
  console.log("[http]", req.path);
  next();
});

app.get("/api/hello", (req, res) => {
  res.send(JSON.stringify({ randomValue: Math.random() }));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build/index.html"));
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
