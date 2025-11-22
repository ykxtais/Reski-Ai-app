import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@reski_theme';

const LIGHT_COLORS = {
  background: '#F4F7FB',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#0F172A',
  textMuted: '#64748B',
  border: '#E2E8F0',
  primary: '#0094D8',
  onPrimary: '#FFFFFF',
  accent: '#FF8C42',
  danger: '#EF4444',
  tabBar: '#FFFFFF',
  tabIconActive: '#0094D8',
  tabIconInactive: '#94A3B8',
};

const DARK_COLORS = {
  background: '#020617',
  surface: '#020617',
  card: '#020617',
  text: '#E5E7EB',
  textMuted: '#9CA3AF',
  border: '#1F2937',
  primary: '#38BDF8',
  onPrimary: '#020617',
  accent: '#FDBA74',
  danger: '#F97373',
  tabBar: '#020617',
  tabIconActive: '#38BDF8',
  tabIconInactive: '#6B7280',
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('light');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') {
          setMode(saved);
        } else {
          const system = Appearance.getColorScheme();
          setMode(system === 'dark' ? 'dark' : 'light');
        }
      } catch (e) {
        console.log('Erro ao carregar tema', e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const toggle = useCallback(async () => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const colors = mode === 'dark' ? DARK_COLORS : LIGHT_COLORS;

 const navTheme = useMemo(() => {
    const base = mode === 'dark' ? DarkTheme : DefaultTheme;

    return {
      ...base,
      dark: mode === 'dark',
      colors: {
        ...base.colors,
        background: colors.background,
        card: colors.card,
        text: colors.text,
        border: colors.border,
        primary: colors.primary,
        notification: colors.accent,
      },
    };
  }, [mode, colors]);

  const value = useMemo(
    () => ({
      mode,
      colors,
      toggle,
      navTheme,
      loaded,
    }),
    [mode, colors, toggle, navTheme, loaded],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('ThemeProvider ausente');
  return ctx;
}

export function useThemedStyles(factory) {
  const { colors, mode } = useTheme();
  return useMemo(
    () => factory({ colors, scheme: mode }),
    [colors, mode, factory],
  );
}

export default ThemeProvider;
