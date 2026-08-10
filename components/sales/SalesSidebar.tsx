"use client";

import Link from "next/link";
import { useCallback, useRef } from "react";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  BookOpen,
  FileText,
  LayoutDashboard,
  ListChecks,
  User,
  LogOut,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";

type SalesSidebarSection =
  | "Dashboard"
  | "Daily Report"
  | "My Reports"
  | "My Performance"
  | "Profile";

const navItems: Array<{
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  section?: SalesSidebarSection;
}> = [
  { title: "Dashboard", icon: LayoutDashboard, section: "Dashboard" },
  { title: "Daily Report", icon: FileText, section: "Daily Report" },
  { title: "My Reports", icon: ListChecks, section: "My Reports" },
  { title: "My Performance", icon: BarChart3, section: "My Performance" },
  { title: "Company Values", icon: BookOpen, href: "/company-values" },
  { title: "Profile", icon: User, section: "Profile" },
];

export default function SalesSidebar({
  userName,
  activeSection,
  onSectionChange,
  open = false,
  collapsed = false,
  onCollapseToggle,
  onClose,
}: {
  userName: string;
  activeSection: SalesSidebarSection;
  onSectionChange: (section: SalesSidebarSection) => void;
  open?: boolean;
  collapsed?: boolean;
  onCollapseToggle?: () => void;
  onClose?: () => void;
}) {
  const sidebarRef = useRef<HTMLElement | null>(null);

  const pathname = usePathname();

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
        <div className="absolute left-0 top-0 flex h-full w-70 flex-col rounded-r-3xl border-r border-slate-800 bg-[#0f172a] p-6 shadow-2xl">
          <div className="flex items-center justify-between gap-3 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 text-white">
                S
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                  Sales PMS
                </p>
                <p className="text-lg font-semibold text-white">Workspace</p>
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
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isRoute = Boolean(item.href);
              const isActive = isRoute
                ? pathname === item.href
                : item.title === activeSection;

              return item.href ? (
                <Link
                  key={item.title}
                  href={item.href}
                  onClick={closeSidebar}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-500 text-white"
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
                  key={item.title}
                  type="button"
                  onClick={() => {
                    onSectionChange(item.section!);
                    onClose?.();
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-500 text-white"
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
          <div className="mt-auto space-y-3 rounded-3xl bg-slate-900 p-5 text-sm text-slate-100">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-800 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500">
                C
              </div>
              <div>
                <p className="font-semibold text-white">Collins</p>
                <p className="text-xs text-slate-400">Salesperson</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              className="flex w-full items-center justify-between gap-3 rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-700"
            >
              <span>Logout</span>
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <aside
        className={`hidden md:flex shrink-0 flex-col rounded-[28px] border border-slate-800 bg-[#0f172a] p-6 text-slate-100 shadow-sm ${collapsed ? "md:w-20 lg:w-70" : "md:w-70"}`}
      >
        <div className="sticky top-6 flex h-[calc(100vh-48px)] flex-col justify-between rounded-[28px] border border-slate-800 bg-[#0f172a] p-6 shadow-sm text-slate-100">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 text-white">
                S
              </div>
              <div className={`${collapsed ? "hidden" : "block"}`}>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                  Sales PMS
                </p>
                <p className="text-lg font-semibold text-white">Sales panel</p>
              </div>
            </div>
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isRoute = Boolean(item.href);
                const isActive = isRoute
                  ? pathname === item.href
                  : item.title === activeSection;
                return item.href ? (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={onClose}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-500 text-white shadow-lg"
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
                    onClick={() => onSectionChange(item.section!)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-500 text-white shadow-lg"
                        : "text-slate-200 hover:bg-blue-600/10 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>
          <div className="space-y-3 rounded-3xl bg-slate-900 p-5 text-sm">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-800 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500">
                C
              </div>
              <div className={`${collapsed ? "hidden" : "block"}`}>
                <p className="font-semibold text-white">{userName}</p>
                <p className="text-xs text-slate-400">Salesperson</p>
              </div>
            </div>
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
              className="flex w-full items-center justify-between gap-3 rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-700"
            >
              <span>Logout</span>
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
