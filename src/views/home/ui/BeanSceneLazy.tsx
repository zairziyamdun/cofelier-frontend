"use client";

import dynamic from "next/dynamic";

// Three.js (~150 КБ gzip) грузится отдельным чанком только в браузере,
// поэтому текст hero появляется, не дожидаясь 3D.
const BeanScene = dynamic(() => import("./BeanScene"), { ssr: false });

export function BeanSceneLazy() {
  return <BeanScene />;
}
