import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

export const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
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
  const [isDarkMode, setIsDarkMode] = useState(initialDarkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const setTheme = (themeName) => {
    localStorage.setItem("theme", themeName);
    if (themeName == "light") {
      setIsDarkMode(false);
    } else if (themeName == "dark") {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(isSystemDark);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export { ThemeProvider };
