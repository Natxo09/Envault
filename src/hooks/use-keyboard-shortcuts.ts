import { useEffect, useCallback } from "react";

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  handler: (event: KeyboardEvent) => void;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs (except Escape)
      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (isTyping && event.key !== "Escape") {
        return;
      }

      for (const shortcut of shortcuts) {
        const {
          key,
          ctrlKey = false,
          metaKey = false,
          shiftKey = false,
          altKey = false,
          handler,
          preventDefault = true,
        } = shortcut;

        // Check if key matches (case-insensitive for letters)
        const keyMatches =
          event.key.toLowerCase() === key.toLowerCase() ||
          event.code === key;

        // Check modifiers - on Mac, treat metaKey as the primary modifier
        const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
        const ctrlOrCmdPressed = isMac ? event.metaKey : event.ctrlKey;

        const modifiersMatch =
          (ctrlKey ? ctrlOrCmdPressed : !ctrlOrCmdPressed || metaKey) &&
          (metaKey ? event.metaKey : true) &&
          (shiftKey ? event.shiftKey : !event.shiftKey) &&
          (altKey ? event.altKey : !event.altKey);

        // Special handling for Cmd+, (comma)
        if (key === "," && (ctrlKey || metaKey)) {
          if (event.key === "," && ctrlOrCmdPressed) {
            if (preventDefault) {
              event.preventDefault();
            }
            handler(event);
            return;
          }
        }

        if (keyMatches && modifiersMatch) {
          if (preventDefault) {
            event.preventDefault();
          }
          handler(event);
          return;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
}
