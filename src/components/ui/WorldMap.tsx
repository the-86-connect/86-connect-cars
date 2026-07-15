"use client";

import { shippingRoutes } from "@/lib/data";

/**
 * Real world map image with animated SVG shipping route overlays.
 *
 * Layer 1: Generated dot-grid world map image (equirectangular projection).
 * Layer 2: SVG overlay (viewBox 0 0 100 100, preserveAspectRatio="none") with
 *          curved routes, ship dots, pulsing destination markers, and labels.
 *
 * Route coordinates in data.ts are percentage-based and match a standard
 * equirectangular world map projection.
 */

// China (Shanghai) position in percentage coordinates
const CHINA = { x: 82, y: 38 };

function routePath(
  from: { x: number; y: number },
  to: { x: number; y: number },
) {
  const midX = (from.x + to.x) / 2;
  const midY = Math.min(from.y, to.y) - 10;
  return `M${from.x},${from.y} Q${midX},${midY} ${to.x},${to.y}`;
}

export function WorldMap() {
  return (
    <div className="relative aspect-[2/1] w-full overflow-hidden rounded-2xl">
      {/* Real dot-grid world map */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero/world-map.jpg"
        alt="World map showing 86Connect shipping routes from China to 40+ countries"
        className="h-full w-full object-cover"
      />

      {/* SVG route overlay — percentage coordinates aligned to the image */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E31E24" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#E31E24" stopOpacity="0.3" />
          </linearGradient>
          <radialGradient id="chinaGlow">
            <stop offset="0%" stopColor="#E31E24" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#E31E24" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* China highlight glow */}
        <circle cx={CHINA.x} cy={CHINA.y} r="7" fill="url(#chinaGlow)" />

        {/* China pulse rings */}
        <circle
          cx={CHINA.x}
          cy={CHINA.y}
          r="2"
          fill="none"
          stroke="#E31E24"
          strokeWidth="0.4"
          opacity="0.6"
        >
          <animate
            attributeName="r"
            values="2;7;2"
            dur="2.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.6;0;0.6"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </circle>

        {/* China center dot */}
        <circle cx={CHINA.x} cy={CHINA.y} r="1.8" fill="#E31E24" />

        {/* Shipping routes */}
        {shippingRoutes.map((route) => {
          const path = routePath(CHINA, { x: route.x, y: route.y });
          return (
            <g key={route.country}>
              {/* Route path */}
              <path
                d={path}
                fill="none"
                stroke="url(#routeGrad)"
                strokeWidth="0.4"
                strokeDasharray="1.5 1"
                opacity="0.75"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values="0;-5"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </path>

              {/* Ship dot traveling along the path */}
              <circle r="0.9" fill="#E31E24">
                <animateMotion
                  dur={`${3 + (route.x % 3)}s`}
                  repeatCount="indefinite"
                >
                  <mpath href={`#path-${route.country}`} />
                </animateMotion>
              </circle>

              {/* Hidden path for animateMotion reference */}
              <path
                id={`path-${route.country}`}
                d={path}
                fill="none"
                stroke="none"
              />

              {/* Destination marker — outer pulse */}
              <circle
                cx={route.x}
                cy={route.y}
                r="1.3"
                fill="none"
                stroke="#E31E24"
                strokeWidth="0.3"
                opacity="0.5"
              >
                <animate
                  attributeName="r"
                  values="1.3;3.5;1.3"
                  dur="2s"
                  repeatCount="indefinite"
                  begin={`${(route.x % 5) * 0.3}s`}
                />
                <animate
                  attributeName="opacity"
                  values="0.5;0;0.5"
                  dur="2s"
                  repeatCount="indefinite"
                  begin={`${(route.x % 5) * 0.3}s`}
                />
              </circle>

              {/* Destination marker — inner dot */}
              <circle
                cx={route.x}
                cy={route.y}
                r="1.2"
                fill="#fff"
                stroke="#E31E24"
                strokeWidth="0.5"
              />
            </g>
          );
        })}
      </svg>

      {/* China + destination labels (HTML for crisp text) */}
      <div className="pointer-events-none absolute inset-0">
        <span
          className="absolute -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold text-brand-500 sm:text-xs"
          style={{ left: `${CHINA.x}%`, top: `${CHINA.y - 5}%` }}
        >
          China
        </span>
        {shippingRoutes.map((route) => (
          <span
            key={route.country}
            className="absolute -translate-x-1/2 text-lg"
            style={{ left: `${route.x}%`, top: `${route.y + 3}%` }}
          >
            {route.flag}
          </span>
        ))}
      </div>
    </div>
  );
}
