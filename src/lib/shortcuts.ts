export interface Shortcut {
  id: string;
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  category: "global" | "navigation" | "sidebar";
}

// Default shortcuts configuration
export const DEFAULT_SHORTCUTS: Record<string, Shortcut> = {
  openSettings: {
    id: "openSettings",
    key: ",",
    metaKey: true,
    description: "Open Settings",
    category: "global",
  },
  toggleSidebar: {
    id: "toggleSidebar",
    key: "s",
    metaKey: true,
    shiftKey: true,
    description: "Toggle Sidebar",
    category: "sidebar",
  },
  addProject: {
    id: "addProject",
    key: "n",
    metaKey: true,
    description: "Add Project",
    category: "global",
  },
};

const SHORTCUTS_STORAGE_KEY = "envault-shortcuts";

// Get shortcuts from localStorage or defaults
export function getShortcuts(): Record<string, Shortcut> {
  if (typeof window === "undefined") return DEFAULT_SHORTCUTS;

  const stored = localStorage.getItem(SHORTCUTS_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure new shortcuts are included
      return { ...DEFAULT_SHORTCUTS, ...parsed };
    } catch {
      return DEFAULT_SHORTCUTS;
    }
  }
  return DEFAULT_SHORTCUTS;
}

// Save custom shortcuts
export function saveShortcuts(shortcuts: Record<string, Shortcut>): void {
  localStorage.setItem(SHORTCUTS_STORAGE_KEY, JSON.stringify(shortcuts));
}

// Update a single shortcut
export function updateShortcut(
  id: string,
  update: Partial<Omit<Shortcut, "id" | "description" | "category">>
): void {
  const shortcuts = getShortcuts();
  if (shortcuts[id]) {
    shortcuts[id] = { ...shortcuts[id], ...update };
    saveShortcuts(shortcuts);
  }
}

// Reset shortcuts to defaults
export function resetShortcuts(): void {
  localStorage.removeItem(SHORTCUTS_STORAGE_KEY);
}

// Format shortcut for display
export function formatShortcut(shortcut: Shortcut): string[] {
  const keys: string[] = [];
  const isMac =
    typeof navigator !== "undefined" &&
    navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  if (shortcut.ctrlKey || shortcut.metaKey) {
    keys.push(isMac ? "⌘" : "Ctrl");
  }
  if (shortcut.shiftKey) {
    keys.push(isMac ? "⇧" : "Shift");
  }
  if (shortcut.altKey) {
    keys.push(isMac ? "⌥" : "Alt");
  }

  // Format the key
  let displayKey = shortcut.key.toUpperCase();
  if (shortcut.key === ",") displayKey = ",";
  if (shortcut.key === ".") displayKey = ".";
  if (shortcut.key === "Escape") displayKey = "Esc";

  keys.push(displayKey);

  return keys;
}

// Get shortcuts grouped by category
export function getShortcutsByCategory(): Record<string, Shortcut[]> {
  const shortcuts = getShortcuts();
  const grouped: Record<string, Shortcut[]> = {};

  Object.values(shortcuts).forEach((shortcut) => {
    if (!grouped[shortcut.category]) {
      grouped[shortcut.category] = [];
    }
    grouped[shortcut.category].push(shortcut);
  });

  return grouped;
}
