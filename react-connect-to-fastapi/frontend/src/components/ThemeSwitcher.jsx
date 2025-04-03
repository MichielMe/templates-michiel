import React, { useEffect, useState } from "react";

/**
 * ThemeSwitcher Component
 *
 * Allows switching between the 'nord' and 'dark' themes defined in App.css.
 * Automatically detects and applies system preferences using the 'prefersdark' attribute.
 * Stores user preference in localStorage.
 *
 * @returns {React.ReactElement} ThemeSwitcher component
 */
function ThemeSwitcher() {
  // Nord is the default theme based on App.css
  const [currentTheme, setCurrentTheme] = useState("nord");

  // Check system preference and localStorage on mount
  useEffect(() => {
    // Check for saved theme preference in localStorage
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      // Use saved theme if it exists
      setCurrentTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      // Otherwise use system preference or default
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const themeToUse = prefersDark ? "dark" : "nord";
      setCurrentTheme(themeToUse);
      document.documentElement.setAttribute("data-theme", themeToUse);
    }

    // Add listener for system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      // Only change theme based on system if no localStorage preference
      if (!localStorage.getItem("theme")) {
        const newTheme = e.matches ? "dark" : "nord";
        setCurrentTheme(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Toggle between nord and dark themes
  const toggleTheme = () => {
    const newTheme = currentTheme === "nord" ? "dark" : "nord";
    setCurrentTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Sun icon for light theme */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
        />
      </svg>

      {/* Toggle switch */}
      <input
        type="checkbox"
        className="toggle toggle-primary"
        checked={currentTheme === "dark"}
        onChange={toggleTheme}
        aria-label="Toggle theme"
      />

      {/* Moon icon for dark theme */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
        />
      </svg>
    </div>
  );
}

export default ThemeSwitcher;
