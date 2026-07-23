"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Car, MessageSquareQuote, HelpCircle,
  Star, ListChecks, FileText, LogOut, Menu, X, Images, Tag, Users,
  ExternalLink, Truck, BrainCircuit,
} from "lucide-react";
import NotificationBell from "@/components/admin/NotificationBell";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/vehicles", label: "Vehicles", icon: Car },
  { href: "/admin/brands", label: "Brands", icon: Tag },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/testimonials", label: "Testimonials", icon: Star },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/admin/features", label: "Features", icon: ListChecks },
  { href: "/admin/process-steps", label: "Process Steps", icon: FileText },
  { href: "/admin/quotes", label: "Quotes", icon: MessageSquareQuote },
  { href: "/admin/knowledge-base", label: "Knowledge Base", icon: BrainCircuit },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Login page — no layout
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between border-b border-gray-800 px-6 py-5">
            <Link href="/admin" className="font-display text-lg font-bold">
              86Connect
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mb-1 ${
                    isActive
                      ? "bg-brand-500 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* External links */}
          <div className="border-t border-gray-800 p-3">
            <a
              href="https://admin.the86connect.com/admin#car-shipments"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-amber-400 transition-colors hover:bg-gray-800 hover:text-amber-300"
            >
              <Truck className="h-5 w-5" />
              Shipments & Tracking
              <ExternalLink className="h-3.5 w-3.5 ml-auto opacity-60" />
            </a>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-800 p-3">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:pl-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex items-center gap-4 border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-display text-lg font-bold">86Connect Admin</span>
          <div className="ml-auto">
            <NotificationBell />
          </div>
        </div>

        {/* Desktop top bar */}
        <div className="hidden items-center justify-between border-b border-gray-200 bg-white px-6 py-3 lg:flex">
          <span className="text-sm text-gray-500">Welcome back</span>
          <NotificationBell />
        </div>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
