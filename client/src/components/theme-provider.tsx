import { ThemeProvider as NextThemesProvider } from 'next-themes';

type ThemeProviderProps = {
    children: React.ReactNode;
    defaultTheme?: string;
    storageKey?: string;
};

export function ThemeProvider({
    children,
    defaultTheme = 'dark',
    storageKey = 'kanban-theme',
    ...props
}: ThemeProviderProps) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme={defaultTheme}
            enableSystem
            disableTransitionOnChange
            storageKey={storageKey}
            {...props}
        >
            {children}
        </NextThemesProvider>
    );
}
