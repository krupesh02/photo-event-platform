"use client";

import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatsCard } from "@/components/ui/StatsCard";
import { PageLoader } from "@/components/ui/Loader";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Image, Users, Plus, ArrowRight, Trash2 } from "lucide-react";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user]);

  useEffect(() => {
    if (user) {
      api.events.list().then(setEvents).catch(console.error).finally(() => setLoading(false));
    }
  }, [user]);

  if (authLoading || !user) return <PageLoader />;

  const totalPhotos = events.reduce((sum, e) => sum + (e.photoCount || 0), 0);

  return (
    <div style={{ background: "hsl(var(--bg))" }}>
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "hsl(var(--text))" }}>
                Welcome back, {user.name}
              </h1>
              <p className="text-sm mt-1" style={{ color: "hsl(var(--text-muted))" }}>
                Here&apos;s an overview of your photo events.
              </p>
            </div>
            <Link
              href="/events/create"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-bg transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" /> New Event
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard title="Total Events" value={events.length} icon={Calendar} color="var(--primary)" />
            <StatsCard title="Total Photos" value={totalPhotos} icon={Image} color="var(--accent)" />
            <StatsCard title="Active Events" value={events.filter((e) => e.status === "ACTIVE").length} icon={Users} color="var(--success)" />
            <StatsCard title="Face Searches" value="∞" icon={Users} color="var(--warning)" />
          </div>

          {/* Events List */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ color: "hsl(var(--text))" }}>
              Your Events
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 rounded-2xl animate-shimmer" style={{ background: "hsl(var(--bg-secondary))" }} />
              ))}
            </div>
          ) : events.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 rounded-2xl border"
              style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--surface))" }}
            >
              <Calendar className="w-12 h-12 mx-auto mb-4" style={{ color: "hsl(var(--text-muted))" }} />
              <h3 className="text-lg font-bold mb-2" style={{ color: "hsl(var(--text))" }}>
                No events yet
              </h3>
              <p className="text-sm mb-6" style={{ color: "hsl(var(--text-muted))" }}>
                Create your first event to start uploading photos.
              </p>
              <Link
                href="/events/create"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white gradient-bg"
              >
                <Plus className="w-4 h-4" /> Create Event
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={`/events/${event.id}`}
                    className="block rounded-2xl border overflow-hidden transition-all hover:shadow-lg group"
                    style={{ background: "hsl(var(--surface))", borderColor: "hsl(var(--border-light))" }}
                  >
                    {/* Cover */}
                    <div className="h-36 relative overflow-hidden" style={{ background: "hsl(var(--bg-secondary))" }}>
                      {event.coverUrl ? (
                        <img src={event.coverUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="w-8 h-8" style={{ color: "hsl(var(--text-muted))" }} />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-semibold glass">
                        {event.photoCount} photos
                      </div>
                    </div>
                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-sm mb-1 truncate" style={{ color: "hsl(var(--text))" }}>
                        {event.name}
                      </h3>
                      <p className="text-xs" style={{ color: "hsl(var(--text-muted))" }}>
                        {new Date(event.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
