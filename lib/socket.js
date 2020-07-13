const {
  game,
  sockets,
  history,
  addDrawOperationToHistory,
  clearHistory,
  joinGame,
  startGame,
  rejoinGame,
  whiteboardIdExists,
  initializePlayer,
  getPlayer,
  isPlayerInGame,
  getNeighborhood1d,
  getNeighborhood2d,
} = require("./game");

const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const short = require("short-uuid");
const { byteLength, prettykBs } = require("../utils/byteSizeHelpers");

let bytesReceived = 0;
let bytesSent = 0;

function generatePlayerId() {
  return short.generate();
  // return uuidv4();
}

function getBytes() {
  const averagePerPlayer = bytesSent / game.playersSummary.length || 0;
  return [bytesSent, bytesReceived, averagePerPlayer];
}

// Broadcast message to all users clients
// A little bit of random delay to try and offset thundering herd
function broadcast(message) {
  game.playersSummary.forEach((player, i) => {
    setTimeout(() => {
      send(player.playerId, message);
    }, i * (Math.random() * 10));
  });
}

// Broadcast message to all users _except_ the user that sent the message
function emit(socket, message) {
  console.log("[ws] emitting");
  game.playersSummary.forEach((player) => {
    const playerSocket = sockets[player.playerId];
    if (playerSocket === socket) return;
    send(player.playerId, message);
  });
}

// Broadcast message to users in given users neighborhood, excluding themself
function sendToNeighborhood(playerId, message) {
  console.log("[ws] sending to neighborhood");
  const neighborhood = getNeighborhood1d(playerId);
  neighborhood.forEach((player) => {
    if (!player) return;
    if (playerId === player.playerId) return;
    send(player.playerId, message);
  });
}

function broadcastGameUpdate() {
  console.log("[ws] broadcast game update");
  broadcast(JSON.stringify({ type: "update game", payload: game }));
}

// Everyone has their own unique neighborhood
// copy-pasta of the broadcast function, could we simplify somehow?
// maybe build an array of messages to be sent?
function broadcastNeighborhoods() {
  console.log("[ws] broadcast neighborhood update");
  game.playersSummary.forEach((player) => {
    send(
      player.playerId,
      JSON.stringify({
        type: "set neighborhood",
        payload: getNeighborhood2d(player.playerId),
      })
    );
  });
}

// Send a WS message to a player by Id
function send(playerId, message) {
  if (!playerId) {
    console.log(`[ws] playerId not provided to send`);
    return;
  }
  const playerSocket = sockets[playerId];
  if (!playerSocket || playerSocket.readyState !== playerSocket.OPEN) {
    console.log(`[ws] socket does not exist or not open`);
    return;
  }
  playerSocket.send(message);
  byteSize = byteLength(message);
  bytesSent += byteSize;
  console.log(`[ws] send ${prettykBs(byteSize)}kB`);
}

function socketize(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws, req) => {
    try {
      console.log("[ws] connection received");
      console.log("[ws]", wss.clients.size, "connected clients");

      const playerId = generatePlayerId();
      initializePlayer(playerId, ws);

      ws.on("message", (message) => {
        const byteSize = byteLength(message);
        bytesReceived += byteSize;
        console.log(`[ws] recieved ${prettykBs(byteSize)}kB`);
      });

      ws.on("message", (message) => {
        const { type, payload } = JSON.parse(message);
        console.log("[ws] message received", type);
        switch (type) {
          case "join game": {
            joinGame(playerId, payload);
            if (!isPlayerInGame(playerId)) {
              send(
                playerId,
                JSON.stringify({
                  type: "username error",
                  payload: "Something went wrong...",
                })
              );
              return;
            }
            send(
              playerId,
              JSON.stringify({
                type: "set current player",
                payload: getPlayer(playerId),
              })
            );
            if (game.status === "IN_PROGRESS") {
              broadcastNeighborhoods();
              send(
                playerId,
                JSON.stringify({ type: "set history", payload: history })
              );
            }
            broadcastGameUpdate();
            return;
          }
          case "attempt reconnect": {
            if (game.status === "FINISHED") {
              // In this case, we just send the game to the user as we don't
              // need to update all the other clients. It could be that this
              // player contributed or just attempted to join. We do not distinguish
              console.log("[ws] rejoin requested when game finished");
              send(
                playerId,
                JSON.stringify({ type: "update game", payload: game })
              );
              return;
            }
            if (!whiteboardIdExists(payload)) {
              console.log(`[ws] whiteboardId does not exist in current game`);
              send(playerId, JSON.stringify({ type: "unable to reconnect" }));
              return;
            }
            rejoinGame(playerId, payload);
            // TODO DRY, Copypasta from above
            send(
              playerId,
              JSON.stringify({
                type: "set current player",
                // THIS BAD?
                payload: getPlayer(playerId),
              })
            );
            broadcastNeighborhoods();
            broadcastGameUpdate();
            send(
              playerId,
              JSON.stringify({ type: "set history", payload: history })
            );
            return;
          }
          case "start game": {
            startGame();
            broadcastNeighborhoods();
            broadcastGameUpdate();
            return;
          }
          case "emit draw": {
            if (!payload.whiteboardId && payload.whiteboardId !== 0) {
              console.log("[ws] received draw event with no id");
              return;
            }
            sendToNeighborhood(
              playerId,
              JSON.stringify({ type: "draw", payload })
            );
            addDrawOperationToHistory(payload);
            return;
          }
          case "emit clear": {
            if (!payload.whiteboardId && payload.whiteboardId !== 0) {
              // TODO DRY
              console.log("[ws] received clear event with no id");
              return;
            }
            sendToNeighborhood(
              playerId,
              JSON.stringify({ type: "clear", payload })
            );
            clearHistory(payload);
            return;
          }
          default:
            console.log("[ws] unknown message");
        }
      });

      ws.on("close", () => {
        console.log(`[ws] closed ${playerId}`);
        // Maybe delete player from game if whiteboard is empty?
        // delete player from players also?
        delete sockets[playerId];
      });
    } catch (error) {
      console.log(`[ws] error: ${error}`);
    }
  });
}

module.exports = { socketize, broadcastGameUpdate, getBytes };
