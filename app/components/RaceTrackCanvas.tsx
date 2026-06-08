"use client";

import { useEffect, useRef } from "react";
import {
  buildSpline,
  fitToCanvas,
  generateControlPoints,
} from "../../lib/track-generator";

interface RaceTrackCanvasProps {
  seed: number;
  width?: number;
  height?: number;
  padding?: number;
  trackColor?: string;
  trackWidth?: number;
  backgroundColor?: string;
}

export function RaceTrackCanvas({
  seed,
  width = 700,
  height = 500,
  padding = 60,
  trackColor = "#e8e8e8",
  trackWidth = 28,
  backgroundColor = "#1a2a1a",
}: RaceTrackCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Generate and fit track
    const controls = generateControlPoints(seed, {
      count: 14,
      baseRadius: 1,
      radiusJitter: 0.38,
      angleJitter: 0.5,
    });
    const spline = buildSpline(controls, 24);
    const pts = fitToCanvas(spline, width, height, padding);

    if (pts.length === 0) return;

    // Draw outer glow layer first for visual depth
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.closePath();
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = trackWidth + 12;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.restore();

    // Main track stroke
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.closePath();
    ctx.strokeStyle = trackColor;
    ctx.lineWidth = trackWidth;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.restore();
  }, [seed, width, height, padding, trackColor, trackWidth, backgroundColor]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      aria-label="Race track canvas"
      style={{ display: "block", borderRadius: "8px", maxWidth: "100%" }}
    />
  );
}
