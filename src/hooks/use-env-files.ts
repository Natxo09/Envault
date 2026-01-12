import { useState, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";

export interface EnvFile {
  name: string;
  path: string;
  is_active: boolean;
  modified_at: string | null;
}

export function useEnvFiles() {
  const [envFiles, setEnvFiles] = useState<EnvFile[]>([]);
  const [selectedEnvFile, setSelectedEnvFile] = useState<EnvFile | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref to track currently selected file path (avoids re-loading the same file)
  const selectedPathRef = useRef<string | null>(null);

  const scanEnvFiles = useCallback(
    async (projectPath: string, activeEnv?: string | null) => {
      setIsLoading(true);
      setError(null);
      selectedPathRef.current = null;
      setSelectedEnvFile(null);
      setFileContent(null);

      try {
        const files = await invoke<EnvFile[]>("scan_env_files", {
          projectPath,
          activeEnv: activeEnv ?? null,
        });
        setEnvFiles(files);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setEnvFiles([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const selectEnvFile = useCallback(async (file: EnvFile | null) => {
    // Skip if selecting the same file (prevents flickering on repeated Enter)
    if (file && selectedPathRef.current === file.path) {
      return;
    }

    const hadPreviousContent = selectedPathRef.current !== null;
    selectedPathRef.current = file?.path ?? null;
    setSelectedEnvFile(file);

    if (!file) {
      setFileContent(null);
      return;
    }

    // Only show loading skeleton on first load, not when switching files
    // This keeps the previous content visible for a smoother transition
    if (!hadPreviousContent) {
      setIsLoadingContent(true);
    }

    try {
      const content = await invoke<string>("read_env_file", {
        filePath: file.path,
      });
      setFileContent(content);
    } catch (err) {
      setFileContent(null);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoadingContent(false);
    }
  }, []);

  const activateEnvFile = useCallback(
    async (projectId: number, envName: string) => {
      try {
        await invoke("activate_env", { projectId, envName });
        // Update local state to reflect activation
        setEnvFiles((prev) =>
          prev.map((f) => ({
            ...f,
            is_active: f.name === envName,
          }))
        );
        // Update selected file if it's the one being activated
        setSelectedEnvFile((prev) =>
          prev ? { ...prev, is_active: prev.name === envName } : null
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        throw err;
      }
    },
    []
  );

  const clearSelection = useCallback(() => {
    selectedPathRef.current = null;
    setSelectedEnvFile(null);
    setFileContent(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    envFiles,
    selectedEnvFile,
    fileContent,
    isLoading,
    isLoadingContent,
    error,
    scanEnvFiles,
    selectEnvFile,
    activateEnvFile,
    clearSelection,
    clearError,
  };
}
