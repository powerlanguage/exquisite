import React from "react";

import styles from "./LoadingSpinner.module.css";

export default function LoadingSpinner({ center = false }) {
  return (
    <div className={center ? styles.container : ""}>
      <div className={styles["lds-ring"]}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}
