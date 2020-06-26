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
  showControls,
}) {
  const [rawBrushSizeInput, setRawBrushInput] = useState(1);

  const onChangeBrushSize = (rawValue) => {
    setRawBrushInput(rawValue);
    handleChangeBrushSize(brushSizes[rawValue]);
  };

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
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
      </div>
    </div>
  );
}
