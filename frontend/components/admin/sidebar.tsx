"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { authService } from "@/lib/auth";
import {
  Menu,
  X,
  LayoutGrid,
  Car,
  Flag,
  Settings,
  Users,
  Calendar,
  MessageSquare,
  BookOpen,
  MapPin,
  Zap,
  Package,
  Image,
  ChevronRight,
  LogOut,
} from "lucide-react";

interface MenuItem {
  labelKey: string;
  href?: string;
  icon: any;
  exact?: boolean;
  submenu?: Array<{ labelKey: string; href: string }>;
}

const menuItemsConfig: MenuItem[] = [
  {
    labelKey: "admin.dashboard",
    href: "/admin",
    icon: LayoutGrid,
    exact: true,
  },
  {
    labelKey: "admin.inventory",
    icon: Package,
    submenu: [
      { labelKey: "admin.inventory", href: "/admin/cars" },
      { labelKey: "admin.brands", href: "/admin/brands" },
      { labelKey: "admin.body_design", href: "/admin/body-types" },
      { labelKey: "admin.series", href: "/admin/series" },
      { labelKey: "admin.models", href: "/admin/models" },
      { labelKey: "admin.options", href: "/admin/options" },
      { labelKey: "admin.option_groups_management", href: "/admin/option-groups" },
      { labelKey: "admin.option_items_management", href: "/admin/option-items" },
      { labelKey: "admin.car_model_options_management", href: "/admin/car-model-options" },
      { labelKey: "admin.option_rules_management", href: "/admin/option-rules" },
      { labelKey: "admin.media", href: "/admin/media" },
    ],
  },
  {
    labelKey: "admin.operations",
    icon: Calendar,
    submenu: [
      { labelKey: "admin.bookings", href: "/admin/bookings" },
      { labelKey: "admin.test_drives", href: "/admin/test-drives" },
      { labelKey: "admin.reviews", href: "/admin/reviews" },
    ],
  },
  {
    labelKey: "admin.users",
    href: "/admin/users",
    icon: Users,
  },
  {
    labelKey: "admin.content",
    icon: BookOpen,
    submenu: [
      { labelKey: "admin.blog", href: "/admin/blog" },
      { labelKey: "admin.showrooms", href: "/admin/showrooms" },
    ],
  },
  {
    labelKey: "admin.system",
    icon: Zap,
    submenu: [
      { labelKey: "admin.ailogs", href: "/admin/ailogs" },
      { labelKey: "admin.settings", href: "/admin/settings" },
    ],
  },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([
    "admin.dashboard",
  ]);
  const pathname = usePathname();
  const { t } = useLanguage();

  const toggleMenu = (labelKey: string) => {
    setExpandedMenus((prev) =>
      prev.includes(labelKey)
        ? prev.filter((item) => item !== labelKey)
        : [...prev, labelKey],
    );
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const NavItem = ({ item }: { item: MenuItem }) => {
    const hasSubmenu = "submenu" in item;
    const active = !hasSubmenu && !!item.href && isActive(item.href, item.exact);
    const Icon = item.icon;
    const label = t(item.labelKey);

    if (hasSubmenu) {
      const isExpanded = expandedMenus.includes(item.labelKey);
      const isAnySubmenuActive = item.submenu!.some((sub) =>
        isActive(sub.href),
      );

      return (
        <div>
          <button
            onClick={() => toggleMenu(item.labelKey)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-[2px] ${
              isAnySubmenuActive
                ? "bg-[#1A1A1A] text-[#DA291C]"
                : "text-[#D2D2D2] hover:text-white hover:bg-[#1A1A1A]"
            }`}
          >
            <Icon size={18} />
            <span className="flex-1 text-left">{label}</span>
            <ChevronRight
              size={16}
              className={`transition-transform ${
                isExpanded ? "rotate-90" : ""
              }`}
            />
          </button>
          {isExpanded && (
            <div className="pl-6 space-y-1 mt-1">
              {item.submenu!.map((subitem) => (
                <Link
                  key={subitem.href}
                  href={subitem.href}
                  className={`block px-4 py-2 text-xs font-medium transition-colors rounded-[2px] ${
                    isActive(subitem.href)
                      ? "bg-[#DA291C] text-white"
                      : "text-[#D2D2D2] hover:text-white hover:bg-[#1A1A1A]"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {t(subitem.labelKey)}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        href={item.href!}
        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-[2px] ${
          active
            ? "bg-[#DA291C] text-white"
            : "text-[#D2D2D2] hover:text-white hover:bg-[#1A1A1A]"
        }`}
        onClick={() => setIsOpen(false)}
      >
        <Icon size={18} />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 lg:hidden p-3 bg-[#DA291C] text-white rounded-full shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-black border-r border-[#303030] flex flex-col z-40 transition-transform lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-[#303030]">
          <h1 className="text-2xl font-bold text-[#DA291C]">PORSCHE</h1>
          <p className="text-xs text-[#8F8F8F] mt-1">Admin Portal</p>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-6 space-y-1 px-3 hide-scrollbar">
          {menuItemsConfig.map((item) => (
            <NavItem key={item.labelKey} item={item} />
          ))}
        </nav>

        {/* Language & Logout */}
        <div className="border-t border-[#303030] p-4 space-y-2">
          <Link
            href="/admin/language"
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#D2D2D2] hover:text-white hover:bg-[#1A1A1A] transition-colors rounded-[2px]"
            onClick={() => setIsOpen(false)}
          >
            <Settings size={18} />
            <span>{t("admin.language")}</span>
          </Link>
          <button
            onClick={async () => {
              await authService.logout();
              window.location.href = '/auth/login';
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#D2D2D2] hover:text-white hover:bg-[#1A1A1A] transition-colors rounded-[2px]"
          >
            <LogOut size={18} />
            <span>{t("admin.logout")}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
