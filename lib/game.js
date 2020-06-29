// const game = {
//   users: [ { username, canvasId, socket } ],
//   status: 'WAITING',
//   history: { canvasId: [ drawOperation ] },
// }

const MAX_USERS = 9;
let nextWhiteboardId = 0;
const users = [];
const history = {};

function addDrawOperationToHistory(drawOperation) {
  const whiteboardId = drawOperation.whiteboardId;
  if (!history[whiteboardId]) {
    history[whiteboardId] = [drawOperation];
  } else {
    history[whiteboardId].push(drawOperation);
  }
  console.log(history);
}

function clearHistory(clearOperation) {
  const whiteboardId = clearOperation.whiteboardId;
  history[whiteboardId] = [];
}

function incrementWhiteboardId() {
  nextWhiteboardId += 1;
}

function getNextWhiteboardId() {
  return nextWhiteboardId;
}

module.exports = {
  users,
  history,
  MAX_USERS,
  incrementWhiteboardId,
  getNextWhiteboardId,
  addDrawOperationToHistory,
  clearHistory,
};
