"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { ImageCard } from "@/components/ui/ImageCard";
import { ModalViewer } from "@/components/ui/ModalViewer";
import { PageLoader, GridSkeleton } from "@/components/ui/Loader";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function GalleryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerIdx, setViewerIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user]);

  useEffect(() => {
    if (user) {
      api.events.list().then(setEvents).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const loadPhotos = async () => {
      const eventsToLoad = selectedEvent === "all" ? events : events.filter((e) => e.id === selectedEvent);
      const allPhotos: any[] = [];
      for (const ev of eventsToLoad) {
        try {
          const res = await api.photos.listByEvent(ev.id, 1, 100);
          allPhotos.push(...(res.photos || []));
        } catch {}
      }
      setPhotos(allPhotos);
      setLoading(false);
    };

    if (events.length > 0) loadPhotos();
    else setLoading(false);
  }, [user, events, selectedEvent]);

  if (authLoading || !user) return <PageLoader />;

  return (
    <div style={{ background: "hsl(var(--bg))" }}>
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "hsl(var(--text))" }}>
                Gallery
              </h1>
              <p className="text-sm mt-1" style={{ color: "hsl(var(--text-muted))" }}>
                {photos.length} photos across {events.length} events
              </p>
            </div>

            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="px-4 py-2 rounded-xl text-sm outline-none"
              style={{
                background: "hsl(var(--surface))",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--text))",
              }}
            >
              <option value="all">All Events</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <GridSkeleton count={12} />
          ) : photos.length === 0 ? (
            <div
              className="text-center py-20 rounded-2xl border"
              style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--surface))" }}
            >
              <p className="text-sm" style={{ color: "hsl(var(--text-muted))" }}>
                No photos found. Upload some to your events!
              </p>
            </div>
          ) : (
            <div className="masonry-grid">
              {photos.map((photo, i) => (
                <ImageCard
                  key={photo.id}
                  url={photo.url}
                  thumbnailUrl={photo.thumbnailUrl}
                  onView={() => setViewerIdx(i)}
                />
              ))}
            </div>
          )}

          {viewerIdx !== null && photos[viewerIdx] && (
            <ModalViewer
              url={photos[viewerIdx].url}
              onClose={() => setViewerIdx(null)}
              onPrev={viewerIdx > 0 ? () => setViewerIdx(viewerIdx - 1) : undefined}
              onNext={viewerIdx < photos.length - 1 ? () => setViewerIdx(viewerIdx + 1) : undefined}
            />
          )}
        </main>
      </div>
    </div>
  );
}
