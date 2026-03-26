"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { ImageCard } from "@/components/ui/ImageCard";
import { UploadDropzone } from "@/components/ui/UploadDropzone";
import { ModalViewer } from "@/components/ui/ModalViewer";
import { PageLoader, GridSkeleton } from "@/components/ui/Loader";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { Calendar, Image, Upload, Share2, Check } from "lucide-react";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerIdx, setViewerIdx] = useState<number | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadData = async () => {
    try {
      const [ev, ph] = await Promise.all([
        api.events.get(id),
        api.photos.listByEvent(id, 1, 100),
      ]);
      setEvent(ev);
      setPhotos(ph.photos || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user, id]);

  if (loading) return <PageLoader />;
  if (!event) return <div className="p-8 text-center">Event not found</div>;

  const handleUpload = async (files: File[]) => {
    for (const file of files) {
      await api.photos.upload(id, file);
    }
    loadData();
  };

  const handleDelete = async (photoId: string) => {
    await api.photos.delete(photoId);
    loadData();
  };

  const handleShare = () => {
    const url = `${window.location.origin}/event/${id}/find`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ background: "hsl(var(--bg))" }}>
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
          {/* Event Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1" style={{ color: "hsl(var(--text))" }}>
                  {event.name}
                </h1>
                {event.description && (
                  <p className="text-sm mb-2" style={{ color: "hsl(var(--text-muted))" }}>
                    {event.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs" style={{ color: "hsl(var(--text-muted))" }}>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(event.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Image className="w-3 h-3" />
                    {photos.length} photos
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                  style={{
                    background: copied ? "hsl(var(--success) / 0.1)" : "hsl(var(--surface))",
                    color: copied ? "hsl(var(--success))" : "hsl(var(--text))",
                    border: `1px solid ${copied ? "hsl(var(--success) / 0.3)" : "hsl(var(--border))"}`,
                  }}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  {copied ? "Copied!" : "Share Link"}
                </button>
                <button
                  onClick={() => setShowUpload(!showUpload)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-bg transition-all hover:scale-105"
                >
                  <Upload className="w-4 h-4" />
                  Upload Photos
                </button>
              </div>
            </div>
          </motion.div>

          {/* Upload Dropzone */}
          {showUpload && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-8">
              <UploadDropzone onUpload={handleUpload} />
            </motion.div>
          )}

          {/* Photos Grid */}
          {photos.length === 0 ? (
            <div
              className="text-center py-20 rounded-2xl border"
              style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--surface))" }}
            >
              <Image className="w-12 h-12 mx-auto mb-4" style={{ color: "hsl(var(--text-muted))" }} />
              <h3 className="text-lg font-bold mb-2" style={{ color: "hsl(var(--text))" }}>
                No photos yet
              </h3>
              <p className="text-sm" style={{ color: "hsl(var(--text-muted))" }}>
                Upload photos to this event to get started.
              </p>
            </div>
          ) : (
            <div className="masonry-grid">
              {photos.map((photo, i) => (
                <ImageCard
                  key={photo.id}
                  url={photo.url}
                  thumbnailUrl={photo.thumbnailUrl}
                  id={photo.id}
                  onView={() => setViewerIdx(i)}
                  onDelete={() => handleDelete(photo.id)}
                />
              ))}
            </div>
          )}

          {/* Lightbox */}
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
