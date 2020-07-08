// Given a 1d array, shift it right x amount
function shiftArrayN(arr, x) {
  if (x < 0 || x > arr.length) {
    throw new Error("Invalid shift array args");
  }
  if (x === 0 || x === arr.length) return arr;

  const newArr = [];

  for (let i = 0; i < arr.length; i++) {
    const newIndex = (i + x) % arr.length;
    newArr[newIndex] = arr[i];
  }
  return newArr;
}

// https://gist.github.com/femto113/1784503
// flip cols and rows of a 2d array
function transpose(a) {
  return a[0].map((_, c) => a.map((r) => r[c]));
}

// shift each row in an 2D array by x
function shift2dArrayX(arr, x) {
  const shifted = arr.map((row) => shiftArrayN(row, x));
  return shifted;
}

// shift each column in a 2D array by y
function shift2dArrayY(arr, y) {
  return transpose(shift2dArrayX(transpose(arr), y));
}

function shift2dArray(arr, x, y) {
  let shifted = shift2dArrayX(arr, x);
  shifted = shift2dArrayY(shifted, y);
  return shifted;
}

// Index of row in a 2D array containing x
function getIndexOfRowIncludes(arr, x) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].includes(x)) {
      return i;
    }
  }
  return -1;
}

// Index of column in a 2D array containing x
function getIndexOfColIncludes(arr, x) {
  return getIndexOfRowIncludes(transpose(arr), x);
}

// Find the coordinates of val in a 2d array
function getCoords(arr, val) {
  return [getIndexOfColIncludes(arr, val), getIndexOfRowIncludes(arr, val)];
}

// If the 1d Array was a 2d array, what would the center coordinates be?
function getCenterCoordsOf1dArray(arr) {
  const center = (Math.sqrt(arr.length) - 1) / 2;
  return [center, center];
}

// Assumes can be square
function convert1dTo2dArray(arr) {
  const part = Math.sqrt(arr.length);
  const arr2d = [];
  for (let i = 0; i < arr.length; i += part) {
    arr2d.push(arr.slice(i, i + part));
  }
  return arr2d;
}

function convert2dTo1dArray(arr) {
  return arr.reduce((acc, row) => acc.concat(row), []);
}

// Calculate the shift to hit target with part being the length of an edge
function calculateShift(target, current, part) {
  // We don't need to move
  if (current === target) {
    return 0;
  }

  if (current < target) {
    return Math.abs(current - target);
  }

  if (current > target) {
    return Math.abs(current - part - target);
  }
}

// given a 2d array, calc the required shift
function calculateShiftToCenter(arr, centerCoords, currentCoords) {
  const [centerX, centerY] = centerCoords;
  const [currentX, currentY] = currentCoords;
  const part = arr[0].length;
  return [
    calculateShift(centerX, currentX, part),
    calculateShift(centerY, currentY, part),
  ];
}

// Given a 1d array and value, return a 1d array that can be mapped to a
// 2d array with value at the center with element wrapping
function shiftValueToCenterAndWrap(arr, value) {
  const arr2d = convert1dTo2dArray(arr);
  const center = getCenterCoordsOf1dArray(arr);
  const target = getCoords(arr2d, value);
  const [x, y] = calculateShiftToCenter(arr2d, center, target);
  const shifted = shift2dArray(arr2d, x, y);
  return convert2dTo1dArray(shifted);
}

// Returns a 3x3 2D array of neighbors for the given row/col indices
// if wrap = true, out of bounds neighbors will wrap to the opposite edge
// if wrap = false those neighbors will be null
function getNeighborsByIndex(arr, col, row, wrap = true) {
  const height = arr.length;
  const width = arr[0].length;

  const output = [];

  for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
    const neighborRow = [];
    let _row = row + rowOffset;
    // Wrap
    if (_row < 0) {
      _row = wrap ? height - 1 : null;
    }
    if (_row >= height) {
      _row = wrap ? 0 : null;
    }
    for (let colOffset = -1; colOffset <= 1; colOffset++) {
      let _col = col + colOffset;
      // Wrap
      if (_col < 0) {
        _col = wrap ? width - 1 : null;
      }
      if (_col >= width) {
        _col = wrap ? 0 : null;
      }

      if (_row === null || _col === null) {
        neighborRow.push(null);
      } else {
        neighborRow.push(arr[_row][_col]);
      }
    }
    output.push(neighborRow);
  }

  return output;
}

function getNeighborsFromPlayers(players, item, wrap) {
  const players2d = convert1dTo2dArray(players);
  const [col, row] = getCoords(players2d, item);
  return getNeighborsByIndex(players2d, col, row, wrap);
}

module.exports = {
  convert1dTo2dArray,
  shiftValueToCenterAndWrap,
  getNeighborsFromPlayers,
};
