"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { UploadDropzone } from "@/components/ui/UploadDropzone";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/ui/Loader";

export default function UploadPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user]);

  useEffect(() => {
    if (user) {
      api.events.list().then((e) => {
        setEvents(e);
        if (e.length > 0) setSelectedEvent(e[0].id);
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [user]);

  if (authLoading || !user) return <PageLoader />;

  const handleUpload = async (files: File[]) => {
    if (!selectedEvent) return;
    for (const file of files) {
      await api.photos.upload(selectedEvent, file);
    }
  };

  return (
    <div style={{ background: "hsl(var(--bg))" }}>
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-2" style={{ color: "hsl(var(--text))" }}>
              Upload Photos
            </h1>
            <p className="text-sm mb-8" style={{ color: "hsl(var(--text-muted))" }}>
              Select an event and upload your photos. Our AI will automatically detect faces.
            </p>

            {/* Event Selector */}
            <div className="mb-6">
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: "hsl(var(--text-secondary))" }}>
                Select Event
              </label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{
                  background: "hsl(var(--surface))",
                  border: "1px solid hsl(var(--border))",
                  color: "hsl(var(--text))",
                }}
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Upload Area */}
            {selectedEvent ? (
              <UploadDropzone onUpload={handleUpload} />
            ) : (
              <div
                className="text-center py-12 rounded-2xl border"
                style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--surface))" }}
              >
                <p className="text-sm" style={{ color: "hsl(var(--text-muted))" }}>
                  Create an event first to upload photos.
                </p>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
