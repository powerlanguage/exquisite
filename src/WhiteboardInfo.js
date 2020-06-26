import React, { useState } from "react";
import styles from "./WhiteboardInfo.module.css";

const brushSizes = {
  1: 3,
  2: 6,
  3: 12,
  4: 18,
};

export default function WhiteboardInfo({
  username,
  handleChangeColor,
  handleChangeBrushSize,
  showControls,
}) {
  const [rawBrushSizeInput, setRawBrushInput] = useState(1);

  const onChangeBrushSize = (rawValue) => {
    setRawBrushInput(rawValue);
    handleChangeBrushSize(brushSizes[rawValue]);
  };

  return (
    <div className={styles.container}>
      {showControls && (
        <>
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
        </>
      )}
      <div className={styles.username}>{username}</div>
    </div>
  );
}
