import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

export const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const areThemesSupported =
    window.CSS &&
    window.CSS.supports &&
    window.CSS.supports("color", "var(--fake-var)");
  const savedTheme = localStorage.getItem("theme");
  const isSystemDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  let initialDarkMode = isSystemDark;
  if (savedTheme == "dark") {
    initialDarkMode = true;
  } else if (savedTheme == "light") {
    initialDarkMode = false;
  }
  const [currentTheme, setCurrentTheme] = useState(savedTheme || "system");
  const [isDarkMode, setIsDarkMode] = useState(
    areThemesSupported ? initialDarkMode : false
  );

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const setTheme = (themeName) => {
    if (!areThemesSupported) throw new Error("Themes are not supported");
    localStorage.setItem("theme", themeName);
    setCurrentTheme(themeName);
    if (themeName == "light") {
      setIsDarkMode(false);
    } else if (themeName == "dark") {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(isSystemDark);
    }
  };

  return (
    <ThemeContext.Provider
      value={{ currentTheme, setTheme, areThemesSupported }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export { ThemeProvider };
