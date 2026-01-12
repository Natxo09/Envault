import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Kbd } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Settings, Check } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { usePreferences } from "@/hooks/use-preferences";
import { getShortcutsByCategory, formatShortcut, type Shortcut } from "@/lib/shortcuts";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ThemePreviewProps {
  variant: "light" | "dark" | "system";
  isSelected: boolean;
  isFocused: boolean;
  onClick: () => void;
  label: string;
}

function ThemePreview({ variant, isSelected, isFocused, onClick, label }: ThemePreviewProps) {
  const colors = {
    light: {
      bg: "bg-gray-100",
      sidebar: "bg-white",
      sidebarDots: "bg-gray-300",
      sidebarLines: "bg-gray-200",
      content: "bg-white",
      contentLines: "bg-gray-200",
      contentBoxes: "bg-gray-100",
      border: "border-gray-200",
    },
    dark: {
      bg: "bg-zinc-900",
      sidebar: "bg-zinc-800",
      sidebarDots: "bg-zinc-600",
      sidebarLines: "bg-zinc-700",
      content: "bg-zinc-800",
      contentLines: "bg-zinc-700",
      contentBoxes: "bg-zinc-900",
      border: "border-zinc-700",
    },
    system: {
      bg: "bg-gradient-to-br from-gray-100 to-zinc-800",
      sidebar: "bg-gradient-to-b from-white to-zinc-800",
      sidebarDots: "bg-gray-400",
      sidebarLines: "bg-gray-300",
      content: "bg-gradient-to-b from-white to-zinc-800",
      contentLines: "bg-gray-300",
      contentBoxes: "bg-gray-200",
      border: "border-gray-300",
    },
  };

  const c = colors[variant];

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center gap-2 rounded-xl p-1.5 cursor-pointer outline-none",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        isFocused && !isSelected && "ring-2 ring-primary/50 ring-offset-2 ring-offset-background",
        !isSelected && !isFocused && "hover:ring-2 hover:ring-muted-foreground/20 hover:ring-offset-2 hover:ring-offset-background"
      )}
    >
      {/* Preview Card */}
      <div
        className={cn(
          "relative w-full aspect-[4/3] rounded-lg overflow-hidden border",
          c.bg,
          c.border
        )}
      >
        {/* Sidebar */}
        <div className={cn("absolute left-0 top-0 bottom-0 w-[35%] p-1.5", c.sidebar)}>
          {/* Window dots */}
          <div className="flex gap-0.5 mb-2">
            <div className={cn("w-1 h-1 rounded-full", c.sidebarDots)} />
            <div className={cn("w-1 h-1 rounded-full", c.sidebarDots)} />
            <div className={cn("w-1 h-1 rounded-full", c.sidebarDots)} />
          </div>
          {/* Sidebar lines */}
          <div className="space-y-1.5">
            <div className={cn("h-1 w-full rounded-full", c.sidebarLines)} />
            <div className={cn("h-1 w-3/4 rounded-full", c.sidebarLines)} />
            <div className={cn("h-1 w-full rounded-full", c.sidebarLines)} />
            <div className={cn("h-1 w-2/3 rounded-full", c.sidebarLines)} />
          </div>
        </div>

        {/* Main content */}
        <div className={cn("absolute right-0 top-0 bottom-0 w-[65%] p-1.5", c.content)}>
          {/* Header line */}
          <div className={cn("h-1.5 w-1/2 rounded-full mb-2", c.contentLines)} />
          {/* Content boxes */}
          <div className="grid grid-cols-2 gap-1">
            <div className={cn("aspect-square rounded", c.contentBoxes)} />
            <div className={cn("aspect-square rounded", c.contentBoxes)} />
          </div>
          {/* Bottom lines */}
          <div className="mt-2 space-y-1">
            <div className={cn("h-1 w-full rounded-full", c.contentLines)} />
            <div className={cn("h-1 w-3/4 rounded-full", c.contentLines)} />
          </div>
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Label */}
      <span
        className={cn(
          "text-xs font-medium transition-colors",
          isSelected ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </button>
  );
}

function ShortcutItem({ shortcut }: { shortcut: Shortcut }) {
  const keys = formatShortcut(shortcut);

  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-muted-foreground">{shortcut.description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, index) => (
          <Kbd key={index} size="sm">
            {key}
          </Kbd>
        ))}
      </div>
    </div>
  );
}

const themeOptions = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

const categoryLabels: Record<string, string> = {
  global: "Global",
  projects: "Projects",
  envFiles: "Env Files",
};

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme();
  const { toastsEnabled, setToastsEnabled } = usePreferences();
  const shortcutsByCategory = getShortcutsByCategory();
  const [focusedIndex, setFocusedIndex] = useState(() =>
    themeOptions.findIndex(o => o.value === theme)
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reset focus index when dialog opens
  useEffect(() => {
    if (open) {
      setFocusedIndex(themeOptions.findIndex(o => o.value === theme));
    }
  }, [open, theme]);

  // Keyboard navigation for theme selection and scroll
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const scrollAmount = 60;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          setFocusedIndex(prev => Math.max(0, prev - 1));
          break;
        case "ArrowRight":
          e.preventDefault();
          setFocusedIndex(prev => Math.min(themeOptions.length - 1, prev + 1));
          break;
        case "j":
        case "J":
        case "ArrowDown":
          e.preventDefault();
          scrollContainerRef.current?.scrollBy({ top: scrollAmount, behavior: "smooth" });
          break;
        case "k":
        case "K":
        case "ArrowUp":
          e.preventDefault();
          scrollContainerRef.current?.scrollBy({ top: -scrollAmount, behavior: "smooth" });
          break;
        case "Enter":
          // Only handle if not on a button (to avoid double-triggering)
          if ((e.target as HTMLElement).tagName !== "BUTTON") {
            e.preventDefault();
            setTheme(themeOptions[focusedIndex].value);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, focusedIndex, setTheme]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
          <DialogDescription>Customize the application</DialogDescription>
        </DialogHeader>

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto scrollbar-thin px-6 pb-6"
        >
          <div className="space-y-6">
          {/* Theme Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Theme</Label>
              <span className="flex items-center gap-0.5">
                <Kbd size="sm">←→</Kbd>
                <Kbd size="sm">⏎</Kbd>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map((option, index) => (
                <ThemePreview
                  key={option.value}
                  variant={option.value}
                  label={option.label}
                  isSelected={theme === option.value}
                  isFocused={index === focusedIndex}
                  onClick={() => setTheme(option.value)}
                />
              ))}
            </div>
          </div>

          <Separator />

          {/* Notifications Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Notifications</Label>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-sm">Toast notifications</span>
                <p className="text-xs text-muted-foreground">
                  Show feedback messages for actions
                </p>
              </div>
              <Switch
                checked={toastsEnabled}
                onCheckedChange={setToastsEnabled}
              />
            </div>
          </div>

          <Separator />

          {/* Keyboard Shortcuts Section */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Keyboard Shortcuts</Label>
            {Object.entries(shortcutsByCategory).map(([category, shortcuts]) => (
              <div key={category} className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {categoryLabels[category] || category}
                </span>
                <div className="space-y-0.5">
                  {shortcuts.map((shortcut) => (
                    <ShortcutItem key={shortcut.id} shortcut={shortcut} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
