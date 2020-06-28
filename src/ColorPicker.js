import React, { useState, useEffect } from "react";
import styles from "./ColorPicker.module.css";

// https://github.com/reddit-archive/reddit-plugin-place-opensource/blob/453892c6f0a419f49c86759c60c2bdf64e13354a/reddit_place/public/static/js/place/client.js#L103-L119
const COLORS = [
  "#FFFFFF", // white
  "#E4E4E4", // light grey
  "#888888", // grey
  "#222222", // black
  "#FFA7D1", // pink
  "#E50000", // red
  "#E59500", // orange
  "#A06A42", // brown
  "#E5D900", // yellow
  "#94E044", // lime
  "#02BE01", // green
  "#00D3DD", // cyan
  "#0083C7", // blue
  "#0000EA", // dark blue
  "#CF6EE4", // magenta
  "#820080", // purple
];

function ColorButton({ color, onClick }) {
  return (
    <button onClick={onClick} className={styles.colorButton}>
      <div
        className={styles.colorPreview}
        style={{ backgroundColor: color }}
      ></div>
    </button>
  );
}

export default function ColorPicker({ onChangeColor, menuCollapsed }) {
  const [showPalette, setShowPalette] = useState(false);
  const [currentColor, setCurrentColor] = useState("#000"); // Should be whatever the whiteboard has as default?

  const handleColorClick = (color) => {
    onChangeColor(color);
    setCurrentColor(color);
    setShowPalette(false);
  };

  useEffect(() => {
    if (menuCollapsed) {
      setShowPalette(false);
    }
  }, [menuCollapsed]);

  return (
    <div>
      {showPalette && (
        <div className={styles.paletteContainer}>
          <div className={styles.palette}>
            {COLORS.map((color) => (
              <ColorButton
                color={color}
                onClick={() => handleColorClick(color)}
              />
            ))}
          </div>
        </div>
      )}
      <ColorButton
        color={currentColor}
        onClick={() => setShowPalette(!showPalette)}
      />
    </div>
  );
}
