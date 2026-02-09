"use client";

import { useMemo } from "react";

interface QRCodeDisplayProps {
  size?: number;
  label?: string;
  scanning?: boolean;
}

export function QRCodeDisplay({ size = 200, label, scanning = true }: QRCodeDisplayProps) {
  const gridSize = 21;
  const cellSize = size / gridSize;

  const pattern = useMemo(() => {
    const cells: boolean[][] = [];
    let s = 42;
    const rand = () => {
      s = (s * 16807 + 0) % 2147483647;
      return s / 2147483647;
    };

    for (let r = 0; r < gridSize; r++) {
      cells[r] = [];
      for (let c = 0; c < gridSize; c++) {
        const isFinderTL = r < 7 && c < 7;
        const isFinderTR = r < 7 && c >= gridSize - 7;
        const isFinderBL = r >= gridSize - 7 && c < 7;

        if (isFinderTL || isFinderTR || isFinderBL) {
          const lr = r < 7 ? r : r - (gridSize - 7);
          const lc = c < 7 ? c : c - (gridSize - 7);
          const isBorder = lr === 0 || lr === 6 || lc === 0 || lc === 6;
          const isInner = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
          cells[r][c] = isBorder || isInner;
        } else {
          cells[r][c] = rand() > 0.5;
        }
      }
    }
    return cells;
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative p-4 bg-card rounded-2xl shadow-elevated border border-border">
        {scanning && (
          <div className="absolute inset-4 overflow-hidden rounded-lg pointer-events-none z-10">
            <div className="absolute left-0 right-0 h-0.5 bg-primary/60 animate-qr-scan" />
          </div>
        )}

        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-lg">
          <rect width={size} height={size} fill="white" />
          {pattern.map((row, r) =>
            row.map((filled, c) =>
              filled ? (
                <rect
                  key={`${r}-${c}`}
                  x={c * cellSize}
                  y={r * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill="#1a1a2e"
                  rx={cellSize * 0.1}
                />
              ) : null
            )
          )}
          <rect x={size / 2 - 18} y={size / 2 - 18} width={36} height={36} fill="white" rx={6} />
          <rect x={size / 2 - 14} y={size / 2 - 14} width={28} height={28} fill="#8b6cf6" rx={4} />
          <text
            x={size / 2}
            y={size / 2 + 5}
            textAnchor="middle"
            fill="white"
            fontSize="14"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            N
          </text>
        </svg>
      </div>
      {label && <p className="text-sm text-muted-foreground text-center max-w-[250px]">{label}</p>}
    </div>
  );
}
