import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Kbd } from "@/components/ui/kbd";
import { Loader2 } from "lucide-react";
import type { Project } from "@/hooks/use-projects";

interface DeleteProjectDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (project: Project) => Promise<void>;
}

export function DeleteProjectDialog({
  project,
  open: isOpen,
  onOpenChange,
  onConfirm,
}: DeleteProjectDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Reset loading state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!project) return;

    setIsLoading(true);
    try {
      await onConfirm(project);
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to delete project:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      e.preventDefault();
      handleConfirm();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent onKeyDown={handleKeyDown}>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove project?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                Are you sure you want to remove{" "}
                <span className="font-semibold text-foreground">
                  {project?.name}
                </span>{" "}
                from Envault?
              </p>
              <p className="text-xs">
                The project folder and its files will not be deleted from your
                disk.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center justify-between sm:justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Kbd size="sm">Enter</Kbd>
            <span>to confirm</span>
            <span className="mx-1">·</span>
            <Kbd size="sm">Esc</Kbd>
            <span>to cancel</span>
          </div>
          <div className="flex gap-2">
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
