"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "theme";

function getPreferredTheme() {
  try {
    const savedTheme = window.localStorage.getItem(STORAGE_KEY);

    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme;
    }
  } catch {
    // Continue with the operating system preference when storage is unavailable.
  }

  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

function currentTheme() {
  if (typeof document === "undefined") {
    return "light";
  }

  return document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const preferredTheme = getPreferredTheme();

    document.documentElement.classList.toggle(
      "dark",
      preferredTheme === "dark"
    );

    setTheme(preferredTheme);
  }, []);

  const applyTheme = useCallback((nextTheme) => {
    if (nextTheme !== "dark" && nextTheme !== "light") {
      return;
    }

    document.documentElement.classList.toggle(
      "dark",
      nextTheme === "dark"
    );

    try {
      window.localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // The current page can still use the selected theme without storage.
    }

    setTheme(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme = currentTheme() === "dark" ? "light" : "dark";

    applyTheme(nextTheme);
  }, [applyTheme]);

  return {
    theme,
    toggleTheme,
    setTheme: applyTheme,
  };
}