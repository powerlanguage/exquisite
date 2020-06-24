import React, { useEffect, useState, useRef, useCallback } from "react";
// import throttle from "lodash.throttle";

// Is user
// what is the id
// lines to draw
// width / height
// how to send message

export default function Whiteboard({
  isActive,
  id,
  width,
  height,
  onEmit,
  lineToDraw,
}) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const whiteboardRef = useRef(null);

  const drawLine = useCallback(
    ({ x1, y1, x2, y2 }) => {
      const ctx = whiteboardRef.current.getContext("2d");
      ctx.beginPath();
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.closePath();
      if (isActive) {
        onEmit(
          JSON.stringify({ type: "emit", payload: { x1, y1, x2, y2, id } })
        );
      }
      console.log({ x1, y1, x2, y2 });
    },
    [onEmit, id, isActive]
  );

  useEffect(() => {
    if (!lineToDraw) return;
    drawLine(lineToDraw);
  }, [lineToDraw]);

  const startDrawing = useCallback((e) => {
    setIsDrawing(true);
    setCoordinates({ x: e.clientX, y: e.clientY });
    console.log(e.type);
  }, []);

  useEffect(() => {
    if (!whiteboardRef.current) return;
    const whiteboard = whiteboardRef.current;
    whiteboard.addEventListener("mousedown", startDrawing);
    return () => whiteboard.removeEventListener("mousedown", startDrawing);
  }, [startDrawing]);

  const stopDrawing = useCallback((e) => {
    setIsDrawing(false);
    setCoordinates(null);
    console.log(e.type);
  }, []);

  useEffect(() => {
    if (!whiteboardRef.current) return;
    const whiteboard = whiteboardRef.current;
    whiteboard.addEventListener("mouseup", stopDrawing);
    whiteboard.addEventListener("mouseleave", stopDrawing);
    return () => {
      whiteboard.removeEventListener("mouseup", stopDrawing);
      whiteboard.removeEventListener("mouseleave", stopDrawing);
    };
  }, [stopDrawing]);

  const draw = useCallback(
    (e) => {
      if (isDrawing && coordinates) {
        drawLine({
          x1: coordinates.x,
          y1: coordinates.y,
          x2: e.clientX,
          y2: e.clientY,
        });
        setCoordinates({ x: e.clientX, y: e.clientY });
      }
    },
    [isDrawing, coordinates, drawLine]
  );

  useEffect(() => {
    if (!whiteboardRef.current) return;
    const whiteboard = whiteboardRef.current;
    whiteboard.addEventListener("mousemove", draw);
    return () => {
      whiteboard.removeEventListener("mousemove", draw);
    };
  }, [draw]);

  return (
    <div style={{ position: "relative" }}>
      <canvas width={width} height={height} ref={whiteboardRef} />
      <div style={{ position: "absolute", top: 0, left: 0 }}>
        {id} {isActive ? "active" : "inactive"}
      </div>
    </div>
  );
}
