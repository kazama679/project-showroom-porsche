"use client";

import { Search, Bell, User, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from '@/i18n/navigation';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleDarkMode = () => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <header className="border-b border-light-gray-surface dark:border-dark-surface bg-white dark:bg-black sticky top-0 z-30">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Title */}
        <div>
          <h1 className="text-porsche-subheading text-near-black dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-mid-gray dark:text-light-gray-surface mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-surface rounded transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun size={18} className="text-light-gray-surface" />
            ) : (
              <Moon size={18} className="text-dark-gray" />
            )}
          </button>

          {/* Notifications */}
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-dark-surface rounded transition-colors relative">
            <Bell size={18} className="text-dark-gray dark:text-light-gray-surface" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-red rounded-full" />
          </button>

          {/* User Menu */}
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-dark-surface rounded transition-colors">
            <User size={18} className="text-dark-gray dark:text-light-gray-surface" />
          </button>
        </div>
      </div>
    </header>
  );
}
