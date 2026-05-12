"use client";

import { Search, Bell, User, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/language-context";
import Link from "next/link";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { t } = useLanguage();
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
    <header className="border-b border-[#D2D2D2] dark:border-[#303030] bg-white dark:bg-[#000000] sticky top-0 z-30">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Title */}
        <div>
          <h1 className="text-ferrari-subheading text-[#181818] dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-[#8F8F8F] dark:text-[#D2D2D2] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#303030] rounded transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun size={18} className="text-[#D2D2D2]" />
            ) : (
              <Moon size={18} className="text-[#666666]" />
            )}
          </button>

          {/* Notifications */}
          <button className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#303030] rounded transition-colors relative">
            <Bell size={18} className="text-[#666666] dark:text-[#D2D2D2]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#DA291C] rounded-full" />
          </button>

          {/* User Menu */}
          <button className="p-2 hover:bg-[#F5F5F5] dark:hover:bg-[#303030] rounded transition-colors">
            <User size={18} className="text-[#666666] dark:text-[#D2D2D2]" />
          </button>
        </div>
      </div>
    </header>
  );
}
