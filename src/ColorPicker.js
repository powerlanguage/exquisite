import React, { useState, useEffect } from "react";
import styles from "./ColorPicker.module.css";

const colors = ["red", "green", "blue"];

function ColorButton({ color, onClick }) {
  return (
    <button onClick={onClick}>
      <div
        className={styles.colorButton}
        style={{ backgroundColor: color }}
      ></div>
    </button>
  );
}

export default function ColorPicker({ onChangeColor }) {
  const [showPalette, setShowPalette] = useState(false);
  const [currentColor, setCurrentColor] = useState("#000"); // Should be whatever the whiteboard has as default?

  const handleColorClick = (color) => {
    onChangeColor(color);
    setCurrentColor(color);
    setShowPalette(false);
  };

  return (
    <div>
      {showPalette && (
        <div>
          {colors.map((color) => (
            <ColorButton
              color={color}
              onClick={() => handleColorClick(color)}
            />
          ))}
        </div>
      )}
      <ColorButton
        color={currentColor}
        onClick={() => setShowPalette(!showPalette)}
      />
    </div>
  );
}
