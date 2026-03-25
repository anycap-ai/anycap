"use client";

import { useRef, useState, useCallback, useEffect } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!?><{}[]";

interface ScrambleTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  /** ms per character reveal (default 30) */
  speed?: number;
  /** number of random ticks before a character locks in (default 3) */
  ticks?: number;
}

export function ScrambleText({
  text,
  className,
  style,
  speed = 30,
  ticks = 3,
}: ScrambleTextProps) {
  const [display, setDisplay] = useState(text);
  const rafRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const lockedRef = useRef(0);
  const tickCountRef = useRef(0);

  const scramble = useCallback(() => {
    // Reset
    lockedRef.current = 0;
    tickCountRef.current = 0;
    clearInterval(rafRef.current);

    rafRef.current = setInterval(() => {
      const locked = lockedRef.current;
      const result: string[] = [];

      for (let i = 0; i < text.length; i++) {
        if (text[i] === " " || text[i] === "\n") {
          result.push(text[i]);
        } else if (i < locked) {
          result.push(text[i]);
        } else {
          result.push(CHARS[Math.floor(Math.random() * CHARS.length)]);
        }
      }

      setDisplay(result.join(""));
      tickCountRef.current++;

      if (tickCountRef.current % ticks === 0) {
        // Skip spaces when advancing
        lockedRef.current++;
        while (
          lockedRef.current < text.length &&
          (text[lockedRef.current] === " " || text[lockedRef.current] === "\n")
        ) {
          lockedRef.current++;
        }
      }

      if (lockedRef.current >= text.length) {
        clearInterval(rafRef.current);
        setDisplay(text);
      }
    }, speed);
  }, [text, speed, ticks]);

  const reset = useCallback(() => {
    clearInterval(rafRef.current);
    setDisplay(text);
  }, [text]);

  // Cleanup
  useEffect(() => {
    return () => clearInterval(rafRef.current);
  }, []);

  return (
    <span
      className={className}
      style={style}
      onMouseEnter={scramble}
      onMouseLeave={reset}
    >
      {display}
    </span>
  );
}
