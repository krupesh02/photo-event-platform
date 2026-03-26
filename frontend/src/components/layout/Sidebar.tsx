"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Upload, Image, Search, Settings, Plus } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/gallery", label: "Gallery", icon: Image },
  { href: "/search", label: "Find Photos", icon: Search },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden lg:flex flex-col w-64 h-[calc(100vh-4rem)] sticky top-16 p-4 border-r"
      style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--surface))" }}
    >
      {/* Create Event Button */}
      <Link
        href="/events/create"
        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white gradient-bg transition-all hover:scale-[1.02] hover:shadow-lg mb-6"
      >
        <Plus className="w-4 h-4" />
        Create Event
      </Link>

      {/* Nav Links */}
      <nav className="flex flex-col gap-1 flex-1">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active ? "text-white gradient-bg shadow-md" : ""
              }`}
              style={
                !active
                  ? { color: "hsl(var(--text-secondary))" }
                  : undefined
              }
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="text-xs px-4 py-3 rounded-xl"
        style={{
          color: "hsl(var(--text-muted))",
          background: "hsl(var(--bg-secondary))",
        }}
      >
        PhotoAI v2.0 — AI Powered
      </div>
    </aside>
  );
}
