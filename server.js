const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const { broadcastGameUpdate, socketize } = require("./lib/socket");
const { startGame, finishGame, resetGame } = require("./lib/game");

const server = http.createServer(app);
socketize(server);

const PORT = process.env.PORT || 5000;

app.use(express.static(`${__dirname}/build`));

// Shitty logger
app.use((req, res, next) => {
  console.log("[http]", req.path);
  next();
});

app.get("/api/start", (req, res) => {
  startGame();
  broadcastGameUpdate();
  res.send("starting");
});

app.get("/api/finish", (req, res) => {
  finishGame();
  broadcastGameUpdate();
  res.send("finishing");
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin/index.html"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build/index.html"));
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
