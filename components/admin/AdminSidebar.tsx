"use client";

import Link from "next/link";
import { useCallback, useRef } from "react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Target,
  BarChart3,
  Settings2,
  User,
  LogOut,
  X,
  BookOpen,
} from "lucide-react";

type SidebarSection =
  | "Dashboard"
  | "Daily Reports"
  | "Performance"
  | "Users"
  | "Targets"
  | "Reports"
  | "Company Values"
  | "Profile"
  | "Settings";

const navItems: Array<{
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  section?: SidebarSection;
}> = [
  { title: "Dashboard", icon: LayoutDashboard, section: "Dashboard" },
  { title: "Daily Reports", icon: FileText, section: "Daily Reports" },
  { title: "Performance", icon: BarChart3, section: "Performance" },
  { title: "Users", icon: Users, section: "Users" },
  { title: "Targets", icon: Target, section: "Targets" },
  { title: "Reports", icon: FileText, section: "Reports" },
  { title: "Company Values", icon: BookOpen, section: "Company Values" },
  { title: "Profile", icon: User, section: "Profile" },
];

export default function AdminSidebar({
  activeSection,
  onSectionChange,
  open = false,
  collapsed = false,
  onCollapseToggle,
  onClose,
}: {
  activeSection: SidebarSection;
  onSectionChange: (section: SidebarSection) => void;
  open?: boolean;
  collapsed?: boolean;
  onCollapseToggle?: () => void;
  onClose?: () => void;
}) {
  const sidebarRef = useRef<HTMLElement | null>(null);

  const closeSidebar = useCallback(() => {
    if (
      typeof document !== "undefined" &&
      document.activeElement instanceof HTMLElement &&
      sidebarRef.current?.contains(document.activeElement)
    ) {
      document.activeElement.blur();
    }
    onClose?.();
  }, [onClose]);

  return (
    <>
      <aside
        ref={sidebarRef}
        className={`fixed inset-0 z-40 md:hidden ${open ? "block" : "hidden"}`}
      >
        <div
          className="absolute inset-0 bg-slate-950/60"
          onClick={closeSidebar}
        />
        <div className="absolute left-0 top-0 flex h-full min-h-0 w-72 flex-col overflow-hidden bg-[#0f172a] p-6 shadow-2xl">
          <div className="flex items-center justify-between gap-3 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 text-white">
                S
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                  Sales PMS
                </p>
                <p className="text-lg font-semibold text-white">Admin panel</p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeSidebar}
              className="rounded-2xl border border-slate-700 bg-slate-900 p-2 text-slate-300 hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 pb-6">
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isRoute = Boolean(item.href);
                const pathname = usePathname();
                const isActive = isRoute
                  ? pathname === item.href
                  : item.title === activeSection;

                return item.href ? (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={closeSidebar}
                    className={`flex w-full items-center gap-2 rounded-2xl px-3 py-3 text-left text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-500 text-white"
                        : "text-slate-200 hover:bg-blue-600/10 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                ) : (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => {
                      onSectionChange(item.section!);
                      onClose?.();
                    }}
                    className={`flex w-full items-center gap-2 rounded-2xl px-3 py-3 text-left text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-500 text-white"
                        : "text-slate-200 hover:bg-blue-600/10 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </button>
                );
              })}
            </nav>
            <div className="mt-6 border-t border-slate-800 pt-6">
              <div className="space-y-3 bg-slate-900 p-5 text-sm text-slate-100">
                <div className="flex items-center gap-3 bg-slate-800 p-4 rounded-3xl">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500 text-white">
                    A
                  </div>
                  <div>
                    <p className="font-semibold text-white">Admin</p>
                    <p className="text-xs text-slate-400">Administrator</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onSectionChange("Settings")}
                  className="flex w-full items-center gap-3 rounded-2xl bg-slate-800 px-4 py-3 text-left text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
                >
                  <Settings2 className="h-4 w-4" />
                  <span>Settings</span>
                </button>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl bg-slate-800 px-4 py-3 text-left text-sm font-semibold text-slate-100 hover:bg-slate-700"
                >
                  <span>Logout</span>
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <aside
        className={`hidden md:flex fixed inset-0 top-0 left-0 z-20 flex-col min-h-0 overflow-hidden ${collapsed ? "w-20" : "w-72"} bg-[#0f172a] text-slate-100 h-screen`}
      >
        <div className="flex h-full min-h-0 flex-col p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 text-xl text-white">
              S
            </div>
            <div className={`${collapsed ? "hidden" : "block"}`}>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">
                Sales PMS
              </p>
              <p className="text-lg font-semibold text-white">Admin panel</p>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            <nav className="mt-8 overflow-x-hidden pr-1 pb-6 space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const pathname = usePathname();
                const isRoute = Boolean(item.href);
                const isActive = isRoute
                  ? pathname === item.href
                  : item.title === activeSection;

                return item.href ? (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={onClose}
                    className={`flex w-full items-center gap-2 rounded-2xl px-3 py-3 text-left text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-500 text-white shadow-lg"
                        : "text-slate-200 hover:bg-slate-900 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className={`${collapsed ? "hidden" : "block"}`}>
                      {item.title}
                    </span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    key={item.title}
                    onClick={() => onSectionChange(item.section!)}
                    className={`flex w-full items-center gap-2 rounded-2xl px-3 py-3 text-left text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-500 text-white shadow-lg"
                        : "text-slate-200 hover:bg-slate-900 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className={`${collapsed ? "hidden" : "block"}`}>
                      {item.title}
                    </span>
                  </button>
                );
              })}
            </nav>
            <div className="mt-6 border-t border-slate-800 pt-6">
              <div className="space-y-3 bg-slate-900 p-5 text-sm">
                <button
                  type="button"
                  onClick={() => onSectionChange("Settings")}
                  className="flex w-full items-center gap-3 rounded-2xl bg-slate-800 px-4 py-3 text-left text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
                >
                  <Settings2 className="h-4 w-4" />
                  <span className={`${collapsed ? "hidden" : "block"}`}>
                    Settings
                  </span>
                </button>
                <div className="hidden md:flex lg:hidden items-center gap-2">
                  <button
                    type="button"
                    onClick={onCollapseToggle}
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 px-4 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
                  >
                    {collapsed ? "Expand" : "Collapse"}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl bg-slate-800 px-4 py-3 text-left text-sm font-semibold text-slate-100 hover:bg-slate-700"
                >
                  <span className={`${collapsed ? "hidden" : "block"}`}>
                    Logout
                  </span>
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
