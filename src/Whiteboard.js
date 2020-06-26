import React, { useEffect, useState, useRef, useCallback } from "react";
import WhiteboardInfo from "./WhiteboardInfo";
import styles from "./Whiteboard.module.css";

export default function Whiteboard({
  isActive,
  id,
  username,
  width,
  height,
  onEmit,
  lineToDraw,
}) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const whiteboardRef = useRef(null);
  const [color, setColor] = useState("black");
  const [brushSize, setBrushSize] = useState(3);

  const getRelativeCoords = (e) => {
    if (!whiteboardRef.current) return;
    const whiteboard = whiteboardRef.current;
    const { left, top } = whiteboard.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    return { x, y };
  };

  const drawLine = useCallback(
    ({ x1, y1, x2, y2, color, brushSize = 1 }) => {
      if (!whiteboardRef.current) return;
      const whiteboard = whiteboardRef.current;
      const ctx = whiteboard.getContext("2d");
      console.log(
        `drawing to ${isActive ? "active" : "inactive"} canvas ${id}`
      );

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineCap = "round";
      ctx.lineWidth = brushSize;
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.closePath();

      if (isActive) {
        onEmit(
          JSON.stringify({
            type: "emit draw",
            payload: { x1, y1, x2, y2, id, color, brushSize },
          })
        );
      }
      console.log({ x1, y1, x2, y2, color });
    },
    [onEmit, id, isActive]
  );

  useEffect(() => {
    if (!lineToDraw) return;
    drawLine(lineToDraw);
  }, [lineToDraw]);

  const startDrawing = useCallback((e) => {
    setIsDrawing(true);
    setCoordinates(getRelativeCoords(e));
    console.log(e.type);
  }, []);

  useEffect(() => {
    if (!isActive) return;
    if (!whiteboardRef.current) return;
    const whiteboard = whiteboardRef.current;
    whiteboard.addEventListener("mousedown", startDrawing);
    return () => whiteboard.removeEventListener("mousedown", startDrawing);
  }, [startDrawing, isActive]);

  const stopDrawing = useCallback((e) => {
    setIsDrawing(false);
    setCoordinates(null);
    console.log(e.type);
  }, []);

  useEffect(() => {
    if (!isActive) return;
    if (!whiteboardRef.current) return;
    const whiteboard = whiteboardRef.current;
    whiteboard.addEventListener("mouseup", stopDrawing);
    whiteboard.addEventListener("mouseleave", stopDrawing);
    return () => {
      whiteboard.removeEventListener("mouseup", stopDrawing);
      whiteboard.removeEventListener("mouseleave", stopDrawing);
    };
  }, [stopDrawing, isActive]);

  const draw = useCallback(
    (e) => {
      if (isDrawing && coordinates) {
        const { x, y } = getRelativeCoords(e);
        drawLine({
          x1: coordinates.x,
          y1: coordinates.y,
          x2: x,
          y2: y,
          color,
          brushSize,
        });
        setCoordinates({ x, y });
      }
    },
    [isDrawing, coordinates, drawLine, color, brushSize]
  );

  useEffect(() => {
    if (!isActive) return;
    if (!whiteboardRef.current) return;
    const whiteboard = whiteboardRef.current;
    whiteboard.addEventListener("mousemove", draw);
    return () => {
      whiteboard.removeEventListener("mousemove", draw);
    };
  }, [draw, isActive]);

  return (
    <div
      className={`${styles.container} ${
        styles[isActive ? "active" : "inactive"]
      }`}
    >
      <canvas
        width={width}
        height={height}
        ref={whiteboardRef}
        id={`canvas-${id}`}
      />
      <WhiteboardInfo
        username={username}
        showControls={isActive}
        handleChangeColor={setColor}
        handleChangeBrushSize={setBrushSize}
      />
    </div>
  );
}
