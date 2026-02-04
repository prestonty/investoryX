import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const DEFAULT_SIZE = 220;
const DEFAULT_FRAME_MS = 360;

interface RobotTraderProps {
  size?: number;
  maxWidth?: number;
  frameMs?: number;
  className?: string;
}

export function RobotTrader({
  size = DEFAULT_SIZE,
  maxWidth = 320,
  frameMs = DEFAULT_FRAME_MS,
  className,
}: RobotTraderProps) {
  const frames = useMemo(
    () => [
      "/simulator/astro_2.png",
      "/simulator/astro_3.png",
    ],
    [],
  );
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frames.length);
    }, frameMs);
    return () => window.clearInterval(id);
  }, [frameMs, frames.length]);

  return (
    <div className={`flex items-center justify-center py-8 ${className ?? ""}`}>
      <div
        className="relative"
        style={{
          width: `min(${size}px, 100%)`,
          maxWidth: `${maxWidth}px`,
        }}
      >
        <div className="relative w-full" style={{ aspectRatio: "3 / 4" }}>
          <Image
            src={frames[frameIndex]}
            fill
            sizes={`${maxWidth}px`}
            alt="Robot trader"
            className="object-contain object-bottom select-none"
            style={{
              imageRendering: "pixelated",
              filter: "drop-shadow(0 10px 24px rgba(30, 58, 138, 0.35))",
            }}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
