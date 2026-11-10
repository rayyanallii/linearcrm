import React from "react";
import { IconSearch } from "@tabler/icons-react";

function shortcutLabel() {
  if (typeof navigator === "undefined") return "Ctrl K";
  const platform = navigator.platform || navigator.userAgent || "";
  return /Mac|iPhone|iPad|iPod/i.test(platform) ? "⌘K" : "Ctrl K";
}

export function SearchButton({ onOpen, block = false, className = "" }) {
  return (
    <button
      type="button"
      className={
        "search-button" +
        (block ? " is-block" : "") +
        (className ? ` ${className}` : "")
      }
      aria-label="Search"
      onClick={onOpen}
    >
      <IconSearch size={15} className="search-button-icon" />
      <span className="search-button-label">Search</span>
      <kbd className="search-button-kbd">{shortcutLabel()}</kbd>
    </button>
  );
}
