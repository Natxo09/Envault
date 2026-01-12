import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

export interface Project {
  id: number;
  name: string;
  path: string;
  icon: string;
  icon_color: string;
  active_environment: string | null;
  created_at: string;
  updated_at: string;
}

export interface AddProjectParams {
  path: string;
  icon?: string;
  icon_color?: string;
}

export interface UpdateProjectParams {
  id: number;
  name?: string;
  icon?: string;
  icon_color?: string;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await invoke<Project[]>("list_projects");
      setProjects(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const addProject = useCallback(async (params: AddProjectParams): Promise<Project> => {
    const project = await invoke<Project>("add_project", { params });
    setProjects((prev) => [project, ...prev]);
    return project;
  }, []);

  const deleteProject = useCallback(async (id: number): Promise<void> => {
    await invoke("delete_project", { id });
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (selectedProject?.id === id) {
      setSelectedProject(null);
    }
  }, [selectedProject]);

  const updateProject = useCallback(async (params: UpdateProjectParams): Promise<Project> => {
    const updated = await invoke<Project>("update_project", { params });
    setProjects((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    if (selectedProject?.id === updated.id) {
      setSelectedProject(updated);
    }
    return updated;
  }, [selectedProject]);

  return {
    projects,
    selectedProject,
    setSelectedProject,
    isLoading,
    error,
    addProject,
    deleteProject,
    updateProject,
    refetch: fetchProjects,
  };
}
