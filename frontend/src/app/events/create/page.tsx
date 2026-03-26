"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { Calendar, FileText, Loader2, ArrowRight } from "lucide-react";

export default function CreateEventPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const event = await api.events.create({
        name,
        description: description || undefined,
        eventDate: eventDate || undefined,
      });
      router.push(`/events/${event.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "hsl(var(--bg))" }}>
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-2" style={{ color: "hsl(var(--text))" }}>
              Create New Event
            </h1>
            <p className="text-sm mb-8" style={{ color: "hsl(var(--text-muted))" }}>
              Set up your event and start uploading photos.
            </p>

            <form
              onSubmit={handleSubmit}
              className="rounded-2xl p-6 border space-y-5"
              style={{ background: "hsl(var(--surface))", borderColor: "hsl(var(--border-light))" }}
            >
              {error && (
                <div className="text-sm p-3 rounded-xl text-white" style={{ background: "hsl(var(--error))" }}>
                  {error}
                </div>
              )}

              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: "hsl(var(--text-secondary))" }}>
                  Event Name *
                </label>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Wedding Reception" required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2"
                  style={{ background: "hsl(var(--bg))", border: "1px solid hsl(var(--border))", color: "hsl(var(--text))" }}
                />
              </div>

              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: "hsl(var(--text-secondary))" }}>
                  Description
                </label>
                <textarea
                  value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about the event..." rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 resize-none"
                  style={{ background: "hsl(var(--bg))", border: "1px solid hsl(var(--border))", color: "hsl(var(--text))" }}
                />
              </div>

              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: "hsl(var(--text-secondary))" }}>
                  Event Date
                </label>
                <input
                  type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2"
                  style={{ background: "hsl(var(--bg))", border: "1px solid hsl(var(--border))", color: "hsl(var(--text))" }}
                />
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white gradient-bg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create Event <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
