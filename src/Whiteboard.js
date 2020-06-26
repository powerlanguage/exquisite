import React, { useEffect, useState, useRef, useCallback } from "react";
import WhiteboardInfo from "./WhiteboardInfo";
import WhiteboardControls from "./WhiteboardControls";
import styles from "./Whiteboard.module.css";

export default function Whiteboard({
  isActive,
  id,
  username,
  width,
  height,
  sendMessage,
  lastMessage,
}) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [lineBatch, updateLineBatch] = useState([]);
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

  const addToLineBatch = useCallback(
    (lineData) => {
      updateLineBatch([...lineBatch, lineData]);
    },
    [lineBatch]
  );

  const drawLine = useCallback(
    ({ x1, y1, x2, y2, color, brushSize = 1 }) => {
      if (!whiteboardRef.current) return;
      const whiteboard = whiteboardRef.current;
      const ctx = whiteboard.getContext("2d");

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineCap = "round";
      ctx.lineWidth = brushSize;
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.closePath();

      if (isActive) {
        addToLineBatch({ x1, y1, x2, y2, color, brushSize });
      }
      // console.log({ x1, y1, x2, y2, color });
    },
    [isActive, addToLineBatch]
  );

  const drawReceivedLineBatch = useCallback(
    (lineBatch) => {
      if (!lineBatch || lineBatch.length === 0) return;
      lineBatch.forEach((line, i) =>
        setTimeout(() => {
          drawLine(line);
        }, i * 3)
      );
    },
    [drawLine]
  );

  const clearWhiteboard = useCallback(() => {
    if (!whiteboardRef.current) return;
    const whiteboard = whiteboardRef.current;
    const ctx = whiteboard.getContext("2d");
    ctx.clearRect(0, 0, whiteboard.width, whiteboard.height);
    if (isActive) {
      sendMessage(
        JSON.stringify({
          type: "emit clear",
          payload: { id },
        })
      );
    }
  }, [sendMessage, id, isActive]);

  useEffect(() => {
    if (!lastMessage) return;
    const { type, payload } = lastMessage;
    // Confirm this is a message intended for this canvas
    if (payload.id !== id) return;
    switch (type) {
      case "draw": {
        if (!payload.lineBatch || payload.lineBatch.length === 0) return;
        drawReceivedLineBatch(payload.lineBatch);
        return;
      }
      case "clear": {
        clearWhiteboard();
        return;
      }
      default:
        console.log(`[whitboard] unknown action type: ${type}`);
        return;
    }
  }, [lastMessage, id, drawReceivedLineBatch, clearWhiteboard]);

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

  const stopDrawing = useCallback(
    (e) => {
      if (lineBatch.length !== 0) {
        sendMessage(
          JSON.stringify({
            type: "emit draw",
            payload: { id, lineBatch },
          })
        );
        updateLineBatch([]);
      }
      setIsDrawing(false);
      setCoordinates(null);
      console.log(e.type);
    },
    [id, lineBatch, sendMessage]
  );

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
      <WhiteboardInfo username={username} isActive={isActive} />
      {isActive && (
        <WhiteboardControls
          handleChangeColor={setColor}
          handleClear={clearWhiteboard}
          handleChangeBrushSize={setBrushSize}
        />
      )}
    </div>
  );
}
