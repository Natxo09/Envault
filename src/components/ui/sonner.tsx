import { useTheme } from "@/hooks/use-theme";
import { Toaster as Sonner, toast as sonnerToast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const PREFERENCES_KEY = "envault-preferences";

function isToastsEnabled(): boolean {
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (stored) {
      const prefs = JSON.parse(stored);
      return prefs.toastsEnabled !== false;
    }
  } catch {
    // Ignore parse errors
  }
  return true; // Default to enabled
}

// Wrapper around toast that respects user preferences
const toast = {
  success: (message: string, options?: Parameters<typeof sonnerToast.success>[1]) => {
    if (isToastsEnabled()) {
      return sonnerToast.success(message, options);
    }
  },
  error: (message: string, options?: Parameters<typeof sonnerToast.error>[1]) => {
    if (isToastsEnabled()) {
      return sonnerToast.error(message, options);
    }
  },
  info: (message: string, options?: Parameters<typeof sonnerToast.info>[1]) => {
    if (isToastsEnabled()) {
      return sonnerToast.info(message, options);
    }
  },
  warning: (message: string, options?: Parameters<typeof sonnerToast.warning>[1]) => {
    if (isToastsEnabled()) {
      return sonnerToast.warning(message, options);
    }
  },
};

function Toaster({ ...props }: ToasterProps) {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme === "system" ? undefined : theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}

export { Toaster, toast };
