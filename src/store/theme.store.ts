import { create } from 'zustand';
import { getString, setString } from '../lib/storage';

const STORAGE_KEY = 'emprende_plus_theme';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  isLoaded: boolean;
  loadTheme: () => Promise<void>;
  setTheme: (theme: Theme) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  isLoaded: false,

  loadTheme: async () => {
    const saved = await getString(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      set({ theme: saved, isLoaded: true });
    } else {
      set({ isLoaded: true });
    }
  },

  setTheme: async (theme: Theme) => {
    await setString(STORAGE_KEY, theme);
    set({ theme });
  },

  toggleTheme: async () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    await setString(STORAGE_KEY, next);
    set({ theme: next });
  },
}));
