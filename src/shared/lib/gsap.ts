import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

// Плагины регистрируются один раз на всё приложение; импортировать GSAP — только отсюда.
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

// Медиа-запрос «анимации разрешены»: при prefers-reduced-motion их не запускаем.
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

export { gsap, ScrollTrigger, SplitText, useGSAP };
