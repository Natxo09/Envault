import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Folder,
  FolderOpen,
  FolderGit2,
  FolderCode,
  FolderHeart,
  FolderKey,
  FolderLock,
  FolderCog,
  Box,
  Package,
  Boxes,
  Code,
  Code2,
  Terminal,
  Braces,
  FileCode,
  FileJson,
  Globe,
  Server,
  Database,
  Cloud,
  Rocket,
  Zap,
  Star,
  Heart,
  Bookmark,
  Flag,
  Target,
  Lightbulb,
  Puzzle,
  Cpu,
  Smartphone,
  Monitor,
  Gamepad2,
  Music,
  Camera,
  Palette,
  PenTool,
  type LucideIcon,
} from "lucide-react";

export const ICONS: { id: string; icon: LucideIcon }[] = [
  { id: "folder", icon: Folder },
  { id: "folder-open", icon: FolderOpen },
  { id: "folder-git", icon: FolderGit2 },
  { id: "folder-code", icon: FolderCode },
  { id: "folder-heart", icon: FolderHeart },
  { id: "folder-key", icon: FolderKey },
  { id: "folder-lock", icon: FolderLock },
  { id: "folder-cog", icon: FolderCog },
  { id: "box", icon: Box },
  { id: "package", icon: Package },
  { id: "boxes", icon: Boxes },
  { id: "code", icon: Code },
  { id: "code-2", icon: Code2 },
  { id: "terminal", icon: Terminal },
  { id: "braces", icon: Braces },
  { id: "file-code", icon: FileCode },
  { id: "file-json", icon: FileJson },
  { id: "globe", icon: Globe },
  { id: "server", icon: Server },
  { id: "database", icon: Database },
  { id: "cloud", icon: Cloud },
  { id: "rocket", icon: Rocket },
  { id: "zap", icon: Zap },
  { id: "star", icon: Star },
  { id: "heart", icon: Heart },
  { id: "bookmark", icon: Bookmark },
  { id: "flag", icon: Flag },
  { id: "target", icon: Target },
  { id: "lightbulb", icon: Lightbulb },
  { id: "puzzle", icon: Puzzle },
  { id: "cpu", icon: Cpu },
  { id: "smartphone", icon: Smartphone },
  { id: "monitor", icon: Monitor },
  { id: "gamepad", icon: Gamepad2 },
  { id: "music", icon: Music },
  { id: "camera", icon: Camera },
  { id: "palette", icon: Palette },
  { id: "pen-tool", icon: PenTool },
];

export const COLORS = [
  "#737373", // neutral
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
];

export function getIconById(id: string): LucideIcon {
  return ICONS.find((i) => i.id === id)?.icon ?? Folder;
}

interface IconPickerProps {
  icon: string;
  color: string;
  onIconChange: (icon: string) => void;
  onColorChange: (color: string) => void;
  disabled?: boolean;
}

export function IconPicker({
  icon,
  color,
  onIconChange,
  onColorChange,
  disabled,
}: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const SelectedIcon = getIconById(icon);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          disabled={disabled}
          className="size-12 shrink-0"
        >
          <SelectedIcon className="size-6" style={{ color }} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Color
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={cn(
                    "size-6 rounded-md transition-all",
                    color === c
                      ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                      : "hover:scale-110"
                  )}
                  style={{ backgroundColor: c }}
                  onClick={() => onColorChange(c)}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Icon
            </p>
            <div className="grid grid-cols-8 gap-1">
              {ICONS.map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={cn(
                    "size-7 rounded-md flex items-center justify-center transition-all",
                    icon === id
                      ? "bg-accent ring-2 ring-foreground"
                      : "hover:bg-accent"
                  )}
                  onClick={() => {
                    onIconChange(id);
                    setOpen(false);
                  }}
                >
                  <Icon className="size-4" style={{ color }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
