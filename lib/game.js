const { shiftValueToCenterAndWrap } = require("../utils/arrayHelpers");
const { v4: uuidv4 } = require("uuid");

const MAX_PLAYERS = 9;
/*

  Initially starts as just ID when they first connect. Gradually added to as
  they provide username/we figure out if they are the owner.

  Separate from game.players because of reconnects. When a websocket connection
  is started, we create a playerId for it and add that playerId to players.

  [playerId]: {playerId, username, whiteboardId,?isOwner,}
*/
const players = {};
/*
  [playerId]: socket
*/
const sockets = {};
/*
  [whiteboardId]: <drawOperations>
*/
const history = {};

// a game has a concept of all players
// each player has 'local' players, those immediately around them.
// each player doesn't need to know the others locals
// when a game update is received, it should only go to players with that player as local
// take the game.players
// expand to full size
// remap each player to the center

// on game start or rejoin
// map all neighborhoods to players {}, store on player obj
// send each individual player their update

const game = {
  playersSummary: [],
  status: "WAITING",
  maxPlayers: MAX_PLAYERS,
};

function initializePlayer(playerId, socket) {
  players[playerId] = { playerId };
  sockets[playerId] = socket;
}

function joinGame(playerId, username) {
  if (game.playersSummary.length >= MAX_PLAYERS) {
    console.log("[ws] hit limit for number of users");
    return;
  }

  const player = players[playerId];

  player.username = username;
  player.whiteboardId = uuidv4();

  if (game.playersSummary.length === 0) {
    player.isOwner = true;
  }

  game.playersSummary.push({
    playerId: playerId,
    username: player.username,
  });
  return;
}

function rejoinGame(playerId, whiteboardId) {
  game.playersSummary.forEach((playerSummary) => {
    const player = getPlayer(playerSummary.playerId);
    if (player.whiteboardId === whiteboardId) {
      // TODO: Have to update the playerId in both the summary and the players
      // dict to ensure they are both correct. Might be better for the former to
      // be always pulled dynamically?
      playerSummary.playerId = playerId;
      players[playerId] = player;
    }
  });
}

function leaveGame(playerId) {
  game.playersSummary = game.playersSummary.filter(
    (player) => player.playerId !== playerId
  );
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
  const whiteboardIds = game.playersSummary.map(
    (playerSummary) => getPlayer(playerSummary.playerId).whiteboardId
  );
  return whiteboardIds.includes(whiteboardId);
}

function getPlayer(playerId) {
  return players[playerId];
}

// Returns an 1d array to be mapped to a 2d array on render
// playerId will be in the center;
function getNeighborhood(playerId) {
  const player = players[playerId];
  const numMissingPlayers = MAX_PLAYERS - game.playersSummary.length;
  const paddedPlayers = [
    ...game.playersSummary.map(
      (playerSummary) => players[playerSummary.playerId]
    ),
    ...new Array(numMissingPlayers).fill(null),
  ];
  const neighborhood = shiftValueToCenterAndWrap(paddedPlayers, player);
  console.log(
    neighborhood.map((member) => (member && member.username) || member)
  );
  return neighborhood;
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
