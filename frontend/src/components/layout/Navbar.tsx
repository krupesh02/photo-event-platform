"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Camera, Menu, X, LogOut, LayoutDashboard, Download } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-lg">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">PhotoAI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  style={{ color: "hsl(var(--text-secondary))" }}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  href="/search"
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  style={{ color: "hsl(var(--text-secondary))" }}
                >
                  Find Photos
                </Link>
                <a
                  href="/app.apk"
                  download
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white gradient-bg transition-all hover:scale-105 shadow-md hover:shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  Get App
                </a>
                <div className="w-px h-6 mx-2" style={{ background: "hsl(var(--border))" }} />
                <span className="text-sm" style={{ color: "hsl(var(--text-muted))" }}>
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
                  style={{ color: "hsl(var(--error))" }}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                  style={{ color: "hsl(var(--text))" }}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-bg transition-all hover:scale-105 hover:shadow-lg"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-xl"
            onClick={() => setOpen(!open)}
            style={{ color: "hsl(var(--text))" }}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass p-4 mx-4 mb-4 rounded-2xl"
        >
          <div className="flex flex-col gap-2">
            {user ? (
              <>
                <Link href="/dashboard" className="px-4 py-2 rounded-xl text-sm font-medium" onClick={() => setOpen(false)}>
                  Dashboard
                </Link>
                <Link href="/search" className="px-4 py-2 rounded-xl text-sm font-medium" onClick={() => setOpen(false)}>
                  Find Photos
                </Link>
                <a
                  href="/app.apk"
                  download
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white gradient-bg mt-2 mb-2"
                  onClick={() => setOpen(false)}
                >
                  <Download className="w-4 h-4" />
                  Get App
                </a>
                <button
                  onClick={() => { logout(); setOpen(false); }}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-left"
                  style={{ color: "hsl(var(--error))" }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 rounded-xl text-sm font-medium" onClick={() => setOpen(false)}>
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white text-center gradient-bg"
                  onClick={() => setOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
