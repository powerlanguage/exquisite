import React, { useRef, useEffect, useState } from "react";
import { WHITEBOARD_SIZE, GAME_STATUS } from "./Game";
import Whiteboard from "./Whiteboard";
import WhiteboardPlaceholder from "./WhiteboardPlaceholder";
import styles from "./Whiteboards.module.css";

const DEFAULT_SCALE = 1;

export default function Whiteboards({
  // This can be either a neighborhood or the final complete canvas
  playerGrid,
  currentUser,
  gameStatus,
  sendWSMessage,
  lastMessage,
  whiteboardHistories,
}) {
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const containerRef = useRef(null);

  // If on mobile, scale each canvas up to fill 90% of the screen
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) return;
    if (!containerRef.current) return;

    const container = containerRef.current;
    // Need to check which is narrower width or height. Need to take effect on resize?
    const windowWidth = window.innerWidth;
    const scale = (windowWidth / WHITEBOARD_SIZE) * 0.9;
    container.style.transformOrigin = "top left";
    setScale(scale);
  }, []);

  useEffect(() => {
    if (!scale) return;
    if (!containerRef.current) return;
    const container = containerRef.current;
    container.style.transform = `scale(${scale.toFixed(2)})`;
  }, [scale]);

  return (
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
          {row.map((player, j) =>
            !!player ? (
              <Whiteboard
                isActive={
                  gameStatus === GAME_STATUS.IN_PROGRESS &&
                  player.playerId === currentUser.playerId
                }
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
                showBorder={gameStatus === GAME_STATUS.IN_PROGRESS}
                key={`${i}${j}`}
                scale={scale}
              />
            ) : (
              <WhiteboardPlaceholder
                width={WHITEBOARD_SIZE}
                height={WHITEBOARD_SIZE}
                key={`${i}${j}`}
              />
            )
          )}
        </div>
      ))}
    </div>
  );
}
