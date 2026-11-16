"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { whenIdle } from "../lib/when-idle";

// Three.js (~150 КБ gzip) грузится отдельным чанком только в браузере
// и только когда главный поток освободился: текст hero не ждёт 3D.
const BeanScene = dynamic(() => import("./BeanScene"), { ssr: false });

export function BeanSceneLazy() {
  const [idle, setIdle] = useState(false);
  useEffect(() => whenIdle(() => setIdle(true)), []);
  return idle ? <BeanScene /> : null;
}
