import React from "react";

import styles from "./ControlButton.module.css";

export default function ControlButton({ onClick, children }) {
  return (
    <button onClick={onClick} className={styles.btn}>
      {children}
    </button>
  );
}
