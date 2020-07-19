import React from "react";
import styles from "./WhiteboardInfo.module.css";

export default function WhiteboardInfo({ username, isActive, showName }) {
  return (
    <div className={`${styles.container} ${!showName ? styles.hidden : ""}`}>
      <div className={`${styles.username} ${isActive ? styles.active : ""}`}>
        {username}
      </div>
    </div>
  );
}
