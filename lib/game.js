const {
  getNeighborsFromPlayers,
  convert1dTo2dArray,
  convert2dTo1dArray,
  generateNeighborhood,
} = require("../utils/arrayHelpers");
// const { v4: uuidv4 } = require("uuid");
const short = require("short-uuid");
const fs = require("fs").promises;

// This should be square number
// const MAX_PLAYERS = 9;
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

/*
  Not stored as players.neighborhood as we don't want to send a players
  neighborhood to every other player [playerId]: [[ player, player, player ],
  [null, null, player]]
*/
const neighborhoods = {};

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
  if (game.playersSummary.length >= game.maxPlayers) {
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
  generateNeighborhoodsForPlayers();
  return;
}

function rejoinGame(newPlayerId, whiteboardId) {
  game.playersSummary.forEach((playerSummary) => {
    const player = getPlayer(playerSummary.playerId);
    if (player.whiteboardId === whiteboardId) {
      const oldPlayerId = player.playerId;
      // TODO: Have to update the playerId in both the summary and the players
      // dict to ensure they are both correct. Might be better for the former to
      // be always pulled dynamically?
      playerSummary.playerId = newPlayerId;
      player.playerId = newPlayerId;
      players[newPlayerId] = player;
      delete players[oldPlayerId];
    }
  });
  generateNeighborhoodsForPlayers();
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
  const numMissingPlayers = game.maxPlayers - game.playersSummary.length;
  const paddedPlayers = [
    ...game.playersSummary.map((playerSummary) =>
      getPlayer(playerSummary.playerId)
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

function addDrawOperationToHistory(payload) {
  // We remove whiteboardId from history store to reduce history size and we
  // have the whiteboardId as the key of history
  const { whiteboardId, ...payloadWithoutWhiteboardId } = payload;
  if (!history[whiteboardId]) {
    history[whiteboardId] = [payloadWithoutWhiteboardId];
  } else {
    history[whiteboardId].push(payloadWithoutWhiteboardId);
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

function isPlayerInGame(playerId) {
  return game.playersSummary.some((player) => player.playerId === playerId);
}

// Generates a 2d array of the 9 surrounding tiles for each player (including
// self) and stores We call this anytime a player joins or rejoins. Could look
// at only updating if neighbors have changed.
function generateNeighborhoodsForPlayers() {
  const numMissingPlayers = game.maxPlayers - game.playersSummary.length;
  const paddedPlayers = [
    ...game.playersSummary.map((playerSummary) =>
      getPlayer(playerSummary.playerId)
    ),
    ...new Array(numMissingPlayers).fill(null),
  ];
  paddedPlayers.forEach((player) => {
    if (!player) return;
    const neighborhood = generateNeighborhood(paddedPlayers, player, true);
    neighborhoods[player.playerId] = neighborhood;
  });
}

function getNeighborhood2d(playerId) {
  return neighborhoods[playerId];
}

function getNeighborhood1d(playerId) {
  return convert2dTo1dArray(getNeighborhood2d(playerId));
}

async function writeHistoryToFile() {
  const date = new Date().toISOString();
  console.log("Writing history...");
  try {
    await fs.writeFile(`exquisite-history-${date}}`, JSON.stringify(history));
    console.log("History written  ");
  } catch (err) {
    console.log("Error writing history", err);
  }
}

function setMaxPlayers(num) {
  console.log("Setting max players to", num);
  if (num > 0 && Math.sqrt(num) % 1) {
    console.log("Provided number invalid");
    return;
  }
  game.maxPlayers = num;
  console.log("Set max players successfully");
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
  getNeighborhood2d,
  getNeighborhood1d,
  isPlayerInGame,
  writeHistoryToFile,
  setMaxPlayers,
  game,
  sockets,
  history,
};
