import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const BOTS = [
  { name: "Maya", color: "#6f7bd6", phase: 0.3 },
  { name: "Liner", color: "#2f8f6b", phase: 2.1 },
];

const DEMO_SELECTOR = ".lp-platform-panel-stage, .lp-hero-frame, .lp-ask-stage, .lp-product-preview, .lp-feature-stage, .lp-dark-stage, .lp-detail-demo";
const TARGET_SELECTOR = "button, .d-deal, .d-board-col, .d-focus-row, .d-node, .d-kpi, .d-account, .d-book-row, .d-app-row, .d-liner-msg, .d-move-card, .d-timeline-event, .d-task";

function Arrow({ color }) {
  return (
    <svg width="18" height="18" viewBox="0 0 28 28" aria-hidden="true">
      <path d="M5 3 L23 14 L14 16 L11 24 Z" fill={color} stroke="rgba(255,255,255,.7)" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}

function visibleDemo() {
  if (typeof document === "undefined") return null;
  const center = window.innerHeight / 2;
  return Array.from(document.querySelectorAll(DEMO_SELECTOR))
    .filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 120 && rect.top < window.innerHeight * 0.86 && rect.bottom > window.innerHeight * 0.12;
    })
    .sort((a, b) => {
      const ar = a.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      return Math.abs(ar.top + ar.height / 2 - center) - Math.abs(br.top + br.height / 2 - center);
    })[0] || null;
}

function targetsIn(demo) {
  if (!demo) return [];
  return Array.from(demo.querySelectorAll(TARGET_SELECTOR)).filter((element) => {
    if (element.closest(".lp-cursor-layer") || element.getAttribute("aria-hidden") === "true") return false;
    const rect = element.getBoundingClientRect();
    if (rect.width < 24 || rect.height < 14) return false;
    if (rect.top < 92 || rect.bottom > window.innerHeight - 36) return false;
    if (rect.left < 16 || rect.right > window.innerWidth - 16) return false;
    return element.offsetParent !== null;
  });
}

function BotCursor({ bot, index }) {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const opacity = useMotionValue(0);
  const smoothX = useSpring(x, { stiffness: 58, damping: 24, mass: 0.7 });
  const smoothY = useSpring(y, { stiffness: 58, damping: 24, mass: 0.7 });

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const demo = visibleDemo();
      const targets = targetsIn(demo);
      const target = targets.length
        ? targets[(Math.floor((window.scrollY + window.innerHeight * 0.35) / 180) + index * 2) % targets.length]
        : null;

      opacity.set(target ? 0.92 : 0);

      if (target) {
        const rect = target.getBoundingClientRect();
        x.set(Math.min(window.innerWidth - 54, Math.max(54, rect.left + rect.width * 0.5)));
        y.set(Math.min(window.innerHeight - 64, Math.max(92, rect.top + rect.height * 0.5)));
      }

      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [index, opacity, x, y]);

  return (
    <motion.div className="lp-cursor lp-cursor--bot" style={{ x: smoothX, y: smoothY, color: bot.color, opacity }} aria-hidden="true">
      <Arrow color={bot.color} />
      <span className="lp-cursor-label" style={{ background: bot.color }}>{bot.name}</span>
    </motion.div>
  );
}

function UserCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const smoothX = useSpring(x, { stiffness: 700, damping: 44, mass: 0.35 });
  const smoothY = useSpring(y, { stiffness: 700, damping: 44, mass: 0.35 });
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const move = (event) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
    };
    const down = () => setPressed(true);
    const up = () => setPressed(false);
    const leave = () => setVisible(false);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.removeEventListener("pointerleave", leave);
    };
  }, [x, y]);

  return (
    <motion.div
      className="lp-cursor lp-cursor--user"
      style={{ x: smoothX, y: smoothY }}
      animate={{ opacity: visible ? 1 : 0, scale: pressed ? 0.86 : 1 }}
      transition={{ opacity: { duration: 0.16 }, scale: { duration: 0.12 } }}
      aria-hidden="true"
    >
      <Arrow color="#15171a" />
      <span className="lp-cursor-label">You</span>
    </motion.div>
  );
}

export function CursorLayer() {
  useEffect(() => {
    const onPointerMove = () => document.body.classList.add("lp-custom-cursor");
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.body.classList.remove("lp-custom-cursor");
    };
  }, []);

  return (
    <div className="lp-cursor-layer" aria-hidden="true">
      {BOTS.map((bot, index) => <BotCursor bot={bot} index={index} key={bot.name} />)}
      <UserCursor />
    </div>
  );
}
