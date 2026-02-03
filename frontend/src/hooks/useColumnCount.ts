"use client";

import { useEffect, useState } from "react";

export function useColumnCount(containerWidth: number): number {
  if (containerWidth <= 0) return 1;
  if (containerWidth < 640) return 1;
  if (containerWidth < 1024) return 2;
  if (containerWidth < 1280) return 3;
  return 4;
}

export function useListSize(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () =>
      setSize({ width: el.offsetWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ref stable, observe once on mount
  }, []);

  return size;
}
