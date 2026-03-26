"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  ArrowRight,
  Search,
  Shield,
  Zap,
  Upload,
  Users,
  Image,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export default function LandingPage() {
  return (
    <div style={{ background: "hsl(var(--bg))" }}>
      <Navbar />

      {/* ========== HERO ========== */}
      <section className="relative pt-28 pb-20 lg:pt-44 lg:pb-32 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute top-20 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-30"
            style={{ background: "hsl(var(--primary))" }}
          />
          <div
            className="absolute bottom-20 right-1/4 w-80 h-80 rounded-full blur-[120px] opacity-20"
            style={{ background: "hsl(var(--accent))" }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <motion.div {...fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8 text-sm font-medium" style={{ color: "hsl(var(--primary))" }}>
            <Sparkles className="w-4 h-4" />
            AI-Powered Face Recognition
          </motion.div>

          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6"
            style={{ color: "hsl(var(--text))" }}
          >
            Smart Photo Sharing
            <br />
            <span className="gradient-text">powered by AI</span>
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10"
            style={{ color: "hsl(var(--text-secondary))" }}
          >
            Upload your event photos and let our advanced facial recognition
            find and deliver photos to your guests in seconds. No tags needed.
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/register"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base text-white gradient-bg transition-all hover:scale-105 active:scale-95 animate-pulse-glow"
            >
              Create Event Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/search"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base glass transition-all hover:scale-105 active:scale-95"
              style={{ color: "hsl(var(--text))" }}
            >
              Find My Photos <Search className="w-5 h-5" />
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center justify-center gap-8 sm:gap-16 mt-16"
          >
            {[
              { val: "10K+", label: "Photos Processed" },
              { val: "500+", label: "Events Created" },
              { val: "99%", label: "Face Accuracy" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-black gradient-text">
                  {s.val}
                </p>
                <p className="text-xs mt-1" style={{ color: "hsl(var(--text-muted))" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section className="py-24" style={{ background: "hsl(var(--surface))" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: "hsl(var(--text))" }}>
              Everything you need
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "hsl(var(--text-secondary))" }}>
              From uploading to sharing — all powered by cutting-edge AI technology.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Search,
                title: "Face Recognition",
                desc: "Upload a selfie and our AI instantly finds all your photos from any event gallery.",
                color: "var(--primary)",
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                desc: "High-performance matching engine ensures results in under 2 seconds.",
                color: "var(--accent)",
              },
              {
                icon: Shield,
                title: "Secure & Private",
                desc: "Industry-standard encryption keeps your photos and data completely private.",
                color: "var(--success)",
              },
              {
                icon: Upload,
                title: "Drag & Drop Upload",
                desc: "Bulk upload hundreds of photos with our intuitive drag and drop interface.",
                color: "var(--warning)",
              },
              {
                icon: Users,
                title: "Event Management",
                desc: "Create and manage events effortlessly. Organize galleries by occasion.",
                color: "var(--primary)",
              },
              {
                icon: Image,
                title: "Smart Galleries",
                desc: "Beautiful masonry layouts with lazy loading and infinite scroll support.",
                color: "var(--accent)",
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="p-6 rounded-2xl border transition-all hover:shadow-lg group"
                style={{
                  background: "hsl(var(--bg))",
                  borderColor: "hsl(var(--border-light))",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: `hsl(${f.color} / 0.1)` }}
                >
                  <f.icon className="w-6 h-6" style={{ color: `hsl(${f.color})` }} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "hsl(var(--text))" }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--text-muted))" }}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: "hsl(var(--text))" }}>
              How it works
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "hsl(var(--text-secondary))" }}>
              Three simple steps to find all your event photos instantly.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create an Event",
                desc: "Set up your event in seconds. Add a name, date, and start uploading photos.",
              },
              {
                step: "02",
                title: "Upload Photos",
                desc: "Drag and drop your photos. Our AI automatically detects and indexes every face.",
              },
              {
                step: "03",
                title: "Find Your Photos",
                desc: "Upload a selfie and get all matching photos delivered to you instantly.",
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="text-center"
              >
                <span className="text-6xl font-black gradient-text opacity-30">
                  {s.step}
                </span>
                <h3 className="text-xl font-bold mt-2 mb-3" style={{ color: "hsl(var(--text))" }}>
                  {s.title}
                </h3>
                <p className="text-sm max-w-xs mx-auto" style={{ color: "hsl(var(--text-muted))" }}>
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="py-24" style={{ background: "hsl(var(--surface))" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="gradient-bg rounded-3xl p-12 md:p-16 text-white"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Ready to get started?
            </h2>
            <p className="text-lg opacity-80 mb-8 max-w-lg mx-auto">
              Create your first event and let AI handle the rest. Free to start,
              no credit card required.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold bg-white text-slate-900 transition-all hover:scale-105 active:scale-95"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
