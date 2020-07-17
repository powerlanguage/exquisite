import React from "react";

import styles from "./ControlButton.module.css";

const ControlButton = React.forwardRef(
  ({ onClick, selected, children }, ref) => {
    return (
      <button
        onClick={onClick}
        className={`${styles.btn} ${selected ? styles.selected : ""}`}
        ref={ref}
      >
        {children}
      </button>
    );
  }
);

export default ControlButton;
