"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { ImageCard } from "@/components/ui/ImageCard";
import { ModalViewer } from "@/components/ui/ModalViewer";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Upload, Loader2, Sparkles, Camera, SwitchCamera, X } from "lucide-react";

type Mode = "upload" | "camera";

export default function SearchPage() {
  const { user } = useAuth();
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

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      // Stop any existing stream
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
          ? "Camera access denied. Please allow camera permission."
          : "Could not access camera. Make sure it's connected."
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

    // Mirror the image if using front camera
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "webcam-capture.jpg", { type: "image/jpeg" });
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

  const switchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, []);

  // Restart camera when facing mode changes
  useEffect(() => {
    if (cameraActive) {
      startCamera();
    }
  }, [facingMode]);

  // Cleanup on unmount or mode switch
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Start/stop camera when switching mode
  useEffect(() => {
    if (mode === "camera" && !selfiePreview) {
      startCamera();
    } else if (mode === "upload") {
      stopCamera();
    }
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
      const res = await api.search.byFace(selfie);
      setResults(res);
    } catch (err) {
      console.error(err);
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
    if (mode === "camera") {
      startCamera();
    }
  };

  return (
    <div style={{ background: "hsl(var(--bg))" }}>
      <Navbar />
      <div className="flex pt-16">
        {user && <Sidebar />}
        <main className="flex-1 p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2" style={{ color: "hsl(var(--text))" }}>
                <Sparkles className="w-7 h-7 inline-block mr-2" style={{ color: "hsl(var(--primary))" }} />
                Find Your Photos
              </h1>
              <p className="text-sm" style={{ color: "hsl(var(--text-muted))" }}>
                Upload a selfie or scan your face live to find your photos across all events.
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex justify-center mb-6">
              <div
                className="inline-flex rounded-xl p-1 gap-1"
                style={{ background: "hsl(var(--surface))", border: "1px solid hsl(var(--border-light))" }}
              >
                <button
                  onClick={() => setMode("upload")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
                  style={{
                    background: mode === "upload" ? "hsl(var(--primary))" : "transparent",
                    color: mode === "upload" ? "white" : "hsl(var(--text-muted))",
                    boxShadow: mode === "upload" ? "0 2px 8px hsl(var(--primary) / 0.3)" : "none",
                  }}
                >
                  <Upload className="w-4 h-4" />
                  Upload Photo
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
                  <Camera className="w-4 h-4" />
                  Scan Face
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div
              className="rounded-2xl p-8 border mb-8 text-center overflow-hidden"
              style={{ background: "hsl(var(--surface))", borderColor: "hsl(var(--border-light))" }}
            >
              <AnimatePresence mode="wait">
                {selfiePreview ? (
                  /* === Preview captured/uploaded photo === */
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div
                      className="w-36 h-36 rounded-full overflow-hidden border-4 shadow-lg"
                      style={{ borderColor: "hsl(var(--primary))" }}
                    >
                      <img src={selfiePreview} alt="Selfie" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs font-medium" style={{ color: "hsl(var(--text-muted))" }}>
                      {mode === "camera" ? "📸 Captured from camera" : "📁 Uploaded from file"}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all hover:scale-105"
                        style={{
                          background: "hsl(var(--bg))",
                          border: "1px solid hsl(var(--border))",
                          color: "hsl(var(--text))",
                        }}
                      >
                        <X className="w-4 h-4" />
                        {mode === "camera" ? "Retake" : "Change Photo"}
                      </button>
                      <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white gradient-bg transition-all hover:scale-105 disabled:opacity-50"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Search className="w-4 h-4" /> Search
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                ) : mode === "camera" ? (
                  /* === Camera Mode === */
                  <motion.div
                    key="camera"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center gap-5"
                  >
                    {cameraError ? (
                      <div className="py-8">
                        <div
                          className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                          style={{ background: "hsl(0 70% 50% / 0.1)" }}
                        >
                          <Camera className="w-8 h-8" style={{ color: "hsl(0 70% 50%)" }} />
                        </div>
                        <p className="text-sm font-medium mb-2" style={{ color: "hsl(0 70% 50%)" }}>
                          {cameraError}
                        </p>
                        <button
                          onClick={startCamera}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                          style={{
                            background: "hsl(var(--primary) / 0.1)",
                            color: "hsl(var(--primary))",
                          }}
                        >
                          Try Again
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Camera viewfinder */}
                        <div className="relative">
                          <div
                            className="w-56 h-56 rounded-full overflow-hidden border-4 relative"
                            style={{
                              borderColor: cameraActive ? "hsl(var(--primary))" : "hsl(var(--border))",
                              boxShadow: cameraActive ? "0 0 30px hsl(var(--primary) / 0.2)" : "none",
                            }}
                          >
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              muted
                              className="w-full h-full object-cover"
                              style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
                            />

                            {/* Scanning overlay animation */}
                            {cameraActive && (
                              <div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                  background: "linear-gradient(180deg, transparent 0%, hsl(var(--primary) / 0.05) 50%, transparent 100%)",
                                  animation: "scanLine 2s ease-in-out infinite",
                                }}
                              />
                            )}
                          </div>

                          {/* Pulse ring */}
                          {cameraActive && (
                            <div
                              className="absolute inset-0 rounded-full pointer-events-none"
                              style={{
                                border: "2px solid hsl(var(--primary) / 0.3)",
                                animation: "cameraPulse 2s ease-in-out infinite",
                              }}
                            />
                          )}
                        </div>

                        <p className="text-xs" style={{ color: "hsl(var(--text-muted))" }}>
                          {cameraActive ? "Position your face in the circle" : "Starting camera..."}
                        </p>

                        {/* Camera controls */}
                        <div className="flex items-center gap-4">
                          <button
                            onClick={switchCamera}
                            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                            style={{
                              background: "hsl(var(--bg))",
                              border: "1px solid hsl(var(--border))",
                              color: "hsl(var(--text-muted))",
                            }}
                            title="Switch Camera"
                          >
                            <SwitchCamera className="w-4 h-4" />
                          </button>

                          {/* Capture button */}
                          <button
                            onClick={capturePhoto}
                            disabled={!cameraActive}
                            className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-40"
                            style={{
                              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
                              boxShadow: "0 4px 15px hsl(var(--primary) / 0.4)",
                              border: "3px solid white",
                            }}
                            title="Capture Photo"
                          >
                            <Camera className="w-6 h-6 text-white" />
                          </button>

                          <button
                            onClick={stopCamera}
                            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                            style={{
                              background: "hsl(0 70% 50% / 0.1)",
                              border: "1px solid hsl(0 70% 50% / 0.3)",
                              color: "hsl(0 70% 50%)",
                            }}
                            title="Stop Camera"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}

                    {/* Hidden canvas for capture */}
                    <canvas ref={canvasRef} className="hidden" />
                  </motion.div>
                ) : (
                  /* === Upload Mode === */
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <label className="cursor-pointer block">
                      <div
                        className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center"
                        style={{ background: "hsl(var(--primary) / 0.1)" }}
                      >
                        <Upload className="w-8 h-8" style={{ color: "hsl(var(--primary))" }} />
                      </div>
                      <p className="font-semibold text-sm mb-1" style={{ color: "hsl(var(--text))" }}>
                        Upload your selfie
                      </p>
                      <p className="text-xs" style={{ color: "hsl(var(--text-muted))" }}>
                        Take or select a clear photo of your face
                      </p>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Results */}
            {searched && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-lg font-bold mb-4" style={{ color: "hsl(var(--text))" }}>
                  {results.length > 0 ? `Found ${results.length} matching photos` : "No matching photos found"}
                </h2>

                {results.length > 0 && (
                  <div className="masonry-grid">
                    {results.map((r, i) => (
                      <ImageCard
                        key={r.photo.id}
                        url={r.photo.url}
                        thumbnailUrl={r.photo.thumbnailUrl}
                        similarity={r.similarity}
                        onView={() => setViewerIdx(i)}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {viewerIdx !== null && results[viewerIdx] && (
              <ModalViewer
                url={results[viewerIdx].photo.url}
                onClose={() => setViewerIdx(null)}
                onPrev={viewerIdx > 0 ? () => setViewerIdx(viewerIdx - 1) : undefined}
                onNext={viewerIdx < results.length - 1 ? () => setViewerIdx(viewerIdx + 1) : undefined}
              />
            )}
          </motion.div>
        </main>
      </div>


    </div>
  );
}
