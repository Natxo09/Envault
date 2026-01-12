import { FolderOpen } from "lucide-react";
import { EnvFilesList } from "./env-files-list";
import { EnvFileViewer } from "./env-file-viewer";
import { toast } from "@/components/ui/sonner";
import type { Project } from "@/hooks/use-projects";
import type { EnvFile } from "@/hooks/use-env-files";

interface EnvFilesPanelProps {
  project: Project;
  envFiles: EnvFile[];
  selectedEnvFile: EnvFile | null;
  fileContent: string | null;
  isLoading: boolean;
  isLoadingContent: boolean;
  error: string | null;
  focusedIndex: number;
  isActive: boolean;
  onSelect: (file: EnvFile) => void;
  onActivate: (index: number) => void;
  onRefresh: () => void;
  onCloseViewer: () => void;
  onClearError: () => void;
  onProjectUpdate?: () => void;
}

export function EnvFilesPanel({
  project,
  envFiles,
  selectedEnvFile,
  fileContent,
  isLoading,
  isLoadingContent,
  error,
  focusedIndex,
  isActive,
  onSelect,
  onActivate,
  onRefresh,
  onCloseViewer,
  onClearError,
}: EnvFilesPanelProps) {
  // Scan on project change is handled by parent now via useEnvFiles

  const handleActivate = async (index: number) => {
    const file = envFiles[index];
    if (file && file.name !== ".env" && !file.is_active) {
      onActivate(index);
      toast.success("Environment activated", {
        description: `${file.name} is now active`,
      });
    }
  };

  const handleRefresh = () => {
    onRefresh();
    toast.success("Environment files refreshed");
  };

  const handleCopy = () => {
    toast.success("Copied to clipboard");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Project Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b">
        <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
          <FolderOpen className="size-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold truncate">{project.name}</h2>
          <p className="text-xs text-muted-foreground truncate">{project.path}</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
          <button
            className="text-xs text-destructive/70 hover:text-destructive mt-1"
            onClick={onClearError}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Env Files List */}
      <div className="mb-4">
        <EnvFilesList
          files={envFiles}
          selectedFile={selectedEnvFile}
          focusedIndex={focusedIndex}
          isLoading={isLoading}
          isActive={isActive}
          onSelect={onSelect}
          onActivate={handleActivate}
          onRefresh={handleRefresh}
        />
      </div>

      {/* File Viewer */}
      <EnvFileViewer
        file={selectedEnvFile}
        content={fileContent}
        isLoading={isLoadingContent}
        onClose={onCloseViewer}
        onCopy={handleCopy}
      />
    </div>
  );
}
