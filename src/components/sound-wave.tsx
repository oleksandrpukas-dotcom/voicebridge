"use client";

import { useEffect, useState } from "react";

interface SoundWaveProps {
  active: boolean;
  className?: string;
}

export function SoundWave({ active, className = "" }: SoundWaveProps) {
  const [bars, setBars] = useState<number[]>([0.3, 0.5, 0.3, 0.7, 0.4, 0.6, 0.3, 0.5, 0.4]);

  useEffect(() => {
    if (!active) {
      setBars([0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15]);
      return;
    }
    const interval = setInterval(() => {
      setBars(Array.from({ length: 9 }, () => 0.2 + Math.random() * 0.8));
    }, 120);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className={`flex items-center justify-center gap-[3px] h-8 ${className}`}>
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-current transition-all duration-150 ease-out"
          style={{ height: `${h * 100}%` }}
        />
      ))}
    </div>
  );
}
