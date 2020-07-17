import React, { useState } from "react";
import ControlButton from "./ControlButton";

import styles from "./BrushPicker.module.css";

export const brushSizes = {
  S: 3,
  M: 6,
  L: 12,
  XL: 18,
};

export default function BrushPicker({
  onChangeBrushSize,
  isActive,
  setActive,
}) {
  const [selectedBrush, setSelectedBrush] = useState("M");

  const handleChangeBrushSize = (rawValue) => {
    onChangeBrushSize(brushSizes[rawValue]);
    setSelectedBrush(rawValue);
    setActive();
  };

  return (
    <div className={styles.container}>
      {Object.keys(brushSizes).map((brushSize) => (
        <ControlButton
          key={brushSize}
          onClick={() => handleChangeBrushSize(brushSize)}
          selected={selectedBrush === brushSize && isActive}
        >
          <div
            className={`
              ${styles.brushPreview}
              ${
                styles[
                  selectedBrush === brushSize && isActive
                    ? "active"
                    : "inactive"
                ]
              }
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
