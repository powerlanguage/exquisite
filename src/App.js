import React, { useEffect, useState, useRef, useCallback } from "react";
// import throttle from "lodash.throttle";

import "./App.css";

console.log("node env:", process.env.NODE_ENV);

const READYSTATES = {
  0: "CONNECTING",
  1: "OPEN",
  2: "CLOSING",
  3: "CLOSED",
};

// Can this be set dynamically somehow?
const WS_URL =
  process.env.NODE_ENV === "development"
    ? "ws://localhost:5000"
    : window.location.origin.replace(/^http/, "ws");

const ws = new WebSocket(WS_URL);

const INITIAL_COORDS = { x: 0, y: 0 };

export default function App() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [coordinates, setCoordinates] = useState(null);

  const whiteboardRef = useRef(null);

  // console.log(READYSTATES[ws.readyState]);

  // Check WS ready state before sending
  const sendWSMessage = useCallback((message) => {
    ws.send(message);
  }, []);

  const drawLine = useCallback(
    ({ x1, y1, x2, y2, emit }) => {
      const ctx = whiteboardRef.current.getContext("2d");
      ctx.beginPath();
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.closePath();
      if (emit) {
        sendWSMessage(
          JSON.stringify({ type: "emit", payload: { x1, y1, x2, y2 } })
        );
      }
      console.log({ x1, y1, x2, y2 });
    },
    [sendWSMessage]
  );

  const handleWSMessage = useCallback(
    (message) => {
      console.log(message);
      const { type, payload } = JSON.parse(message);
      switch (type) {
        case "draw": {
          drawLine({ ...payload, emit: false });
          return;
        }

        default: {
          console.log("WS Unknown message type received");
          return;
        }
      }
    },
    [drawLine]
  );

  useEffect(() => {
    ws.onopen = () => {
      console.log("WS connected");
    };
    ws.onclose = () => {
      console.log("WS disconnected");
    };
    ws.onmessage = (event) => {
      console.log("WS message received");
      const message = event.data;
      handleWSMessage(message);
    };
  }, [handleWSMessage]);

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
          emit: true,
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
    <div>
      <canvas
        width={window.innerWidth}
        height={window.innerHeight}
        ref={whiteboardRef}
      ></canvas>
    </div>
  );
}
