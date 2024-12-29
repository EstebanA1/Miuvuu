import React, { createContext, useContext, useState, useEffect } from "react";

// Crear el contexto
export const ThemeContext = createContext();

// Proveedor de tema
export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Leer el tema almacenado en localStorage al cargar
        const storedTheme = localStorage.getItem("theme");
        if (storedTheme === "dark") {
            setIsDarkMode(true);
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }, []);

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);

        if (newMode) {
            document.body.classList.add("dark-mode");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("theme", "light");
        }
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Hook personalizado para usar el contexto
export const useTheme = () => {
    return useContext(ThemeContext);
};
