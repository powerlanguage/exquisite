import React from "react";
import styles from "./WhiteboardInfo.module.css";

export default function WhiteboardInfo({
  username,
  handleChangeColor,
  showColorPicker,
}) {
  return (
    <div className={styles.container}>
      {showColorPicker && (
        <input
          type="color"
          onChange={(e) => handleChangeColor(e.target.value)}
        />
      )}
      <div className={styles.username}>{username}</div>
    </div>
  );
}
