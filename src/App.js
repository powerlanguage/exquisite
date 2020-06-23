import React from "react";

export default function App() {
  const apiFetch = async () => {
    const res = await fetch("/api/hello");
    const data = await res.json();
    console.log(data);
  };

  return (
    <div>
      HELLO WORLD DEV!<button onClick={apiFetch}>apiFetch</button>
    </div>
  );
}
