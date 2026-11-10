import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconCheck, IconChevronDown } from "@tabler/icons-react";

function normalise(options = []) {
  return options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );
}

export function Select({
  value,
  onChange,
  options = [],
  placeholder = "Select…",
  ariaLabel,
  autoFocus = false,
  disabled = false,
  className = "",
}) {
  const items = normalise(options);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const menuId = useRef(`ui-select-${Math.random().toString(36).slice(2, 9)}`)
    .current;
  const current = items.find((item) => item.value === value);

  function positionMenu() {
    const trigger = triggerRef.current;
    if (!trigger || disabled) return;
    const box = trigger.getBoundingClientRect();
    const menuHeight = Math.min(items.length * 31 + 10, 288);
    const below = window.innerHeight - box.bottom;
    const flip = below < menuHeight + 14 && box.top > below;
    setPosition({
      left: Math.min(box.left, window.innerWidth - Math.max(box.width, 190) - 10),
      width: Math.max(box.width, 190),
      top: flip ? undefined : box.bottom + 6,
      bottom: flip ? window.innerHeight - box.top + 6 : undefined,
    });
  }

  function openMenu() {
    if (disabled) return;
    positionMenu();
    const index = items.findIndex((item) => item.value === value);
    setActive(index >= 0 ? index : 0);
    setOpen(true);
  }

  function closeMenu() {
    setOpen(false);
  }

  function choose(item) {
    onChange(item.value);
    closeMenu();
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(event) {
      const target = event.target;
      if (
        !menuRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        closeMenu();
      }
    }
    function onReposition(event) {
      if (event?.type === "scroll" && menuRef.current?.contains(event.target)) {
        return;
      }
      positionMenu();
    }
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const menu = menuRef.current;
    const option = menu?.querySelector('[data-active="true"]');
    if (!menu || !option) return;
    const top = option.offsetTop;
    const bottom = top + option.offsetHeight;
    if (top < menu.scrollTop) menu.scrollTop = Math.max(0, top - 4);
    else if (bottom > menu.scrollTop + menu.clientHeight) {
      menu.scrollTop = bottom - menu.clientHeight + 4;
    }
  }, [open, active]);

  function handleKeyDown(event) {
    if (disabled) return;
    if (event.key === "Escape") {
      if (open) {
        event.stopPropagation();
        closeMenu();
      }
      return;
    }
    if (!open && ["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      openMenu();
      return;
    }
    if (!open) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(items.length - 1, index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(0, index - 1));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (items[active]) choose(items[active]);
    } else if (event.key === "Tab") {
      closeMenu();
    }
  }

  return (
    <div className={`ui-select ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        className="ui-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        aria-controls={open ? menuId : undefined}
        disabled={disabled}
        autoFocus={autoFocus}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={handleKeyDown}
      >
        <span className={"ui-select-value" + (current ? "" : " is-empty")}>
          {current ? current.label : placeholder}
        </span>
        <IconChevronDown size={14} className="ui-select-chevron" />
      </button>
      {open &&
        position &&
        createPortal(
          <div
            ref={menuRef}
            className="ui-select-menu"
            style={{
              left: position.left,
              top: position.top,
              bottom: position.bottom,
              width: position.width,
            }}
          >
            <ul role="listbox" id={menuId} aria-label={ariaLabel}>
              {items.map((item, index) => (
                <li
                  key={`${item.value}-${index}`}
                  role="option"
                  aria-selected={item.value === value}
                  data-active={index === active}
                  className={
                    "ui-select-option" + (index === active ? " is-active" : "")
                  }
                  onMouseEnter={() => setActive(index)}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    choose(item);
                  }}
                >
                  <span className="ui-select-option-label">{item.label}</span>
                  {item.value === value && <IconCheck size={14} />}
                </li>
              ))}
              {!items.length && <li className="ui-select-empty">No options</li>}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
}
