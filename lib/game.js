const { v4: uuidv4 } = require("uuid");

const MAX_PLAYERS = 9;
let nextWhiteboardId = 0;
const players = {};
const sockets = {};
const history = {};

const game = {
  players: [],
  status: "WAITING",
};

function initializePlayer(playerId, socket) {
  players[playerId] = { playerId };
  sockets[playerId] = socket;
}

function joinGame(playerId, username) {
  if (game.players.length >= MAX_PLAYERS) {
    console.log("[ws] hit limit for number of users");
    return;
  }

  const player = players[playerId];

  player.username = username;
  player.whiteboardId = uuidv4();

  if (game.players.length === 0) {
    player.isOwner = true;
  }

  game.players.push(player);
  return;
}

function leaveGame(playerId) {
  game.players = game.players.filter((player) => player.playerId !== playerId);
  return;
}

function startGame() {
  game.status = "IN_PROGRESS";
}

function addDrawOperationToHistory(drawOperation) {
  const whiteboardId = drawOperation.whiteboardId;
  if (!history[whiteboardId]) {
    history[whiteboardId] = [drawOperation];
  } else {
    history[whiteboardId].push(drawOperation);
  }
}

function clearHistory(clearOperation) {
  const whiteboardId = clearOperation.whiteboardId;
  history[whiteboardId] = [];
}

module.exports = {
  initializePlayer,
  joinGame,
  leaveGame,
  startGame,
  addDrawOperationToHistory,
  clearHistory,
  game,
  sockets,
  history,
};
