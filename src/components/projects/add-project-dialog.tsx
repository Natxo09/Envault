import { useState, useEffect, useRef } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Kbd } from "@/components/ui/kbd";
import { IconPicker } from "@/components/ui/icon-picker";
import { FolderOpen, Loader2 } from "lucide-react";
import type { AddProjectParams } from "@/hooks/use-projects";

interface AddProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (params: AddProjectParams) => Promise<void>;
}

export function AddProjectDialog({
  open: isOpen,
  onOpenChange,
  onAdd,
}: AddProjectDialogProps) {
  const [path, setPath] = useState("");
  const [icon, setIcon] = useState("folder");
  const [iconColor, setIconColor] = useState("#737373");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setPath("");
      setIcon("folder");
      setIconColor("#737373");
      setError(null);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleBrowse = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select Project Folder",
      });

      if (selected && typeof selected === "string") {
        setPath(selected);
        setError(null);
      }
    } catch (err) {
      console.error("Error selecting folder:", err);
    }
  };

  const handleSubmit = async () => {
    if (!path.trim()) {
      setError("Please select or enter a project path");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onAdd({
        path: path.trim(),
        icon,
        icon_color: iconColor,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>Add Project</DialogTitle>
          <DialogDescription>
            Select a folder to add as a project. Envault will scan for .env
            files.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="path">Project Path</Label>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                id="path"
                value={path}
                onChange={(e) => {
                  setPath(e.target.value);
                  setError(null);
                }}
                placeholder="/path/to/your/project"
                className="flex-1 font-mono text-sm"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleBrowse}
                disabled={isLoading}
                title="Browse folders"
              >
                <FolderOpen className="size-4" />
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex items-center gap-3">
              <IconPicker
                icon={icon}
                color={iconColor}
                onIconChange={setIcon}
                onColorChange={setIconColor}
                disabled={isLoading}
              />
              {path && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {path.split("/").filter(Boolean).pop() || "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Project name (from folder)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Kbd size="sm">Enter</Kbd>
            <span>to add</span>
            <span className="mx-1">·</span>
            <Kbd size="sm">Esc</Kbd>
            <span>to cancel</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading || !path.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Project"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
