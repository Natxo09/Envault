import { useState, useCallback, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSkeleton,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Settings, Plus, Pencil, Trash2 } from "lucide-react";
import { Toaster, toast } from "@/components/ui/sonner";
import { getIconById } from "@/components/ui/icon-picker";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useProjects, type Project, type UpdateProjectParams, type AddProjectParams } from "@/hooks/use-projects";
import { useFocusManager } from "@/hooks/use-focus-manager";
import { useEnvFiles, type EnvFile } from "@/hooks/use-env-files";
import { SettingsDialog } from "@/components/settings/settings-dialog";
import { AddProjectDialog } from "@/components/projects/add-project-dialog";
import { EditProjectDialog } from "@/components/projects/edit-project-dialog";
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";
import { FloatingProjects } from "@/components/projects/floating-projects";
import { EnvFilesPanel } from "@/components/env-files";
import { Kbd } from "@/components/ui/kbd";
import { getShortcuts, formatShortcut, type Shortcut } from "@/lib/shortcuts";
import { cn } from "@/lib/utils";

function AppSidebar({
  projects,
  selectedProject,
  isLoading,
  shortcuts,
  focusedIndex,
  isActive,
  onProjectClick,
  onProjectEdit,
  onProjectDelete,
  onSettingsOpen,
  onAddProject,
}: {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  shortcuts: Record<string, Shortcut>;
  focusedIndex: number;
  isActive: boolean;
  onProjectClick: (project: Project, index: number) => void;
  onProjectEdit: (project: Project) => void;
  onProjectDelete: (project: Project) => void;
  onSettingsOpen: () => void;
  onAddProject: () => void;
}) {
  return (
    <Sidebar variant="inset">
      {/* Drag region for macOS traffic lights - empty space */}
      <div data-tauri-drag-region className="h-10 w-full shrink-0" />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>Projects</span>
            {isActive && (
              <span className="flex items-center gap-0.5 font-normal">
                <Kbd size="sm">↑↓</Kbd>
                <Kbd size="sm">⏎</Kbd>
                <Kbd size="sm">Tab</Kbd>
              </span>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <>
                  <SidebarMenuSkeleton />
                  <SidebarMenuSkeleton />
                  <SidebarMenuSkeleton />
                </>
              ) : projects.length === 0 ? (
                <div className="px-2 py-4 text-center">
                  <p className="text-xs text-muted-foreground mb-2">
                    No projects yet
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={onAddProject}
                  >
                    <Plus className="size-4 mr-1" />
                    Add Project
                  </Button>
                </div>
              ) : (
                projects.map((project, index) => {
                  const ProjectIcon = getIconById(project.icon);
                  const isFocused = isActive && index === focusedIndex;
                  const isSelected = selectedProject?.id === project.id;
                  return (
                    <ContextMenu key={project.id}>
                      <ContextMenuTrigger asChild>
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            isActive={isSelected}
                            onClick={() => onProjectClick(project, index)}
                            className={cn(
                              isFocused && "bg-accent ring-2 ring-primary ring-inset"
                            )}
                          >
                            <ProjectIcon
                              className="size-4"
                              style={{ color: project.icon_color }}
                            />
                            <span>{project.name}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem onClick={() => onProjectEdit(project)}>
                          <Pencil className="size-4 mr-2" />
                          Edit
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem
                          onClick={() => onProjectDelete(project)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="size-4 mr-2" />
                          Remove
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  );
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onAddProject}>
              <Plus className="size-4" />
              <span className="flex-1">Add Project</span>
              <span className="flex items-center gap-0.5 text-muted-foreground">
                {formatShortcut(shortcuts.addProject).map((key, i) => (
                  <Kbd key={i} size="sm">{key}</Kbd>
                ))}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onSettingsOpen}>
              <Settings className="size-4" />
              <span className="flex-1">Settings</span>
              <span className="flex items-center gap-0.5 text-muted-foreground">
                {formatShortcut(shortcuts.openSettings).map((key, i) => (
                  <Kbd key={i} size="sm">{key}</Kbd>
                ))}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function AppContent() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const { toggleSidebar, state: sidebarState, isMobile, setOpen } = useSidebar();
  const shortcuts = getShortcuts();

  const {
    projects,
    selectedProject,
    setSelectedProject,
    isLoading,
    addProject,
    deleteProject,
    updateProject,
    refetch: refreshProjects,
  } = useProjects();

  const {
    envFiles,
    selectedEnvFile,
    fileContent,
    isLoading: isLoadingEnvFiles,
    isRefreshing,
    isLoadingContent,
    error: envError,
    scanEnvFiles,
    refreshEnvFiles,
    selectEnvFile,
    activateEnvFile,
    clearSelection,
    clearError,
  } = useEnvFiles();

  // Scan env files when selected project changes (not when active_environment changes)
  useEffect(() => {
    if (selectedProject) {
      scanEnvFiles(selectedProject.path, selectedProject.active_environment);
    }
  }, [selectedProject?.id, selectedProject?.path, scanEnvFiles]);

  // Auto-collapse sidebar when window is small (mobile breakpoint)
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [isMobile, setOpen]);

  // Check if any dialog is open
  const isDialogOpen = settingsOpen || addProjectOpen || editProjectOpen || deleteProjectOpen;

  // Focus manager callbacks
  const handleSidebarSelect = useCallback((index: number) => {
    if (projects[index]) {
      setSelectedProject(projects[index]);
    }
  }, [projects, setSelectedProject]);

  const handleSidebarEdit = useCallback((index: number) => {
    if (projects[index]) {
      setProjectToEdit(projects[index]);
      setEditProjectOpen(true);
    }
  }, [projects]);

  const handleSidebarDelete = useCallback((index: number) => {
    if (projects[index]) {
      setProjectToDelete(projects[index]);
      setDeleteProjectOpen(true);
    }
  }, [projects]);

  const handleEnvListSelect = useCallback((index: number) => {
    if (envFiles[index]) {
      selectEnvFile(envFiles[index]);
    }
  }, [envFiles, selectEnvFile]);

  const handleEnvListActivate = useCallback(async (index: number) => {
    const file = envFiles[index];
    if (file && selectedProject && file.name !== ".env" && !file.is_active) {
      try {
        await activateEnvFile(selectedProject.id, file.name);
        // Update selectedProject locally (optimistic) - no need for full refresh
        setSelectedProject({
          ...selectedProject,
          active_environment: file.name,
        });
      } catch (err) {
        console.error("Failed to activate:", err);
      }
    }
  }, [envFiles, selectedProject, activateEnvFile, setSelectedProject]);

  const handleEnvListRefresh = useCallback(() => {
    if (selectedProject && !isRefreshing) {
      refreshEnvFiles(selectedProject.path, selectedProject.active_environment);
      toast.success("Refreshing environment files");
    }
  }, [selectedProject, isRefreshing, refreshEnvFiles]);

  const handleEnvListCopy = useCallback(async () => {
    if (fileContent) {
      try {
        await navigator.clipboard.writeText(fileContent);
        toast.success("Copied to clipboard");
      } catch (err) {
        console.error("Failed to copy:", err);
        toast.error("Failed to copy");
      }
    }
  }, [fileContent]);

  const { activeZone, sidebarIndex, envListIndex, navigationTrigger, setSidebarIndex, setEnvListIndex } = useFocusManager({
    sidebarItemCount: projects.length,
    envListItemCount: envFiles.length,
    onSidebarSelect: handleSidebarSelect,
    onSidebarEdit: handleSidebarEdit,
    onSidebarDelete: handleSidebarDelete,
    onEnvListSelect: handleEnvListSelect,
    onEnvListActivate: handleEnvListActivate,
    onEnvListRefresh: handleEnvListRefresh,
    onEnvListCopy: handleEnvListCopy,
    enabled: !isDialogOpen,
  });

  const handleProjectClick = useCallback((project: Project, index: number) => {
    setSelectedProject(project);
    setSidebarIndex(index);
  }, [setSelectedProject, setSidebarIndex]);

  const handleEnvFileClick = useCallback((file: EnvFile, index: number) => {
    selectEnvFile(file);
    setEnvListIndex(index);
  }, [selectEnvFile, setEnvListIndex]);

  // App-level keyboard shortcuts (these work even with focus manager)
  useKeyboardShortcuts([
    {
      key: shortcuts.openSettings.key,
      metaKey: shortcuts.openSettings.metaKey,
      ctrlKey: shortcuts.openSettings.ctrlKey,
      shiftKey: shortcuts.openSettings.shiftKey,
      altKey: shortcuts.openSettings.altKey,
      handler: () => setSettingsOpen(true),
    },
    {
      key: shortcuts.toggleSidebar.key,
      metaKey: shortcuts.toggleSidebar.metaKey,
      ctrlKey: shortcuts.toggleSidebar.ctrlKey,
      shiftKey: shortcuts.toggleSidebar.shiftKey,
      altKey: shortcuts.toggleSidebar.altKey,
      handler: () => toggleSidebar(),
    },
    {
      key: shortcuts.addProject.key,
      metaKey: shortcuts.addProject.metaKey,
      ctrlKey: shortcuts.addProject.ctrlKey,
      shiftKey: shortcuts.addProject.shiftKey,
      altKey: shortcuts.addProject.altKey,
      handler: () => setAddProjectOpen(true),
    },
    {
      key: "Escape",
      handler: () => {
        if (deleteProjectOpen) setDeleteProjectOpen(false);
        else if (editProjectOpen) setEditProjectOpen(false);
        else if (addProjectOpen) setAddProjectOpen(false);
        else if (settingsOpen) setSettingsOpen(false);
      },
    },
  ]);

  const handleAddProject = async (params: AddProjectParams) => {
    const project = await addProject(params);
    setSelectedProject(project);
  };

  const handleEditProject = (project: Project) => {
    setProjectToEdit(project);
    setEditProjectOpen(true);
  };

  const handleSaveProject = async (params: UpdateProjectParams) => {
    await updateProject(params);
  };

  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setDeleteProjectOpen(true);
  };

  const handleConfirmDelete = async (project: Project) => {
    await deleteProject(project.id);
  };

  return (
    <>
      <AppSidebar
        projects={projects}
        selectedProject={selectedProject}
        isLoading={isLoading}
        shortcuts={shortcuts}
        focusedIndex={sidebarIndex}
        isActive={activeZone === "sidebar"}
        onProjectClick={handleProjectClick}
        onProjectEdit={handleEditProject}
        onProjectDelete={handleDeleteProject}
        onSettingsOpen={() => setSettingsOpen(true)}
        onAddProject={() => setAddProjectOpen(true)}
      />
      {/* Top frame area - drag region with project indicator */}
      <div
        data-tauri-drag-region
        className="absolute top-0 left-0 right-0 h-8 flex items-center justify-center px-3 z-10"
      >
        <div data-tauri-drag-region className="flex items-center gap-1.5 text-sm pointer-events-none">
          {selectedProject ? (
            <>
              {(() => {
                const Icon = getIconById(selectedProject.icon);
                return <Icon className="size-3.5" style={{ color: selectedProject.icon_color }} />;
              })()}
              <span className="text-muted-foreground">{selectedProject.name}</span>
              {selectedProject.active_environment && (
                <>
                  <span className="text-muted-foreground/50">›</span>
                  <span className="text-muted-foreground/70">{selectedProject.active_environment}</span>
                </>
              )}
            </>
          ) : (
            <span className="text-muted-foreground font-medium">envault</span>
          )}
        </div>
      </div>
      <SidebarInset className="md:peer-data-[variant=inset]:mt-8 flex flex-col h-full">
        <main className="flex-1 p-4 overflow-y-auto min-h-0 scrollbar-thin">
          {selectedProject ? (
            <EnvFilesPanel
              project={selectedProject}
              envFiles={envFiles}
              selectedEnvFile={selectedEnvFile}
              fileContent={fileContent}
              isLoading={isLoadingEnvFiles}
              isRefreshing={isRefreshing}
              isLoadingContent={isLoadingContent}
              error={envError}
              focusedIndex={envListIndex}
              isActive={activeZone === "envList"}
              onSelect={handleEnvFileClick}
              onActivate={handleEnvListActivate}
              onRefresh={handleEnvListRefresh}
              onCloseViewer={clearSelection}
              onClearError={clearError}
              onProjectUpdate={refreshProjects}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">
                Select a project to manage environments
              </p>
            </div>
          )}
        </main>
      </SidebarInset>

      {/* Floating Projects (when sidebar is collapsed) */}
      <FloatingProjects
        projects={projects}
        selectedProject={selectedProject}
        focusedIndex={sidebarIndex}
        isActive={activeZone === "sidebar"}
        sidebarCollapsed={sidebarState === "collapsed"}
        navigationTrigger={navigationTrigger}
      />

      {/* Dialogs */}
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <AddProjectDialog
        open={addProjectOpen}
        onOpenChange={setAddProjectOpen}
        onAdd={handleAddProject}
      />
      <EditProjectDialog
        project={projectToEdit}
        open={editProjectOpen}
        onOpenChange={setEditProjectOpen}
        onSave={handleSaveProject}
      />
      <DeleteProjectDialog
        project={projectToDelete}
        open={deleteProjectOpen}
        onOpenChange={setDeleteProjectOpen}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

function App() {
  const { resolvedTheme } = useTheme();

  return (
    <SidebarProvider
      defaultOpen={true}
      className={`${resolvedTheme} h-screen overflow-hidden`}
      style={{
        "--sidebar-width": "16rem",
      } as React.CSSProperties}
    >
      <AppContent />
      <Toaster position="bottom-right" />
    </SidebarProvider>
  );
}

export default App;
