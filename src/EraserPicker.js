import React from "react";
import ControlButton from "./ControlButton";
import { brushSizes } from "./BrushPicker";
export default function EraserPicker({
  onChangeBrushSize,
  onChangeColor,
  isActive,
  setActive,
}) {
  const selectEraser = () => {
    onChangeBrushSize(brushSizes.XL);
    onChangeColor("#FFFFFF");
    setActive();
  };

  return (
    <ControlButton onClick={selectEraser}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 18 18"
        style={{ width: "18px", height: "18px", opacity: isActive ? 1 : 0.5 }}
      >
        <path
          d="M9,16.32l8.46-8.46a.48.48,0,0,0,0-.67L12.09,1.8a.48.48,0,0,0-.68,0L.52,12.68a.5.5,0,0,0,0,.68l3,3Zm-5-.8L1.54,13,5.59,9l4.71,4.71L8.48,15.5Z"
          fill="#222"
        />
      </svg>
    </ControlButton>
  );
}
