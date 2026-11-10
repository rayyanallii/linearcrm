import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function FloatingPanel({
  width = 520,
  className = "",
  ariaLabel,
  children,
  onClose,
}) {
  const ref = useRef(null);
  const [position, setPosition] = useState(null);

  useLayoutEffect(() => {
    const anchor = document.querySelector(".view-bar-top");
    const box = anchor?.getBoundingClientRect();
    const w = Math.min(width, window.innerWidth - 24);
    setPosition({
      left: Math.max(12, window.innerWidth - w - 12),
      top: (box ? box.bottom : 96) + 6,
      width: w,
    });
  }, [width]);

  useEffect(() => {
    function onPointerDown(event) {
      const target = event.target;
      if (ref.current?.contains(target)) return;
      if (target.closest?.(".ui-select-menu")) return;
      if (target.closest?.(".view-actions")) return;
      onClose();
    }
    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    function onScroll(event) {
      const target = event.target;
      if (target?.closest?.(".popover-panel")) return;
      if (target?.closest?.(".ui-select-menu")) return;
      onClose();
    }
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [onClose]);

  if (!position) return null;

  return createPortal(
    <div
      ref={ref}
      className={"popover-panel " + className}
      style={{
        left: position.left,
        top: position.top,
        width: position.width,
      }}
      role="dialog"
      aria-label={ariaLabel}
    >
      {children}
    </div>,
    document.body,
  );
}
