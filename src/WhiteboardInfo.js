import React from "react";
import styles from "./WhiteboardInfo.module.css";

export default function WhiteboardInfo({ username, isActive }) {
  return (
    <div className={styles.container}>
      <div className={`${styles.username} ${isActive ? styles.active : ""}`}>
        {username}
      </div>
    </div>
  );
}
