"use client";

import { ReactLenis } from "lenis/react";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.09,
        smoothWheel: true,
        wheelMultiplier: 1,
        allowNestedScroll: true,
        anchors: { offset: -68 },
      }}
    >
      {children}
    </ReactLenis>
  );
}
