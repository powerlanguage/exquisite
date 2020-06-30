import React, { useEffect, useState, useRef, useCallback } from "react";
import WhiteboardInfo from "./WhiteboardInfo";
import WhiteboardControls from "./WhiteboardControls";
import styles from "./Whiteboard.module.css";

// Still gives the impression of the strokes appearing fairly realtime
const MAX_BATCH_LENGTH = 10;

export default function Whiteboard({
  isActive,
  whiteboardId,
  username,
  width,
  height,
  sendMessage,
  lastMessage,
  whiteboardHistory,
}) {
  const [isDrawing, setIsDrawing] = useState(false);
  // TODO: Give this a better name
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

  // Draw a single line to the canvas. Can be either local or remote.
  const drawLine = useCallback(({ x1, y1, x2, y2, color, brushSize }) => {
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
  }, []);

  const drawReceivedLineBatch = useCallback(
    (lineBatch, brushSize, color, delay) => {
      if (!lineBatch || lineBatch.length === 0) return;
      // Do not delay when drawing history as the hard coded timeout can result
      // in some lines appearing on top of ones they were drawn under. I belive
      // this is due to lineBatch length not being factored into the timeout
      // delay. This is not an issue during regular drawing due to the fact we
      // have a max batch size. Actually, now that I saw that, history should
      // have a max batch size too so IDK what is up.
      if (delay) {
        lineBatch.forEach((line, i) =>
          setTimeout(() => {
            drawLine({ ...line, brushSize, color });
          }, i * 10)
        );
      } else {
        lineBatch.forEach((line, i) => drawLine({ ...line, brushSize, color }));
      }
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
          payload: { whiteboardId },
        })
      );
    }
  }, [sendMessage, whiteboardId, isActive]);

  const sendLineBatch = useCallback(() => {
    if (lineBatch.length !== 0) {
      sendMessage(
        JSON.stringify({
          type: "emit draw",
          payload: { whiteboardId, lineBatch, color, brushSize },
        })
      );
      console.log(`line batch length: ${lineBatch.length}`);
      updateLineBatch([]);
    }
  }, [lineBatch, whiteboardId, color, brushSize, sendMessage]);

  useEffect(() => {
    if (!lastMessage) return;
    const { type, payload } = lastMessage;
    // Confirm this is a message intended for this canvas
    if (payload.whiteboardId !== whiteboardId) return;
    switch (type) {
      case "draw": {
        if (!payload.lineBatch || payload.lineBatch.length === 0) return;
        drawReceivedLineBatch(
          payload.lineBatch,
          payload.brushSize,
          payload.color,
          true
        );
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
  }, [lastMessage, whiteboardId, drawReceivedLineBatch, clearWhiteboard]);

  useEffect(() => {
    if (!whiteboardHistory) return;
    console.log("drawing whiteboard history...");
    whiteboardHistory.forEach((drawOperation) => {
      drawReceivedLineBatch(
        drawOperation.lineBatch,
        drawOperation.brushSize,
        drawOperation.color,
        false
      );
    });
  }, [whiteboardHistory]);

  const startDrawing = useCallback((e) => {
    setIsDrawing(true);
    setCoordinates(getRelativeCoords(e));
    console.log(e.type);
  }, []);

  const stopDrawing = useCallback(
    (e) => {
      sendLineBatch();
      setIsDrawing(false);
      setCoordinates(null);
      console.log(e.type);
    },
    [sendLineBatch]
  );

  const handleMouseLeave = useCallback(
    (e) => {
      setCoordinates(getRelativeCoords(e));
      sendLineBatch();
    },
    [sendLineBatch]
  );

  // Send the batch when it grows beyond a certain size
  useEffect(() => {
    if (lineBatch.length >= MAX_BATCH_LENGTH) {
      sendLineBatch();
    }
  }, [lineBatch, sendLineBatch]);

  useEffect(() => {
    if (!isActive) return;
    if (!whiteboardRef.current) return;
    const whiteboard = whiteboardRef.current;
    whiteboard.addEventListener("mousedown", startDrawing);
    whiteboard.addEventListener("mouseup", stopDrawing);
    whiteboard.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      whiteboard.removeEventListener("mouseup", stopDrawing);
      whiteboard.removeEventListener("mouseleave", handleMouseLeave);
      whiteboard.removeEventListener("mousedown", startDrawing);
    };
  }, [startDrawing, stopDrawing, handleMouseLeave, isActive]);

  // TODO: give this a better name. confusing with drawLine
  // This is only called for local draw events
  const draw = useCallback(
    (e) => {
      if (isDrawing && coordinates) {
        const { x, y } = getRelativeCoords(e);

        const lineCoords = {
          x1: coordinates.x,
          y1: coordinates.y,
          x2: x,
          y2: y,
        };

        drawLine({
          ...lineCoords,
          color,
          brushSize,
        });

        addToLineBatch(lineCoords);
        setCoordinates({ x, y });
      }
    },
    [isDrawing, coordinates, drawLine, color, brushSize, addToLineBatch]
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
        id={`canvas-${whiteboardId}`}
      />
      <div className={styles.overlay}>
        <WhiteboardInfo username={username} isActive={isActive} />
        {isActive && (
          <WhiteboardControls
            handleChangeColor={setColor}
            handleClear={clearWhiteboard}
            handleChangeBrushSize={setBrushSize}
          />
        )}
      </div>
    </div>
  );
}
