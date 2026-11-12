import { useEffect, useState } from "react";

const TICK = 250;

export const useStopwatch = (running: boolean) => {
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(startedAt);

  useEffect(() => {
    if (!running) return;

    const timer = setInterval(() => setNow(Date.now()), TICK);
    return () => clearInterval(timer);
  }, [running]);

  return now - startedAt;
};
