import React, { useState } from "react";
import "./ColorPicker.module.css";

// On click display a div

export default function ColorPicker({ onChangeColor }) {
  const [showPalette, setShowPalette] = useState(false);
  const [color, setColor] = useState("#000"); // Should be whatever the whiteboard has as default?

  return (
    <div>
      <button onClick={() => setShowPalette(!showPalette)} style={{}}>
        color
      </button>
      {showPalette && <div>pallete</div>}
    </div>
  );
}
