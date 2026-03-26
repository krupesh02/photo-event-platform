"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  trend?: string;
}

export function StatsCard({ title, value, icon: Icon, color = "var(--primary)", trend }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl border"
      style={{
        background: "hsl(var(--surface))",
        borderColor: "hsl(var(--border-light))",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `hsl(${color} / 0.1)` }}
        >
          <Icon className="w-5 h-5" style={{ color: `hsl(${color})` }} />
        </div>
        {trend && (
          <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ color: "hsl(var(--success))", background: "hsl(var(--success) / 0.1)" }}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold" style={{ color: "hsl(var(--text))" }}>
        {value}
      </p>
      <p className="text-xs mt-1" style={{ color: "hsl(var(--text-muted))" }}>
        {title}
      </p>
    </motion.div>
  );
}
