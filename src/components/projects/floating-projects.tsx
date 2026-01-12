import { useEffect, useState, useRef } from "react";
import { getIconById } from "@/components/ui/icon-picker";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import type { Project } from "@/hooks/use-projects";

interface FloatingProjectsProps {
  projects: Project[];
  selectedProject: Project | null;
  focusedIndex: number;
  isActive: boolean;
  sidebarCollapsed: boolean;
  navigationTrigger: number;
}

export function FloatingProjects({
  projects,
  selectedProject,
  focusedIndex,
  isActive,
  sidebarCollapsed,
  navigationTrigger,
}: FloatingProjectsProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastNavigationTriggerRef = useRef(navigationTrigger);
  const lastSelectedIdRef = useRef(selectedProject?.id);

  const clearTimeouts = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const hide = () => {
    setIsVisible(false);
    // Wait for animation to complete before unmounting
    hideTimeoutRef.current = setTimeout(() => {
      setShouldRender(false);
    }, 200);
  };

  // Close immediately when a project is selected (Enter pressed)
  useEffect(() => {
    if (selectedProject?.id !== lastSelectedIdRef.current) {
      lastSelectedIdRef.current = selectedProject?.id;
      if (shouldRender) {
        clearTimeouts();
        hide();
      }
    }
  }, [selectedProject?.id, shouldRender]);

  // Show when sidebar is collapsed and navigating in projects
  useEffect(() => {
    // Only show if sidebar is collapsed and we're active in the sidebar zone
    if (!sidebarCollapsed || !isActive || projects.length === 0) {
      if (shouldRender) {
        clearTimeouts();
        hide();
      }
      return;
    }

    // Show when navigation trigger changes (user is navigating, even if index doesn't change)
    if (navigationTrigger !== lastNavigationTriggerRef.current) {
      lastNavigationTriggerRef.current = navigationTrigger;
      clearTimeouts();

      if (!shouldRender) {
        // First render: mount hidden, then animate in
        setShouldRender(true);
        setTimeout(() => {
          setIsVisible(true);
        }, 20);
      } else {
        // Already visible, just reset the hide timer
        setIsVisible(true);
      }

      // Auto-hide after 1.5s of inactivity
      timeoutRef.current = setTimeout(() => {
        hide();
      }, 1500);
    }

    return () => {
      clearTimeouts();
    };
  }, [navigationTrigger, sidebarCollapsed, isActive, projects.length, shouldRender]);

  // Reset when sidebar opens
  useEffect(() => {
    if (!sidebarCollapsed) {
      clearTimeouts();
      setIsVisible(false);
      setShouldRender(false);
      lastNavigationTriggerRef.current = navigationTrigger;
    }
  }, [sidebarCollapsed, navigationTrigger]);

  if (!shouldRender || projects.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed left-3 top-12 z-50",
        "bg-background/95 backdrop-blur-sm",
        "border rounded-lg shadow-lg",
        "p-2 min-w-[200px] max-w-[280px]",
        "transition-all duration-200 ease-out",
        isVisible
          ? "opacity-100 translate-x-0"
          : "opacity-0 -translate-x-2"
      )}
    >
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Projects
        </span>
        <span className="flex items-center gap-0.5">
          <Kbd size="sm">↑↓</Kbd>
          <Kbd size="sm">⏎</Kbd>
        </span>
      </div>
      <div className="space-y-0.5">
        {projects.map((project, index) => {
          const ProjectIcon = getIconById(project.icon);
          const isFocused = index === focusedIndex;
          const isSelected = selectedProject?.id === project.id;

          return (
            <div
              key={project.id}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm",
                isSelected && "bg-accent",
                isFocused && "bg-accent ring-2 ring-primary ring-inset"
              )}
            >
              <ProjectIcon
                className="size-4 shrink-0"
                style={{ color: project.icon_color }}
              />
              <span className="truncate">{project.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
