"use client";

import { motion } from "framer-motion";
import { Download, Eye, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

interface Props {
  url: string;
  thumbnailUrl?: string;
  id?: string;
  onView?: () => void;
  onDelete?: () => void;
  similarity?: number;
}

export function ImageCard({ url, thumbnailUrl, id, onView, onDelete, similarity }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (downloading) return;
    
    setDownloading(true);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      // Extract filename from URL or use a default
      const filename = url.split("/").pop()?.split("?")[0] || "photo.jpg";
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
      // Fallback: open in new tab
      window.open(url, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="group relative rounded-2xl overflow-hidden cursor-pointer"
      style={{ boxShadow: "var(--shadow-md)" }}
      onClick={onView}
    >
      {/* Shimmer placeholder */}
      {!loaded && (
        <div
          className="absolute inset-0 animate-shimmer rounded-2xl"
          style={{ background: "hsl(var(--bg-secondary))", minHeight: "200px" }}
        />
      )}

      <img
        src={thumbnailUrl || url}
        alt=""
        className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
        style={{ minHeight: "120px" }}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          // If thumbnail fails, try the full URL
          const target = e.target as HTMLImageElement;
          if (target.src !== url) {
            target.src = url;
          }
        }}
        loading="lazy"
        referrerPolicy="no-referrer"
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end">
        <div className="w-full p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-between">
          {similarity !== undefined && (
            <span className="text-xs font-semibold text-white bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg">
              {Math.round(similarity * 100)}% match
            </span>
          )}
          <div className="flex gap-1 ml-auto">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="p-2 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors disabled:opacity-50"
            >
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            </button>
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-2 rounded-xl bg-red-500/70 backdrop-blur-sm text-white hover:bg-red-500/90 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

