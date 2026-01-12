import { useState, useCallback, useEffect } from "react";

export type FocusZone = "sidebar" | "envList";

interface FocusState {
  activeZone: FocusZone;
  sidebarIndex: number;
  envListIndex: number;
}

interface UseFocusManagerOptions {
  sidebarItemCount: number;
  envListItemCount: number;
  onSidebarSelect?: (index: number) => void;
  onSidebarEdit?: (index: number) => void;
  onSidebarDelete?: (index: number) => void;
  onEnvListSelect?: (index: number) => void;
  onEnvListActivate?: (index: number) => void;
  onEnvListRefresh?: () => void;
  enabled?: boolean;
}

export function useFocusManager({
  sidebarItemCount,
  envListItemCount,
  onSidebarSelect,
  onSidebarEdit,
  onSidebarDelete,
  onEnvListSelect,
  onEnvListActivate,
  onEnvListRefresh,
  enabled = true,
}: UseFocusManagerOptions) {
  const [state, setState] = useState<FocusState>({
    activeZone: "sidebar",
    sidebarIndex: 0,
    envListIndex: 0,
  });

  // Clamp indices when item counts change
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      sidebarIndex: Math.min(prev.sidebarIndex, Math.max(0, sidebarItemCount - 1)),
      envListIndex: Math.min(prev.envListIndex, Math.max(0, envListItemCount - 1)),
    }));
  }, [sidebarItemCount, envListItemCount]);

  const setActiveZone = useCallback((zone: FocusZone) => {
    setState((prev) => ({ ...prev, activeZone: zone }));
  }, []);

  const setSidebarIndex = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      sidebarIndex: Math.max(0, Math.min(index, sidebarItemCount - 1)),
    }));
  }, [sidebarItemCount]);

  const setEnvListIndex = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      envListIndex: Math.max(0, Math.min(index, envListItemCount - 1)),
    }));
  }, [envListItemCount]);

  const moveUp = useCallback(() => {
    setState((prev) => {
      if (prev.activeZone === "sidebar") {
        return {
          ...prev,
          sidebarIndex: Math.max(0, prev.sidebarIndex - 1),
        };
      } else {
        return {
          ...prev,
          envListIndex: Math.max(0, prev.envListIndex - 1),
        };
      }
    });
  }, []);

  const moveDown = useCallback(() => {
    setState((prev) => {
      if (prev.activeZone === "sidebar") {
        return {
          ...prev,
          sidebarIndex: Math.min(sidebarItemCount - 1, prev.sidebarIndex + 1),
        };
      } else {
        return {
          ...prev,
          envListIndex: Math.min(envListItemCount - 1, prev.envListIndex + 1),
        };
      }
    });
  }, [sidebarItemCount, envListItemCount]);

  const moveToStart = useCallback(() => {
    setState((prev) => {
      if (prev.activeZone === "sidebar") {
        return { ...prev, sidebarIndex: 0 };
      } else {
        return { ...prev, envListIndex: 0 };
      }
    });
  }, []);

  const moveToEnd = useCallback(() => {
    setState((prev) => {
      if (prev.activeZone === "sidebar") {
        return { ...prev, sidebarIndex: Math.max(0, sidebarItemCount - 1) };
      } else {
        return { ...prev, envListIndex: Math.max(0, envListItemCount - 1) };
      }
    });
  }, [sidebarItemCount, envListItemCount]);

  const switchZone = useCallback(() => {
    setState((prev) => ({
      ...prev,
      activeZone: prev.activeZone === "sidebar" ? "envList" : "sidebar",
    }));
  }, []);

  // Global keyboard handler
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if we're in an input, textarea, or dialog
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.closest('[role="dialog"]')
      ) {
        return;
      }

      const { activeZone, sidebarIndex, envListIndex } = state;

      switch (e.key) {
        case "Tab":
          e.preventDefault();
          switchZone();
          break;

        case "ArrowUp":
        case "k":
          e.preventDefault();
          moveUp();
          break;

        case "ArrowDown":
        case "j":
          e.preventDefault();
          moveDown();
          break;

        case "Home":
          e.preventDefault();
          moveToStart();
          break;

        case "End":
          e.preventDefault();
          moveToEnd();
          break;

        case "Enter":
          e.preventDefault();
          if (activeZone === "sidebar" && sidebarItemCount > 0) {
            onSidebarSelect?.(sidebarIndex);
          } else if (activeZone === "envList" && envListItemCount > 0) {
            onEnvListSelect?.(envListIndex);
          }
          break;

        case "e":
        case "E":
          if (activeZone === "sidebar" && sidebarItemCount > 0) {
            e.preventDefault();
            onSidebarEdit?.(sidebarIndex);
          }
          break;

        case "Delete":
        case "Backspace":
          if (activeZone === "sidebar" && sidebarItemCount > 0) {
            e.preventDefault();
            onSidebarDelete?.(sidebarIndex);
          }
          break;

        case "a":
        case "A":
          if (activeZone === "envList" && envListItemCount > 0) {
            e.preventDefault();
            onEnvListActivate?.(envListIndex);
          }
          break;

        case "r":
        case "R":
          if (activeZone === "envList") {
            e.preventDefault();
            onEnvListRefresh?.();
          }
          break;

        case "1":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            setActiveZone("sidebar");
          }
          break;

        case "2":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            setActiveZone("envList");
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    enabled,
    state,
    sidebarItemCount,
    envListItemCount,
    switchZone,
    moveUp,
    moveDown,
    moveToStart,
    moveToEnd,
    onSidebarSelect,
    onSidebarEdit,
    onSidebarDelete,
    onEnvListSelect,
    onEnvListActivate,
    onEnvListRefresh,
    setActiveZone,
  ]);

  return {
    activeZone: state.activeZone,
    sidebarIndex: state.sidebarIndex,
    envListIndex: state.envListIndex,
    setActiveZone,
    setSidebarIndex,
    setEnvListIndex,
  };
}
