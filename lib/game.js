// const game = {
//   users: [ { username, canvasId, socket } ],
//   status: 'WAITING',
//   history: { canvasId: [ drawOperation ] },
// }

const MAX_USERS = 9;

const game = {
  nextWhiteboardId: 0,
  users: [],
  history: [],
  status: "WAITING",
};

function addDrawOperationToHistory(drawOperation) {
  const whiteboardId = drawOperation.whiteboardId;
  if (!game.history[whiteboardId]) {
    game.history[whiteboardId] = [drawOperation];
  } else {
    game.history[whiteboardId].push(drawOperation);
  }
}

function clearHistory(clearOperation) {
  const whiteboardId = clearOperation.whiteboardId;
  game.history[whiteboardId] = [];
}

function incrementWhiteboardId() {
  game.nextWhiteboardId += 1;
}

function getNextWhiteboardId() {
  return game.nextWhiteboardId;
}

function getUserByName(username) {
  return [game.users.filter((user) => user.username === username)];
}

function getUserBySocket(socket) {
  return [game.users.filter((user) => user.socket === socket)];
}

// Returns true if successful
function createUser(username, socket) {
  if (isUsernameAvailable(username)) {
    console.log("[ws] TODO: username unavailable");
    return false;
  }
  if (game.users.length > MAX_USERS) {
    console.log("[ws] hit limit for number of users");
    return false;
  }

  const newUser = {
    username,
    whiteboardId: getNextWhiteboardId(),
    socket,
  };

  // If first person to connect, make them the owner
  if (game.users.length === 0) {
    newUser.isOwner = true;
  }
  game.users.push(newUser);
  incrementWhiteboardId();

  return game;
}

function isUsernameAvailable(username) {
  return game.users.some((user) => user.username === username);
}

function deleteUser(socket) {
  const user = getUserBySocket(socket);
  if (!user) return;
  game.users = [...game.users.filter((user) => user.socket !== socket)];
}

module.exports = {
  incrementWhiteboardId,
  getNextWhiteboardId,
  addDrawOperationToHistory,
  clearHistory,
  isUsernameAvailable,
  createUser,
  deleteUser,
  game,
};
