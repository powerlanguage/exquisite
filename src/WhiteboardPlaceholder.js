import React from "react";

import styles from "./WhiteboardPlaceholder.module.css";

export default function WhiteboardPlaceholder({ width, height }) {
  return (
    <div
      className={styles.whiteboardPlaceholder}
      style={{ width, height }}
    ></div>
  );
}
