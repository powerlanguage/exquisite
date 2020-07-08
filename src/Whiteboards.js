import React from "react";
import { WHITEBOARD_SIZE, GAME_STATUS } from "./Game";
import Whiteboard from "./Whiteboard";
import WhiteboardPlaceholder from "./WhiteboardPlaceholder";
import styles from "./Whiteboards.module.css";

export default function Whiteboards({
  // This can be either a neighborhood or the final complete canvas
  playerGrid,
  currentUser,
  gameStatus,
  sendWSMessage,
  lastMessage,
  whiteboardHistories,
}) {
  return (
    <div
      className={styles.whiteboards}
      // TODO: figure this out. Unclear why width alone is wrapping for narrower windows
      style={{
        height: `${WHITEBOARD_SIZE * playerGrid.length}px`,
        width: `${WHITEBOARD_SIZE * playerGrid[0].length}px`,
      }}
    >
      {playerGrid.map((row, i) =>
        row.map((player, j) =>
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
            />
          ) : (
            <WhiteboardPlaceholder
              width={WHITEBOARD_SIZE}
              height={WHITEBOARD_SIZE}
              key={`${i}${j}`}
            />
          )
        )
      )}
    </div>
  );
}
