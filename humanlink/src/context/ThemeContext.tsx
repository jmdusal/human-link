import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

export type Theme = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

const STORAGE_KEY = 'theme';

type ThemeContextValue = {
    theme: Theme;
    resolvedTheme: ResolvedTheme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function readStoredTheme(): Theme {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light' || stored === 'system') {
        return stored;
    }
    return 'light';
}

function applyThemeClass(resolved: ResolvedTheme) {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolved);
    root.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => readStoredTheme());
    const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
        const initial = readStoredTheme();
        return initial === 'system' ? getSystemTheme() : initial;
    });

    const setTheme = useCallback((next: Theme) => {
        setThemeState(next);
        localStorage.setItem(STORAGE_KEY, next);
    }, []);

    const toggleTheme = useCallback(() => {
        setThemeState((prev) => {
            const current = prev === 'system' ? getSystemTheme() : prev;
            const next: Theme = current === 'dark' ? 'light' : 'dark';
            localStorage.setItem(STORAGE_KEY, next);
            return next;
        });
    }, []);

    useEffect(() => {
        const resolved = theme === 'system' ? getSystemTheme() : theme;
        applyThemeClass(resolved);
        setResolvedTheme(resolved);

        if (theme !== 'system') return;

        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = () => {
            const next = getSystemTheme();
            applyThemeClass(next);
            setResolvedTheme(next);
        };

        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
    }, [theme]);

    const value = useMemo(
        () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
        [theme, resolvedTheme, setTheme, toggleTheme],
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
};
