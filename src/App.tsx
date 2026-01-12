import { useState } from "react";
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
import { getIconById } from "@/components/ui/icon-picker";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useProjects, type Project, type UpdateProjectParams, type AddProjectParams } from "@/hooks/use-projects";
import { SettingsDialog } from "@/components/settings/settings-dialog";
import { AddProjectDialog } from "@/components/projects/add-project-dialog";
import { EditProjectDialog } from "@/components/projects/edit-project-dialog";
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";
import { Kbd } from "@/components/ui/kbd";
import { getShortcuts, formatShortcut, type Shortcut } from "@/lib/shortcuts";

function AppSidebar({
  projects,
  selectedProject,
  isLoading,
  shortcuts,
  onProjectSelect,
  onProjectEdit,
  onProjectDelete,
  onSettingsOpen,
  onAddProject,
}: {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  shortcuts: Record<string, Shortcut>;
  onProjectSelect: (project: Project) => void;
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
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
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
                projects.map((project) => {
                  const ProjectIcon = getIconById(project.icon);
                  return (
                    <ContextMenu key={project.id}>
                      <ContextMenuTrigger asChild>
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            isActive={selectedProject?.id === project.id}
                            onClick={() => onProjectSelect(project)}
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
  const { toggleSidebar } = useSidebar();
  const shortcuts = getShortcuts();

  const {
    projects,
    selectedProject,
    setSelectedProject,
    isLoading,
    addProject,
    deleteProject,
    updateProject,
  } = useProjects();

  // Keyboard shortcuts
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
        onProjectSelect={setSelectedProject}
        onProjectEdit={handleEditProject}
        onProjectDelete={handleDeleteProject}
        onSettingsOpen={() => setSettingsOpen(true)}
        onAddProject={() => setAddProjectOpen(true)}
      />
      {/* Top frame area - drag region with project indicator and add button */}
      <div
        data-tauri-drag-region
        className="absolute top-0 right-2 h-8 flex items-center justify-center px-3 z-10 transition-[left] duration-150 ease-linear peer-data-[state=expanded]:left-[calc(var(--sidebar-width)+0.5rem)] peer-data-[state=collapsed]:left-[calc(var(--sidebar-width-icon)+1rem)]"
      >
        {selectedProject ? (
          <div data-tauri-drag-region className="flex items-center gap-1.5 text-sm pointer-events-none">
            {(() => {
              const Icon = getIconById(selectedProject.icon);
              return <Icon className="size-3.5" style={{ color: selectedProject.icon_color }} />;
            })()}
            <span className="text-muted-foreground">{selectedProject.name}</span>
          </div>
        ) : null}
        <div data-tauri-drag-region className="absolute right-3 top-1/2 -translate-y-1/2">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setAddProjectOpen(true)}
            title="Add Project (⌘N)"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>
      <SidebarInset className="md:peer-data-[variant=inset]:mt-8">
        <main className="flex-1 flex items-center justify-center p-4">
          {selectedProject ? (
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">
                {selectedProject.name}
              </h2>
              <p className="text-sm text-muted-foreground font-mono">
                {selectedProject.path}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-muted-foreground">
                Select a project to manage environments
              </p>
            </div>
          )}
        </main>
      </SidebarInset>

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
    </SidebarProvider>
  );
}

export default App;
