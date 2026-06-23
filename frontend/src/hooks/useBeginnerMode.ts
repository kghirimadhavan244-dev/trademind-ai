import { useState, useEffect } from "react";

export function useBeginnerMode() {
  const [isBeginner, setIsBeginner] = useState<boolean>(() => {
    const saved = localStorage.getItem("beginner_mode");
    // Default to true (Beginner mode active) to make it friendly on first load
    return saved === null ? true : saved === "true";
  });

  useEffect(() => {
    function handleEvent() {
      const saved = localStorage.getItem("beginner_mode");
      setIsBeginner(saved === null ? true : saved === "true");
    }

    window.addEventListener("beginner-mode-change", handleEvent);
    return () => {
      window.removeEventListener("beginner-mode-change", handleEvent);
    };
  }, []);

  const toggleBeginnerMode = () => {
    const nextVal = !isBeginner;
    localStorage.setItem("beginner_mode", String(nextVal));
    setIsBeginner(nextVal);
    window.dispatchEvent(new Event("beginner-mode-change"));
  };

  return { isBeginner, toggleBeginnerMode };
}
