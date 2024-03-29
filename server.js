const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
const http = require("http");
const path = require("path");
const querystring = require("querystring");
require("dotenv").config();
const { broadcastGameUpdate, socketize, getBytes } = require("./lib/socket");
const { prettykBs } = require("./utils/byteSizeHelpers");
const {
  startGame,
  finishGame,
  resetGame,
  writeHistoryToFile,
  setMaxPlayers,
  setMaskWhiteboards,
  setShowNames,
} = require("./lib/game");

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

app.get("/api/bytes", (req, res) => {
  const [sent, received, averageSent] = getBytes();
  res.send(
    JSON.stringify(
      `total sent: ${prettykBs(sent)}kB av sent/player: ${prettykBs(
        averageSent
      )}kB total received: ${prettykBs(received)}kB`
    )
  );
});

app.get("/api/writehistory", async (req, res) => {
  await writeHistoryToFile();
  res.send("[http] file written");
});

app.post("/api/updateconfig", (req, res) => {
  const { maxplayers, mask, names } = req.body;

  setMaxPlayers(JSON.parse(maxplayers));
  setMaskWhiteboards(JSON.parse(mask));
  setShowNames(JSON.parse(names));

  const query = querystring.stringify({
    maxplayers,
    mask,
    names,
  });
  broadcastGameUpdate();
  res.redirect("/admin?" + query);
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin/index.html"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build/index.html"));
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
