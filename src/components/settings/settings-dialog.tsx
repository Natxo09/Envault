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
import { cn } from "@/lib/utils";
import { Settings, Check } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { getShortcuts, formatShortcut, type Shortcut } from "@/lib/shortcuts";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ThemePreviewProps {
  variant: "light" | "dark" | "system";
  isSelected: boolean;
  onClick: () => void;
  label: string;
}

function ThemePreview({ variant, isSelected, onClick, label }: ThemePreviewProps) {
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
        "group relative flex flex-col items-center gap-2 rounded-xl p-1.5 transition-all cursor-pointer",
        isSelected
          ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
          : "hover:ring-2 hover:ring-muted-foreground/20 hover:ring-offset-2 hover:ring-offset-background"
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

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme();
  const shortcuts = getShortcuts();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
          <DialogDescription>Customize the application</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Theme Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Theme</Label>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map((option) => (
                <ThemePreview
                  key={option.value}
                  variant={option.value}
                  label={option.label}
                  isSelected={theme === option.value}
                  onClick={() => setTheme(option.value)}
                />
              ))}
            </div>
          </div>

          <Separator />

          {/* Keyboard Shortcuts Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Keyboard Shortcuts</Label>
            <div className="space-y-1">
              {Object.values(shortcuts).map((shortcut) => (
                <ShortcutItem key={shortcut.id} shortcut={shortcut} />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
