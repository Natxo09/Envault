import { useState, useEffect, useRef } from "react";
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
import { Loader2 } from "lucide-react";
import type { Project, UpdateProjectParams } from "@/hooks/use-projects";

interface EditProjectDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (params: UpdateProjectParams) => Promise<void>;
}

export function EditProjectDialog({
  project,
  open: isOpen,
  onOpenChange,
  onSave,
}: EditProjectDialogProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("folder");
  const [iconColor, setIconColor] = useState("#737373");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset form when dialog opens with a project
  useEffect(() => {
    if (isOpen && project) {
      setName(project.name);
      setIcon(project.icon);
      setIconColor(project.icon_color);
      setError(null);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, project]);

  const handleSubmit = async () => {
    if (!project) return;

    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSave({
        id: project.id,
        name: name.trim(),
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
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update the project name and icon.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
              <div className="flex-1 min-w-0">
                <Input
                  ref={inputRef}
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError(null);
                  }}
                  placeholder="Project name"
                  disabled={isLoading}
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="rounded-md bg-muted p-3">
            <p className="text-xs text-muted-foreground mb-1">Path</p>
            <p className="text-sm font-mono truncate">{project?.path}</p>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Kbd size="sm">Enter</Kbd>
            <span>to save</span>
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
            <Button onClick={handleSubmit} disabled={isLoading || !name.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
