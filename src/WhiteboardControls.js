import React, { useState, useRef, useEffect } from "react";
import styles from "./WhiteboardControls.module.css";
import BrushSizePicker from "./BrushSizePicker";
import ColorPicker from "./ColorPicker";
import ClearPicker from "./ClearPicker";
import ControlButton from "./ControlButton";

export const FLYOUTS = {
  NONE: "NONE",
  COLOR_PICKER: "COLOR_PICKER",
  CLEAR_CONFIRM: "CLEAR_CONFIRM",
};

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
  const [flyout, setFlyout] = useState(FLYOUTS.NONE);

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
        style={{
          marginLeft: `${collapsed ? collapsedMargin : 0}px`,
        }}
        ref={controlsRef}
      >
        <ColorPicker
          onChangeColor={handleChangeColor}
          menuCollapsed={flyout !== FLYOUTS.COLOR_PICKER || collapsed}
          onShowFlyout={() => setFlyout(FLYOUTS.COLOR_PICKER)}
        />
        <BrushSizePicker onChangeBrushSize={handleChangeBrushSize} />
        <ClearPicker
          onClear={handleClear}
          menuCollapsed={flyout !== FLYOUTS.CLEAR_CONFIRM || collapsed}
          onShowFlyout={() => setFlyout(FLYOUTS.CLEAR_CONFIRM)}
        />
        <ControlButton
          onClick={() => {
            setCollapsed(!collapsed);
            setFlyout(FLYOUTS.NONE);
          }}
          ref={toggleButtonRef}
        >
          {collapsed ? `»` : `«`}
        </ControlButton>
      </div>
    </div>
  );
}
