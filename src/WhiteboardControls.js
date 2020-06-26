import React, { useState } from "react";
import styles from "./WhiteboardControls.module.css";

const brushSizes = {
  1: 3,
  2: 6,
  3: 12,
  4: 18,
};

export default function WhiteboardInfo({
  handleChangeColor,
  handleChangeBrushSize,
  handleClear,
}) {
  // TODO: this should match whatever we're sending by default in Whiteboard
  const [rawBrushSizeInput, setRawBrushInput] = useState(1);
  const [collapsed, setCollapsed] = useState(false);

  const onChangeBrushSize = (rawValue) => {
    setRawBrushInput(rawValue);
    handleChangeBrushSize(brushSizes[rawValue]);
  };

  return (
    <div className={styles.container}>
      {collapsed ? (
        <div className={styles.collapsedControls}>
          <button onClick={() => setCollapsed(false)}>{`>`}</button>
        </div>
      ) : (
        <div className={styles.expandedControls}>
          <input
            type="color"
            onChange={(e) => handleChangeColor(e.target.value)}
          />
          <input
            type="range"
            min="1"
            max="4"
            value={rawBrushSizeInput}
            onChange={(e) => onChangeBrushSize(e.target.value)}
          />
          <button onClick={handleClear} className={styles.clearButton}>
            x
          </button>
          <button onClick={() => setCollapsed(true)}>{`<`}</button>
        </div>
      )}
    </div>
  );
}
