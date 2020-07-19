import React, { useState, useEffect } from "react";

const ControlsContext = React.createContext({ a: 1 });

export function ControlsProvider({ children }) {
  const [color, setColor] = useState("#222");
  const [brushSize, setBrushSize] = useState(3);
  const [clear, setClear] = useState(false);

  // Reset clear after call
  useEffect(() => {
    if (!clear) return;
    setClear(false);
  }, [clear]);

  return (
    <ControlsContext.Provider
      value={{ color, setColor, brushSize, setBrushSize, clear, setClear }}
    >
      {children}
    </ControlsContext.Provider>
  );
}

export default ControlsContext;
