const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const { broadcast, socketize } = require("./lib/socket");

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
  broadcast(JSON.stringify({ type: "set game state", payload: "IN_PROGRESS" }));
  res.send("starting");
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build/index.html"));
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
