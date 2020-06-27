import React, { useState, useRef, useEffect } from "react";
import styles from "./WhiteboardControls.module.css";
import BrushSizePicker from "./BrushSizePicker";

export default function WhiteboardControls({
  handleChangeColor,
  handleChangeBrushSize,
  handleClear,
}) {
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
        <BrushSizePicker onChangeBrushSize={handleChangeBrushSize} />
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
