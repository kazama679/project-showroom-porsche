"use client";

import { useState } from "react";
import { Link } from '@/i18n/navigation';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
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
    labelKey: "dashboard",
    href: "/admin",
    icon: LayoutGrid,
    exact: true,
  },
  {
    labelKey: "inventory",
    icon: Package,
    submenu: [
      { labelKey: "cars", href: "/admin/cars" },
      { labelKey: "brands", href: "/admin/brands" },
      { labelKey: "body_design", href: "/admin/body-types" },
      { labelKey: "series", href: "/admin/series" },
      { labelKey: "models", href: "/admin/models" },
      { labelKey: "options", href: "/admin/options" },
      { labelKey: "option_groups_management", href: "/admin/option-groups" },
      { labelKey: "option_items_management", href: "/admin/option-items" },
      { labelKey: "car_model_options_management", href: "/admin/car-model-options" },
      { labelKey: "option_rules_management", href: "/admin/option-rules" },
      { labelKey: "media", href: "/admin/media" },
    ],
  },
  {
    labelKey: "operations",
    icon: Calendar,
    submenu: [
      { labelKey: "bookings", href: "/admin/bookings" },
      { labelKey: "test_drives", href: "/admin/test-drives" },
      { labelKey: "reviews", href: "/admin/reviews" },
    ],
  },
  {
    labelKey: "users",
    href: "/admin/users",
    icon: Users,
  },
  {
    labelKey: "content",
    icon: BookOpen,
    submenu: [
      { labelKey: "blog", href: "/admin/blog" },
      { labelKey: "showrooms", href: "/admin/showrooms" },
      { labelKey: "banners", href: "/admin/banners" },
    ],
  },
  {
    labelKey: "system",
    icon: Zap,
    submenu: [
      { labelKey: "ailogs", href: "/admin/ailogs" },
      { labelKey: "settings", href: "/admin/settings" },
    ],
  },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([
    "dashboard",
  ]);
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("admin");

  const toggleMenu = (labelKey: string) => {
    setExpandedMenus((prev) =>
      prev.includes(labelKey)
        ? prev.filter((item) => item !== labelKey)
        : [...prev, labelKey],
    );
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname?.startsWith(href);
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
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-sm ${
              isAnySubmenuActive
                ? "bg-neutral-900 text-brand-red"
                : "text-light-gray-surface hover:text-white hover:bg-neutral-900"
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
                  className={`block px-4 py-2 text-xs font-medium transition-colors rounded-sm ${
                    isActive(subitem.href)
                      ? "bg-brand-red text-white"
                      : "text-light-gray-surface hover:text-white hover:bg-neutral-900"
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
        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-sm ${
          active
            ? "bg-brand-red text-white"
            : "text-light-gray-surface hover:text-white hover:bg-neutral-900"
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
        className="fixed bottom-6 right-6 z-50 lg:hidden p-3 bg-brand-red text-white rounded-full shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-black border-r border-dark-surface flex flex-col z-40 transition-transform lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-dark-surface">
          <h1 className="text-2xl font-bold text-brand-red">PORSCHE</h1>
          <p className="text-xs text-mid-gray mt-1">Admin Portal</p>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-6 space-y-1 px-3 hide-scrollbar">
          {menuItemsConfig.map((item) => (
            <NavItem key={item.labelKey} item={item} />
          ))}
        </nav>

        {/* Language & Logout */}
        <div className="border-t border-dark-surface p-4 space-y-2">
          <Link
            href="/admin/language"
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-light-gray-surface hover:text-white hover:bg-neutral-900 transition-colors rounded-sm"
            onClick={() => setIsOpen(false)}
          >
            <Settings size={18} />
            <span>{t("language")}</span>
          </Link>
          <button
            onClick={async () => {
              await authService.logout();
              router.push('/auth/login');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-light-gray-surface hover:text-white hover:bg-neutral-900 transition-colors rounded-sm"
          >
            <LogOut size={18} />
            <span>{t("logout")}</span>
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
