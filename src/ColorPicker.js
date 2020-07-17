import React, { useState, useEffect } from "react";
import styles from "./ColorPicker.module.css";
import ControlButton from "./ControlButton";

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

function ColorButton({ color, onClick, setLastColor }) {
  return (
    <ControlButton onClick={onClick}>
      <div
        className={styles.colorPreview}
        style={{ backgroundColor: color }}
      ></div>
    </ControlButton>
  );
}

export default function ColorPicker({
  onChangeColor,
  menuCollapsed,
  onShowFlyout,
  setCurrentPaletteColor,
  currentPaletteColor,
}) {
  const [showPalette, setShowPalette] = useState(false);

  const handleColorClick = (color) => {
    onChangeColor(color);
    setCurrentPaletteColor(color);
    setShowPalette(false);
  };

  const showFlyout = () => {
    setShowPalette(true);
    onShowFlyout();
  };

  const hideFlyout = () => {
    setShowPalette(false);
  };

  const toggleShowFlyout = () => {
    if (showPalette) {
      hideFlyout();
    } else {
      showFlyout();
    }
  };

  useEffect(() => {
    if (menuCollapsed) {
      hideFlyout();
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
                key={color}
              />
            ))}
          </div>
        </div>
      )}
      <ColorButton
        color={currentPaletteColor}
        onClick={() => toggleShowFlyout()}
      />
    </div>
  );
}
