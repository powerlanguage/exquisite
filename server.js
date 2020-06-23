const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const http = require("http");
const path = require("path");
const WebSocket = require("ws");

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 5000;

app.use(express.static(`${__dirname}/build`));

wss.on("connection", (socket) => {
  console.log("wss connection received");
  socket.send("hello from WSS");
  setInterval(() => {
    socket.send(new Date().toTimeString());
  }, 5000);
});

// Shitty logger
app.use((req, res, next) => {
  console.log(req.path);
  next();
});

app.get("/api/hello", (req, res) => {
  res.send(JSON.stringify({ randomValue: Math.random() }));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build/index.html"));
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
