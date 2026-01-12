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
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Folder, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { SettingsDialog } from "@/components/settings/settings-dialog";

function AppSidebar({ onSettingsOpen }: { onSettingsOpen: () => void }) {
  return (
    <Sidebar variant="inset">
      {/* Drag region for macOS traffic lights - empty space */}
      <div data-tauri-drag-region className="h-10 w-full shrink-0" />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Folder className="size-4" />
                  <span>Example Project</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Plus className="size-4" />
              <span>Add Project</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onSettingsOpen}>
              <Settings className="size-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function App() {
  const { resolvedTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: ",",
      metaKey: true,
      handler: () => setSettingsOpen(true),
    },
    {
      key: "Escape",
      handler: () => setSettingsOpen(false),
    },
  ]);

  return (
    <SidebarProvider
      defaultOpen={true}
      className={`${resolvedTheme} h-screen overflow-hidden`}
      style={{
        "--sidebar-width": "16rem",
      } as React.CSSProperties}
    >
      <AppSidebar onSettingsOpen={() => setSettingsOpen(true)} />
      {/* Top frame area - drag region with add button */}
      <div
        data-tauri-drag-region
        className="absolute top-0 right-2 left-[calc(var(--sidebar-width)+0.5rem)] h-8 flex items-center justify-end px-3 z-10"
      >
        <Button variant="ghost" size="icon" className="size-7">
          <Plus className="size-4" />
        </Button>
      </div>
      <SidebarInset className="md:peer-data-[variant=inset]:mt-8">
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-muted-foreground">
              Select a project to manage environments
            </p>
          </div>
        </main>
      </SidebarInset>

      {/* Settings Dialog */}
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </SidebarProvider>
  );
}

export default App;
