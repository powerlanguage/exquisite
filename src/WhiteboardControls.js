import React, { useState, useRef, useEffect } from "react";
import styles from "./WhiteboardControls.module.css";

const brushSizes = {
  1: 3,
  2: 6,
  3: 12,
  4: 18,
};

export default function WhiteboardControls({
  handleChangeColor,
  handleChangeBrushSize,
  handleClear,
}) {
  // TODO: this should match whatever we're sending by default in Whiteboard
  const [rawBrushSizeInput, setRawBrushInput] = useState(1);
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedMargin, setCollapsedMargin] = useState(0);
  const controlsRef = useRef(null);
  const toggleButtonRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!controlsRef.current) return;
    if (!toggleButtonRef.current) return;
    if (!containerRef.current) return;
    const controlsWidth = controlsRef.current.getBoundingClientRect().width;
    const buttonWidth = toggleButtonRef.current.getBoundingClientRect().width;
    const containerWidth = containerRef.current.getBoundingClientRect().width;

    const containerOffset = containerWidth - controlsWidth;
    const controlsOffset = (controlsWidth - buttonWidth) * 2;

    setCollapsedMargin(Math.round(0 - containerOffset - controlsOffset));
  }, []);

  const onChangeBrushSize = (rawValue) => {
    setRawBrushInput(rawValue);
    handleChangeBrushSize(brushSizes[rawValue]);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <div
        className={styles.controls}
        style={{ marginLeft: `${collapsed ? collapsedMargin : 0}px` }}
        ref={controlsRef}
      >
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
        <button onClick={handleClear} className={styles.button}>
          x
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={styles.button}
          ref={toggleButtonRef}
        >
          {collapsed ? `>` : `<`}
        </button>
      </div>
    </div>
  );
}
