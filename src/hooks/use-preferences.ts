import { useState, useEffect, useCallback } from "react";

interface Preferences {
  toastsEnabled: boolean;
}

const PREFERENCES_STORAGE_KEY = "envault-preferences";

const DEFAULT_PREFERENCES: Preferences = {
  toastsEnabled: true,
};

function getStoredPreferences(): Preferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;

  const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
  if (stored) {
    try {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }
  return DEFAULT_PREFERENCES;
}

function savePreferences(preferences: Preferences): void {
  localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
}

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(getStoredPreferences);

  // Sync with localStorage on mount
  useEffect(() => {
    setPreferences(getStoredPreferences());
  }, []);

  const setToastsEnabled = useCallback((enabled: boolean) => {
    setPreferences((prev) => {
      const newPrefs = { ...prev, toastsEnabled: enabled };
      savePreferences(newPrefs);
      return newPrefs;
    });
  }, []);

  return {
    toastsEnabled: preferences.toastsEnabled,
    setToastsEnabled,
  };
}
