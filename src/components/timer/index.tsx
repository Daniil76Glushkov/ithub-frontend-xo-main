import { useEffect, useRef, useState } from "react";

export default function Timer() {
  const [remaining, setRemaining] = useState(10);
  const intervalRef = useRef<number>(undefined!);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((value) => {
        if (value <= 0) {
          clearInterval(intervalRef.current);
          return 10;
        }
        return value - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  return <span>{remaining}</span>;
}
