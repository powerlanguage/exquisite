import React, { useState, useEffect } from "react";
import styles from "./ClearPicker.module.css";
import ControlButton from "./ControlButton";

export default function ClearPicker({ onClear, onShowFlyout, menuCollapsed }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const showFlyout = () => {
    setShowConfirm(true);
    onShowFlyout();
  };

  const hideFlyout = () => {
    setShowConfirm(false);
  };

  const toggleFlyout = () => {
    if (showConfirm) {
      hideFlyout();
    } else {
      showFlyout();
    }
  };

  const handleClick = (clear) => {
    if (clear) {
      onClear(true);
    }
    hideFlyout();
  };

  useEffect(() => {
    if (menuCollapsed) {
      hideFlyout();
    }
  }, [menuCollapsed]);

  return (
    <div>
      {showConfirm && (
        <div className={styles.confirmationContainer}>
          <div className={styles.confirmation}>
            <div className={styles.hint}>Are you sure?</div>
            <ControlButton onClick={() => handleClick(true)}>Yes</ControlButton>
            <ControlButton onClick={() => handleClick(false)}>No</ControlButton>
          </div>
        </div>
      )}
      <ControlButton onClick={() => toggleFlyout()}>Clear</ControlButton>
    </div>
  );
}
