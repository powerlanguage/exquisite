import React, { useState } from "react";

import styles from "./BrushSizePicker.module.css";

const brushSizes = {
  S: 3,
  M: 6,
  L: 12,
  XL: 18,
};

export default function BrushSizePicker({ onChangeBrushSize }) {
  const [selectedBrush, setSelectedBrush] = useState("M");

  const handleChangeBrushSize = (rawValue) => {
    onChangeBrushSize(brushSizes[rawValue]);
    setSelectedBrush(rawValue);
  };

  return (
    <div className={styles.container}>
      {Object.keys(brushSizes).map((brushSize) => (
        <button
          key={brushSize}
          onClick={() => handleChangeBrushSize(brushSize)}
          className={
            styles[selectedBrush === brushSize ? "active" : "inactive"]
          }
        >
          <div
            className={styles.brushPreview}
            style={{
              width: brushSizes[brushSize],
              height: brushSizes[brushSize],
            }}
          ></div>
        </button>
      ))}
    </div>
  );
}
