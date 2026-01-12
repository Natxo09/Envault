import { FileText, Circle, CheckCircle2, RefreshCw, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Kbd } from "@/components/ui/kbd";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import type { EnvFile } from "@/hooks/use-env-files";

interface EnvFilesListProps {
  files: EnvFile[];
  selectedFile: EnvFile | null;
  focusedIndex: number;
  isLoading: boolean;
  isRefreshing: boolean;
  isActive: boolean;
  onSelect: (file: EnvFile, index: number) => void;
  onActivate: (index: number) => void;
  onRefresh: () => void;
}

// Helper to check if file is the main .env (not activatable)
function isMainEnvFile(fileName: string): boolean {
  return fileName === ".env";
}

// Helper to check if file can be activated
function canActivate(file: EnvFile): boolean {
  return !isMainEnvFile(file.name) && !file.is_active;
}

export function EnvFilesList({
  files,
  selectedFile,
  focusedIndex,
  isLoading,
  isRefreshing,
  isActive,
  onSelect,
  onActivate,
  onRefresh,
}: EnvFilesListProps) {
  if (isLoading) {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Environment Files
          </span>
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="size-10 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground mb-1">
          No .env files found
        </p>
        <p className="text-xs text-muted-foreground/70">
          Create a .env file in your project directory
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Environment Files
        </span>
        <div className="flex items-center gap-2">
          {isActive && (
            <span className="flex items-center gap-0.5">
              <Kbd size="sm">↑↓</Kbd>
              <Kbd size="sm">⏎</Kbd>
              <Kbd size="sm">A</Kbd>
              <Kbd size="sm">Tab</Kbd>
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh (⌘R)"
          >
            <RefreshCw className={cn("size-3", isRefreshing && "animate-spin")} />
          </Button>
        </div>
      </div>
      {files.map((file, index) => {
        const isMainEnv = isMainEnvFile(file.name);
        const isActivatable = canActivate(file);
        const isFocused = isActive && index === focusedIndex;
        const isSelected = selectedFile?.path === file.path;

        return (
          <ContextMenu key={file.path}>
            <ContextMenuTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left outline-none",
                  "hover:bg-accent",
                  isSelected && "bg-accent",
                  isFocused && "bg-accent ring-2 ring-primary ring-inset"
                )}
                onClick={() => onSelect(file, index)}
              >
                {isMainEnv ? (
                  <Lock className="size-4 text-muted-foreground shrink-0" />
                ) : file.is_active ? (
                  <CheckCircle2 className="size-4 text-green-500 shrink-0" />
                ) : (
                  <Circle className="size-4 text-muted-foreground shrink-0" />
                )}
                <span className="flex-1 truncate">{file.name}</span>
                {isMainEnv ? (
                  <span className="text-xs text-muted-foreground">
                    current
                  </span>
                ) : file.is_active ? (
                  <span className="text-xs text-green-600 dark:text-green-400">
                    active
                  </span>
                ) : null}
              </button>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => onSelect(file, index)}>
                <FileText className="size-4 mr-2" />
                View Contents
              </ContextMenuItem>
              {isActivatable && (
                <>
                  <ContextMenuSeparator />
                  <ContextMenuItem onClick={() => onActivate(index)}>
                    <CheckCircle2 className="size-4 mr-2" />
                    Activate
                  </ContextMenuItem>
                </>
              )}
            </ContextMenuContent>
          </ContextMenu>
        );
      })}
    </div>
  );
}
