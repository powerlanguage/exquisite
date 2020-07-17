import React, { useState, useRef, useEffect } from "react";
import styles from "./WhiteboardControls.module.css";
import BrushPicker from "./BrushPicker";
import ColorPicker from "./ColorPicker";
import ClearPicker from "./ClearPicker";
import ControlButton from "./ControlButton";
import EraserPicker from "./EraserPicker";

export const FLYOUTS = {
  NONE: "NONE",
  COLOR_PICKER: "COLOR_PICKER",
  CLEAR_CONFIRM: "CLEAR_CONFIRM",
};

export const TOOLS = {
  BRUSH: "BRUSH",
  ERASER: "ERASER",
};

const noop = () => {};

export default function WhiteboardControls({
  handleChangeColor,
  handleChangeBrushSize,
  handleClear,
  // Null if not on mobile
  handleZoom,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedMargin, setCollapsedMargin] = useState(0);
  const controlsRef = useRef(null);
  const toggleButtonRef = useRef(null);
  const containerRef = useRef(null);
  const [flyout, setFlyout] = useState(FLYOUTS.NONE);
  const [activeTool, setActiveTool] = useState(TOOLS.BRUSH);
  // We manage the palette color here as we need to return to it when the eraser
  // is deselected. This is pretty gross and this whole component is now pretty tangled.
  const [currentPaletteColor, setCurrentPaletteColor] = useState("#222");

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
          onChangeColor={activeTool !== TOOLS.ERASER ? handleChangeColor : noop}
          menuCollapsed={flyout !== FLYOUTS.COLOR_PICKER || collapsed}
          onShowFlyout={() => setFlyout(FLYOUTS.COLOR_PICKER)}
          setCurrentPaletteColor={setCurrentPaletteColor}
          currentPaletteColor={currentPaletteColor}
        />
        <BrushPicker
          onChangeBrushSize={handleChangeBrushSize}
          isActive={activeTool === TOOLS.BRUSH}
          setActive={() => {
            handleChangeColor(currentPaletteColor);
            setActiveTool(TOOLS.BRUSH);
          }}
        />
        <EraserPicker
          isActive={activeTool === TOOLS.ERASER}
          setActive={() => setActiveTool(TOOLS.ERASER)}
          onChangeBrushSize={handleChangeBrushSize}
          onChangeColor={handleChangeColor}
        />
        <ClearPicker
          onClear={handleClear}
          menuCollapsed={flyout !== FLYOUTS.CLEAR_CONFIRM || collapsed}
          onShowFlyout={() => setFlyout(FLYOUTS.CLEAR_CONFIRM)}
        />
        {handleZoom && <ControlButton onClick={handleZoom}>🔎</ControlButton>}
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
