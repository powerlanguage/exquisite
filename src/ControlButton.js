import React from "react";

import styles from "./ControlButton.module.css";

const ControlButton = React.forwardRef(({ onClick, children }, ref) => {
  return (
    <button onClick={onClick} className={styles.btn} ref={ref}>
      {children}
    </button>
  );
});

export default ControlButton;
