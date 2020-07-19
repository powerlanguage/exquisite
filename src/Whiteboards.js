import React, { useRef, useEffect, useState, useContext } from "react";
import { WHITEBOARD_SIZE, GAME_STATUS } from "./Game";
import Whiteboard from "./Whiteboard";
import WhiteboardPlaceholder from "./WhiteboardPlaceholder";
import styles from "./Whiteboards.module.css";
import WhiteboardControls from "./WhiteboardControls";
import ControlsContext from "./contexts/controls";

const DEFAULT_SCALE = 1;
// These are actually what % of the screen the canvas fills
const ZOOMED_IN = 0.9;
const ZOOMED_OUT = 0.6;

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// the direction of neighbors to self
// [row][col]
const neighborhoodDirections = {
  "00": "NW",
  "01": "N",
  "02": "NE",
  "10": "W",
  "11": "SELF",
  "12": "E",
  "20": "SW",
  "21": "S",
  "22": "SE",
};

export default function Whiteboards({
  // This can be either a neighborhood or the final complete canvas
  playerGrid,
  currentUser,
  gameStatus,
  sendWSMessage,
  lastMessage,
  whiteboardHistories,
  showNames,
  maskWhiteboards,
}) {
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [mobileZoom, setMobileZoom] = useState(ZOOMED_IN);
  const containerRef = useRef(null);

  // If on mobile, scale each canvas up to fill 90% of the screen
  useEffect(() => {
    if (!isMobile) return;
    if (!containerRef.current) return;

    const container = containerRef.current;
    // Need to check which is narrower width or height. Need to take effect on resize?
    const windowWidth = window.innerWidth;
    const scale = (windowWidth / WHITEBOARD_SIZE) * mobileZoom;
    container.style.transformOrigin = "top left";
    setScale(scale);
  }, [mobileZoom]);

  useEffect(() => {
    if (!scale) return;
    if (!containerRef.current) return;
    const container = containerRef.current;
    container.style.transform = `scale(${scale.toFixed(2)})`;
  }, [scale]);

  // Scroll to center
  useEffect(() => {
    if (!document.documentElement) return;
    const pageWidth = document.documentElement.scrollWidth;
    const pageHeight = document.documentElement.scrollHeight;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const scrollX = (pageWidth - screenWidth) / 2;
    const scrollY = (pageHeight - screenHeight) / 2;
    window.scroll(scrollX, scrollY);
  }, [scale]);

  const toggleZoom = () => {
    setMobileZoom(mobileZoom === ZOOMED_IN ? ZOOMED_OUT : ZOOMED_IN);
  };

  const { color, brushSize, clear } = useContext(ControlsContext);

  return (
    <React.Fragment>
      <div className={styles.whiteboards} ref={containerRef}>
        {playerGrid.map((row, i) => (
          <div
            className={styles.row}
            style={{
              height: WHITEBOARD_SIZE,
              width: `${WHITEBOARD_SIZE * playerGrid[0].length}px`,
            }}
            key={i}
          >
            {row.map((player, j) => {
              const isActive =
                !!player &&
                gameStatus === GAME_STATUS.IN_PROGRESS &&
                player.playerId === currentUser.playerId;
              return !!player ? (
                <Whiteboard
                  isActive={isActive}
                  color={color}
                  brushSize={brushSize}
                  username={player.username}
                  whiteboardId={player.whiteboardId}
                  width={WHITEBOARD_SIZE}
                  height={WHITEBOARD_SIZE}
                  sendMessage={sendWSMessage}
                  lastMessage={
                    gameStatus === GAME_STATUS.IN_PROGRESS &&
                    lastMessage &&
                    lastMessage.payload &&
                    lastMessage.payload.whiteboardId === player.whiteboardId
                      ? lastMessage
                      : null
                  }
                  whiteboardHistory={
                    gameStatus === GAME_STATUS.IN_PROGRESS
                      ? whiteboardHistories[player.whiteboardId] || null
                      : player.history
                  }
                  toggleZoom={isMobile ? toggleZoom : null}
                  showBorder={gameStatus === GAME_STATUS.IN_PROGRESS}
                  key={`${i}${j}-${player.whiteboardId}`}
                  scale={scale}
                  direction={
                    maskWhiteboards ? neighborhoodDirections[`${i}${j}`] : null
                  }
                  showName={showNames}
                  clear={clear}
                  showControls={isActive && !isMobile}
                />
              ) : (
                <WhiteboardPlaceholder
                  width={WHITEBOARD_SIZE}
                  height={WHITEBOARD_SIZE}
                  key={`${i}${j}`}
                />
              );
            })}
          </div>
        ))}
      </div>
      {isMobile && <WhiteboardControls handleZoom={toggleZoom} isMobile />}
    </React.Fragment>
  );
}
