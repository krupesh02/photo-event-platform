"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Upload, Loader2, Sparkles, Camera, SwitchCamera, X, Calendar } from "lucide-react";
import { api } from "@/lib/api";
import { ImageCard } from "@/components/ui/ImageCard";
import { ModalViewer } from "@/components/ui/ModalViewer";
import { PageLoader } from "@/components/ui/Loader";

type Mode = "upload" | "camera";

export default function GuestSearchPage() {
  const { id } = useParams<{ id: string }>();
  const [eventInfo, setEventInfo] = useState<any>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  const [mode, setMode] = useState<Mode>("upload");
  const [selfie, setSelfie] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [viewerIdx, setViewerIdx] = useState<number | null>(null);

  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  useEffect(() => {
    api.public
      .getEvent(id)
      .then((data) => {
        setEventInfo(data);
      })
      .catch((err) => {
        console.error("Failed to fetch event", err);
      })
      .finally(() => {
        setLoadingEvent(false);
      });
  }, [id]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.error("Camera error:", err);
      setCameraError(
        err.name === "NotAllowedError"
          ? "Camera access denied. Please allow it."
          : "Could not access camera."
      );
      setCameraActive(false);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
        setSelfie(file);
        setSelfiePreview(URL.createObjectURL(blob));
        setResults([]);
        setSearched(false);
        stopCamera();
      },
      "image/jpeg",
      0.95
    );
  }, [facingMode, stopCamera]);

  const switchCamera = useCallback(() => setFacingMode((prev) => (prev === "user" ? "environment" : "user")), []);

  useEffect(() => {
    if (cameraActive) startCamera();
  }, [facingMode]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  useEffect(() => {
    if (mode === "camera" && !selfiePreview) startCamera();
    else if (mode === "upload") stopCamera();
  }, [mode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelfie(file);
      setSelfiePreview(URL.createObjectURL(file));
      setResults([]);
      setSearched(false);
    }
  };

  const handleSearch = async () => {
    if (!selfie) return;
    setLoading(true);
    setSearched(false);
    try {
      const res = await api.public.searchFace(id, selfie);
      setResults(res);
    } catch (err) {
      console.error(err);
      alert("Failed to search photos. Ensure the face is clear.");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const handleReset = () => {
    setSelfie(null);
    setSelfiePreview(null);
    setResults([]);
    setSearched(false);
    if (mode === "camera") startCamera();
  };

  if (loadingEvent) return <PageLoader />;

  if (!eventInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center px-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
          <p className="text-gray-500">The link might be invalid or the event was deleted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--bg))" }}>
      {/* Minimal Header */}
      <header className="fixed top-0 inset-x-0 h-16 bg-white/70 backdrop-blur-md border-b z-40 flex items-center px-6" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="flex items-center gap-2 font-bold text-xl gradient-text tracking-tight">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white">
            <Camera className="w-5 h-5" />
          </div>
          PhotoAI
        </div>
      </header>

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: "hsl(var(--primary))" }}>
            Find your photos in
          </h2>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "hsl(var(--text))" }}>
            {eventInfo.name}
          </h1>
          <div className="flex items-center justify-center gap-2 text-sm" style={{ color: "hsl(var(--text-muted))" }}>
            <Calendar className="w-4 h-4" />
            {new Date(eventInfo.eventDate || eventInfo.createdAt).toLocaleDateString()}
          </div>
        </motion.div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-xl p-1 gap-1" style={{ background: "hsl(var(--surface))", border: "1px solid hsl(var(--border-light))" }}>
            <button
              onClick={() => setMode("upload")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{
                background: mode === "upload" ? "hsl(var(--primary))" : "transparent",
                color: mode === "upload" ? "white" : "hsl(var(--text-muted))",
                boxShadow: mode === "upload" ? "0 2px 8px hsl(var(--primary) / 0.3)" : "none",
              }}
            >
              <Upload className="w-4 h-4" /> Upload
            </button>
            <button
              onClick={() => setMode("camera")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{
                background: mode === "camera" ? "hsl(var(--primary))" : "transparent",
                color: mode === "camera" ? "white" : "hsl(var(--text-muted))",
                boxShadow: mode === "camera" ? "0 2px 8px hsl(var(--primary) / 0.3)" : "none",
              }}
            >
              <Camera className="w-4 h-4" /> Scan Face
            </button>
          </div>
        </div>

        {/* Capture Area */}
        <div className="rounded-2xl p-6 sm:p-8 border mb-8 text-center overflow-hidden" style={{ background: "hsl(var(--surface))", borderColor: "hsl(var(--border-light))" }}>
          <AnimatePresence mode="wait">
            {selfiePreview ? (
              <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col items-center gap-4">
                <div className="w-36 h-36 rounded-full overflow-hidden border-4 shadow-lg" style={{ borderColor: "hsl(var(--primary))" }}>
                  <img src={selfiePreview} alt="Selfie" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                  <button onClick={handleReset} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all hover:scale-105" style={{ background: "hsl(var(--bg))", border: "1px solid hsl(var(--border))", color: "hsl(var(--text))" }}>
                    <X className="w-4 h-4" /> Retake
                  </button>
                  <button onClick={handleSearch} disabled={loading} className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white gradient-bg transition-all hover:scale-105 shadow-lg shadow-black/10 disabled:opacity-50">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Find My Photos</>}
                  </button>
                </div>
              </motion.div>
            ) : mode === "camera" ? (
              <motion.div key="camera" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col items-center gap-5">
                {cameraError ? (
                  <div className="py-8">
                    <p className="text-sm font-medium mb-4 text-red-500">{cameraError}</p>
                    <button onClick={startCamera} className="px-5 py-2.5 rounded-lg text-sm font-bold text-white gradient-bg">Try Again</button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full overflow-hidden border-4 relative" style={{ borderColor: cameraActive ? "hsl(var(--primary))" : "hsl(var(--border))" }}>
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }} />
                        {cameraActive && <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, transparent 0%, hsl(var(--primary) / 0.05) 50%, transparent 100%)", animation: "scanLine 2s ease-in-out infinite" }} />}
                      </div>
                      {cameraActive && <div className="absolute inset-0 rounded-full pointer-events-none" style={{ border: "2px solid hsl(var(--primary) / 0.3)", animation: "cameraPulse 2s ease-in-out infinite" }} />}
                    </div>
                    <p className="text-sm" style={{ color: "hsl(var(--text-muted))" }}>Position your face inside the circle</p>
                    <div className="flex items-center gap-4 mt-2">
                      <button onClick={switchCamera} className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{ background: "hsl(var(--bg))", border: "1px solid hsl(var(--border))" }}>
                        <SwitchCamera className="w-5 h-5" style={{ color: "hsl(var(--text-muted))" }} />
                      </button>
                      <button onClick={capturePhoto} disabled={!cameraActive} className="w-20 h-20 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-40" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))", border: "4px solid white", boxShadow: "0 4px 20px hsl(var(--primary) / 0.4)" }}>
                        <Camera className="w-8 h-8 text-white" />
                      </button>
                      <button onClick={stopCamera} className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 bg-red-50 border border-red-100 text-red-500">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </motion.div>
            ) : (
              <motion.div key="upload" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="py-8">
                <label className="cursor-pointer block">
                  <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center shadow-inner" style={{ background: "hsl(var(--primary) / 0.05)" }}>
                    <Upload className="w-10 h-10" style={{ color: "hsl(var(--primary))" }} />
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: "hsl(var(--text))" }}>Upload a clear photo</h3>
                  <p className="text-sm" style={{ color: "hsl(var(--text-muted))" }}>Select a photo where your face is clearly visible</p>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results */}
        {searched && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12">
            <h2 className="text-xl font-bold mb-6 text-center" style={{ color: "hsl(var(--text))" }}>
              {results.length > 0 ? `Found ${results.length} photos of you! 🎉` : "No matching photos found 😕"}
            </h2>

            {results.length > 0 && (
              <div className="masonry-grid">
                {results.map((r, i) => (
                  <ImageCard key={r.photo.id} url={r.photo.url} thumbnailUrl={r.photo.thumbnailUrl} similarity={r.similarity} onView={() => setViewerIdx(i)} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {viewerIdx !== null && results[viewerIdx] && (
          <ModalViewer url={results[viewerIdx].photo.url} onClose={() => setViewerIdx(null)} onPrev={viewerIdx > 0 ? () => setViewerIdx(viewerIdx - 1) : undefined} onNext={viewerIdx < results.length - 1 ? () => setViewerIdx(viewerIdx + 1) : undefined} />
        )}
      </main>
    </div>
  );
}
