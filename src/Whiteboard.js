import React, { useEffect, useState, useRef, useCallback } from "react";
import WhiteboardInfo from "./WhiteboardInfo";
import WhiteboardMask from "./WhiteboardMask";
import styles from "./Whiteboard.module.css";
import WhiteboardControls from "./WhiteboardControls";

// Still gives the impression of the strokes appearing fairly realtime
const MAX_BATCH_LENGTH = 20;

// This is stored outside of the component as I was having trouble updating it
// with set state. Was resulting in stale state getting send over the
// websockets. Lots of repeating line batches
let lineBatch = [];

const isSafari = navigator.userAgent.toLocaleLowerCase().includes("safari");

export default function Whiteboard({
  isActive,
  whiteboardId,
  username,
  width,
  height,
  sendMessage,
  lastMessage,
  whiteboardHistory,
  showBorder,
  scale,
  direction,
  showName,
  color,
  brushSize,
  clear,
  showControls,
}) {
  const [isDrawing, setIsDrawing] = useState(false);
  // This is the RAW (not relative) pixel values stored as { x, y }
  const [lastPosition, setLastPosition] = useState(null);
  const whiteboardRef = useRef(null);
  const containerRef = useRef(null);

  // Add dpi scaling
  useEffect(() => {
    if (!whiteboardRef.current) return;
    const whiteboard = whiteboardRef.current;
    const ctx = whiteboard.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    // Get the CSS measurements
    const rect = whiteboard.getBoundingClientRect();
    // Changes the canvas attributes based on the CSS measurements
    // We are then scaling it back down with the CSS
    whiteboard.width = rect.width * dpr;
    whiteboard.height = rect.height * dpr;
    // Scales all canvas commands by the DPR
    ctx.scale(dpr, dpr);
  }, []);

  // Possible to just use offsetX and offsetY for this?
  // Update to take x/y instead of event?
  const getRelativeCoords = ({ x, y }) => {
    if (!whiteboardRef.current) return;
    const whiteboard = whiteboardRef.current;
    const { left, top } = whiteboard.getBoundingClientRect();
    const relativeX = Math.floor(x - left);
    const relativeY = Math.floor(y - top);
    const scaledX = Math.floor(relativeX / scale);
    const scaledY = Math.floor(relativeY / scale);

    return { x: scaledX, y: scaledY };
  };

  const sendLineBatch = useCallback(
    (clear = true) => {
      if (lineBatch.length === 0) {
        // console.log("line batch length 0, not sending");
        return;
      }
      sendMessage(
        JSON.stringify({
          type: "emit draw",
          payload: { whiteboardId, lineBatch, color, brushSize },
        })
      );
      // console.log(`sending line batch, length: ${lineBatch.length}`);
      if (clear) {
        lineBatch = [];
      }
    },
    [whiteboardId, color, brushSize, sendMessage]
  );

  const addToLineBatch = useCallback(
    (lineData) => {
      if (lineBatch.length > MAX_BATCH_LENGTH) {
        sendLineBatch(false);
        lineBatch = [lineData];
      } else {
        lineBatch.push(lineData);
      }
    },
    [sendLineBatch]
  );

  // Draw a single line to the canvas. Can be either local or remote.
  const drawLine = useCallback(({ line, color, brushSize }) => {
    if (!whiteboardRef.current) return;
    const whiteboard = whiteboardRef.current;
    const ctx = whiteboard.getContext("2d");

    let [x1, y1, x2, y2] = line;

    x1 *= scale;
    y1 *= scale;
    x2 *= scale;
    y2 *= scale;

    // safari won't draw a dot if moveTo and lineTo have the same coords. We add
    // a tiny offset to placate it.
    if (x1 === x2 && y1 === y2 && isSafari) {
      x2 -= 0.00001;
      y2 -= 0.00001;
    }

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.lineWidth = brushSize;
    ctx.moveTo(x1, y1); // Move to is like lifting pen off paper
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
  }, []);

  // This is only called for local draw events
  const draw = useCallback(
    (rawX, rawY) => {
      if (isDrawing && lastPosition) {
        const { x, y } = getRelativeCoords({
          x: rawX,
          y: rawY,
        });
        const { x: prevX, y: prevY } = getRelativeCoords(lastPosition);

        if (lineBatch.length && x === prevX && y === prevY) {
          // Mouse hasn't moved. don't draw (was causing us to save too many
          // lines and then over-send WS messages) The lineBatch.length check is
          // to allow tapping to place a dot, as we dispatch the linebatch on
          // mouseup
          return;
        }

        const lineCoords = [prevX, prevY, x, y];

        drawLine({
          line: lineCoords,
          color,
          brushSize,
        });

        addToLineBatch(lineCoords);
        setLastPosition({ x: rawX, y: rawY });
      }
    },
    [isDrawing, lastPosition, drawLine, color, brushSize, addToLineBatch]
  );

  const drawReceivedLineBatch = useCallback(
    (lineBatch, brushSize, color, delay) => {
      if (!lineBatch || lineBatch.length === 0) return;
      // Do not delay when drawing history as the hard coded timeout can result
      // in some lines appearing on top of ones they were drawn under. I belive
      // this is due to lineBatch length not being factored into the timeout
      // delay. If we receive to line batches, one small and one long they can
      // end up being drawn at different times
      if (delay) {
        lineBatch.forEach((line, i) =>
          setTimeout(() => {
            drawLine({ line, brushSize, color });
          }, i * 10)
        );
      } else {
        lineBatch.forEach((line, i) => drawLine({ line, brushSize, color }));
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

  useEffect(() => {
    if (!clear) return;
    if (!isActive) return;
    clearWhiteboard();
  }, [isActive, clear, clearWhiteboard]);

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
  }, [whiteboardHistory, drawReceivedLineBatch]);

  const startDrawing = useCallback((e) => {
    setIsDrawing(true);
    setLastPosition({ x: e.clientX, y: e.clientY });
    // console.log(e.type);
  }, []);

  const stopDrawing = useCallback(
    (e) => {
      draw(e.clientX, e.clientY);
      setIsDrawing(false);
      setLastPosition(null);
      // console.log(e.type);
    },
    [draw]
  );

  const handleMouseEnter = useCallback(
    (e) => {
      if (e.buttons === 1) {
        startDrawing(e);
      }
    },
    [startDrawing]
  );

  const handleMouseMove = useCallback(
    (e) => {
      const { clientX, clientY } = e;
      draw(clientX, clientY);
    },
    [draw]
  );

  const handleMouseLeave = useCallback(
    (e) => {
      stopDrawing(e);
    },
    [stopDrawing]
  );

  const handleTouchStart = useCallback((e) => {
    // Prevent the document from scrolling
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) return;
    const { clientX, clientY } = touch;
    // This is copy/pasta from startDrawing. Need to visit this whole event system.
    setIsDrawing(true);
    setLastPosition({ x: clientX, y: clientY });
    // console.log(e.type);
  }, []);

  const handleTouchMove = useCallback(
    (e) => {
      // Prevent the document from scrolling
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;
      const { clientX, clientY } = touch;
      draw(clientX, clientY);
    },
    [draw]
  );

  const handleTouchEnd = useCallback(
    (e) => {
      // Prevent the document from scrolling
      e.preventDefault();
      // touchend events don't send any coords. If the linebatch is empty and
      // we're stopping drawing it means that the user has tapped. We send a
      // draw event with the same coords that started the event.
      if (!lineBatch.length) {
        draw(lastPosition.x, lastPosition.y);
      }
      setIsDrawing(false);
      setLastPosition(null);
      // console.log(e.type);
    },
    [draw]
  );

  // Send the batch when it grows beyond a certain size
  useEffect(() => {
    if (lineBatch.length >= MAX_BATCH_LENGTH) {
      sendLineBatch();
    }
  }, [sendLineBatch]);

  useEffect(() => {
    if (!isDrawing) {
      sendLineBatch();
    }
  }, [isDrawing, sendLineBatch]);

  useEffect(() => {
    if (!isActive) return;
    if (!whiteboardRef.current) return;
    const whiteboard = whiteboardRef.current;
    whiteboard.addEventListener("mousedown", startDrawing);
    whiteboard.addEventListener("mouseup", stopDrawing);
    whiteboard.addEventListener("mouseenter", handleMouseEnter);
    whiteboard.addEventListener("mouseleave", handleMouseLeave);
    whiteboard.addEventListener("touchstart", handleTouchStart);
    whiteboard.addEventListener("touchend", handleTouchEnd);
    return () => {
      whiteboard.removeEventListener("mousedown", startDrawing);
      whiteboard.removeEventListener("mouseup", stopDrawing);
      whiteboard.removeEventListener("mouseenter", handleMouseEnter);
      whiteboard.removeEventListener("mouseleave", handleMouseLeave);
      whiteboard.removeEventListener("touchstart", handleTouchStart);
      whiteboard.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    startDrawing,
    stopDrawing,
    handleMouseLeave,
    handleMouseEnter,
    handleTouchStart,
    handleTouchEnd,
    isActive,
  ]);

  useEffect(() => {
    if (!isActive) return;
    if (!whiteboardRef.current) return;
    const whiteboard = whiteboardRef.current;
    whiteboard.addEventListener("mousemove", handleMouseMove);
    whiteboard.addEventListener("touchmove", handleTouchMove);
    return () => {
      whiteboard.removeEventListener("mousemove", handleMouseMove);
      whiteboard.removeEventListener("touchmove", handleTouchMove);
    };
  }, [draw, handleTouchMove, isActive]);

  return (
    // TODO: figure out how to not render undefined when no brushSize present
    <div
      className={`
        ${styles.container}
        ${styles[showBorder ? "border" : "noborder"]}
        ${styles[isActive ? "active" : "inactive"]}
        ${styles[isActive ? `brushSize-${brushSize}` : ""]}
      `}
      ref={containerRef}
    >
      <canvas
        width={width}
        height={height}
        ref={whiteboardRef}
        id={`canvas-${whiteboardId}`}
        style={{ width, height }}
      />
      <div className={styles.overlay}>
        {direction && direction !== "SELF" && (
          <WhiteboardMask direction={direction} />
        )}
        <WhiteboardInfo
          username={username}
          isActive={isActive}
          showName={showName}
        />
        {showControls && <WhiteboardControls />}
      </div>
    </div>
  );
}
