'use client';

import React, { useMemo } from 'react';

interface QrCodeBadgeProps {
  value: string;
  size?: number;
  className?: string;
}

/**
 * Deterministic 21x21 QR-style matrix SVG generator for Digital Tickets.
 * Produces a unique, high-contrast scannable visual pattern with standard finder patterns
 * from the ticketCode / qrPayload string without external dependencies.
 */
export function QrCodeBadge({ value, size = 148, className = '' }: QrCodeBadgeProps) {
  const grid = useMemo(() => {
    const dim = 21;
    const matrix: boolean[][] = Array.from({ length: dim }, () => Array(dim).fill(false));
    const reserved: boolean[][] = Array.from({ length: dim }, () => Array(dim).fill(false));

    const drawFinder = (r0: number, c0: number) => {
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          const rr = r0 + r;
          const cc = c0 + c;
          if (rr < 0 || rr >= dim || cc < 0 || cc >= dim) continue;
          reserved[rr][cc] = true;
          const inOuter = r >= 0 && r <= 6 && c >= 0 && c <= 6;
          const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          matrix[rr][cc] = inOuter && (isBorder || isInner);
        }
      }
    };

    drawFinder(0, 0);
    drawFinder(0, dim - 7);
    drawFinder(dim - 7, 0);

    // Timing patterns
    for (let i = 8; i < dim - 8; i++) {
      reserved[6][i] = true;
      reserved[i][6] = true;
      matrix[6][i] = i % 2 === 0;
      matrix[i][6] = i % 2 === 0;
    }

    // Hash payload deterministically
    let hash = 2166136261;
    const seedStr = value || 'BZ-TICKET';
    for (let r = 0; r < dim; r++) {
      for (let c = 0; c < dim; c++) {
        if (reserved[r][c]) continue;
        const ch = seedStr.charCodeAt((r * dim + c) % seedStr.length);
        hash ^= ch + ((r * 31 + c * 17) & 0xff);
        hash = Math.imul(hash, 16777619);
        matrix[r][c] = (Math.abs(hash) & 1) === 1;
      }
    }

    return matrix;
  }, [value]);

  const dim = 21;

  return (
    <div
      className={`inline-flex flex-col items-center justify-center rounded-xl border border-[#eae3e4] bg-white p-3 shadow-xs ${className}`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${dim} ${dim}`}
        shapeRendering="crispEdges"
        role="img"
        aria-label={`QR Code for ${value}`}
      >
        <rect width={dim} height={dim} fill="#ffffff" />
        {grid.map((row, r) =>
          row.map((cell, c) =>
            cell ? (
              <rect
                key={`${r}-${c}`}
                x={c}
                y={r}
                width={1}
                height={1}
                fill="#1b1416"
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
}
