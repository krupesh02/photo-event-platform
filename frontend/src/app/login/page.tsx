"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: "hsl(var(--bg))" }}>
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-[150px] opacity-20" style={{ background: "hsl(var(--primary))" }} />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-[150px] opacity-15" style={{ background: "hsl(var(--accent))" }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">PhotoAI</span>
          </Link>
          <p className="text-sm mt-3" style={{ color: "hsl(var(--text-muted))" }}>
            Welcome back! Sign in to your account.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="glass-strong rounded-2xl p-8 space-y-5"
          style={{ boxShadow: "var(--shadow-xl)" }}
        >
          {error && (
            <div className="text-sm p-3 rounded-xl text-white" style={{ background: "hsl(var(--error))" }}>
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: "hsl(var(--text-secondary))" }}>
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(var(--text-muted))" }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2"
                style={{
                  background: "hsl(var(--bg))",
                  border: "1px solid hsl(var(--border))",
                  color: "hsl(var(--text))",
                }}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: "hsl(var(--text-secondary))" }}>
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(var(--text-muted))" }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2"
                style={{
                  background: "hsl(var(--bg))",
                  border: "1px solid hsl(var(--border))",
                  color: "hsl(var(--text))",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white gradient-bg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
          </button>

          <p className="text-center text-sm" style={{ color: "hsl(var(--text-muted))" }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold" style={{ color: "hsl(var(--primary))" }}>
              Sign Up
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
