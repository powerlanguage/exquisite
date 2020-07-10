const {
  getNeighborsFromPlayers,
  convert1dTo2dArray,
} = require("../utils/arrayHelpers");
// const { v4: uuidv4 } = require("uuid");
const short = require("short-uuid");

// This should be square number
// const MAX_PLAYERS = 9;
const MAX_PLAYERS = 16;
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

const game = {
  playersSummary: [],
  status: "WAITING",
  maxPlayers: MAX_PLAYERS,
  finishedState: [[]],
};

function generateWhiteboardId() {
  return short.generate();
}

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
  player.whiteboardId = generateWhiteboardId();

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

function finishGame() {
  game.status = "FINISHED";

  // map current players into a 2D array of their actual position on the canvas
  // TODO: this is copy pasta from the way neighborhoods are generated. Need to
  // think of better way to store the padded players. I think I decided against
  // putting null into the game.playersSummary because we expect it to be
  // not-null in so many places
  const numMissingPlayers = MAX_PLAYERS - game.playersSummary.length;
  const paddedPlayers = [
    ...game.playersSummary.map(
      (playerSummary) => players[playerSummary.playerId]
    ),
    ...new Array(numMissingPlayers).fill(null),
  ];
  const twoDPlayers = convert1dTo2dArray(paddedPlayers);
  // map that 2d array to a 2d array of histories
  game.finishedState = twoDPlayers.map((row) =>
    row.map((player) => {
      if (!player) return null;
      const whiteboardId = player.whiteboardId;
      return {
        ...player,
        history: history[whiteboardId],
      };
    })
  );
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
// TODO: Should these be stored somewhere?
function getNeighborhood(playerId) {
  const player = players[playerId];
  const numMissingPlayers = MAX_PLAYERS - game.playersSummary.length;
  const paddedPlayers = [
    ...game.playersSummary.map(
      (playerSummary) => players[playerSummary.playerId]
    ),
    ...new Array(numMissingPlayers).fill(null),
  ];
  const neighborhood = getNeighborsFromPlayers(paddedPlayers, player, true);
  return neighborhood;
}

module.exports = {
  initializePlayer,
  joinGame,
  leaveGame,
  startGame,
  finishGame,
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
