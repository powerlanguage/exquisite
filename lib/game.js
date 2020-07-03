const { shiftValueToCenterAndWrap } = require("../utils/arrayHelpers");
const { v4: uuidv4 } = require("uuid");

const MAX_PLAYERS = 9;
let nextWhiteboardId = 0;
/*
  [playerId]: {
    playerId,
    username,
    whiteboardId,
    ?isOwner,
  }
*/
const players = {};
/*
  [playerId]: socket
*/
const sockets = {};
/*
  [whiteboardId]: drawOperations
*/
const history = {};

// a game has a concept of all players
// each player has 'local' players, those immediately around them.
// each player doesn't need to know the others locals
// when a game update is received, it should only go to players with that player as local
// take the game.players
// expand to full size
// remap each player to the center

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

function rejoinGame(playerId, whiteboardId) {
  game.players.forEach((player) => {
    if (player.whiteboardId === whiteboardId) {
      player.playerId = playerId;
    }
  });
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

function whiteboardIdExists(whiteboardId) {
  const whiteboardIds = game.players.map((player) => player.whiteboardId);
  return whiteboardIds.includes(whiteboardId);
}

function getPlayer(playerId) {
  return players[playerId];
}

// Returns an 1d array to be mapped to a 2d array on render
// playerId will be in the center;
function getNeighborhood(playerId) {
  const player = players[playerId];
  const numMissingPlayers = MAX_PLAYERS - game.players.length;
  const paddedPlayers = [
    ...game.players,
    ...new Array(numMissingPlayers).fill(null),
  ];
  return shiftValueToCenterAndWrap(paddedPlayers, player);
}

module.exports = {
  initializePlayer,
  joinGame,
  leaveGame,
  startGame,
  rejoinGame,
  whiteboardIdExists,
  addDrawOperationToHistory,
  clearHistory,
  getPlayer,
  getNeighborhood,
  game,
  sockets,
  history,
};
