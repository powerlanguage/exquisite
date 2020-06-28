import React, { useState } from "react";
import ControlButton from "./ControlButton";

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
        <ControlButton
          key={brushSize}
          onClick={() => handleChangeBrushSize(brushSize)}
        >
          <div
            className={`
              ${styles.brushPreview}
              ${styles[selectedBrush === brushSize ? "active" : "inactive"]}
            `}
            style={{
              width: brushSizes[brushSize],
              height: brushSizes[brushSize],
            }}
          ></div>
        </ControlButton>
      ))}
    </div>
  );
}
