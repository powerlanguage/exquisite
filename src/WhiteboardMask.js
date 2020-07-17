import React from "react";
import styles from "./WhiteboardMask.module.css";

const corners = ["NW", "SW", "NE", "SE"];

function renderCorner(row, col) {
  return (
    <React.Fragment>
      {renderOverlay(row)}
      {renderOverlay(col)}
    </React.Fragment>
  );
}

function renderOverlay(direction) {
  return (
    <div
      className={`
      ${styles.whiteboardMask} 
      ${styles[direction]}
    `}
    ></div>
  );
}

export default function WhiteboardMask({ direction }) {
  const isCorner = corners.includes(direction);

  return isCorner
    ? renderCorner(direction[0], direction[1])
    : renderOverlay(direction);
}
