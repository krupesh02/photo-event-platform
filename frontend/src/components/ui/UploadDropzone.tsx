"use client";

import { useCallback, useState } from "react";
import { Upload, X, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onUpload: (files: File[]) => Promise<void>;
  accept?: string;
  multiple?: boolean;
}

export function UploadDropzone({ onUpload, accept = "image/*", multiple = true }: Props) {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<{ file: File; status: "pending" | "uploading" | "done" | "error" }[]>([]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const dropped = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (dropped.length) processFiles(dropped);
    },
    []
  );

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length) processFiles(selected);
    e.target.value = "";
  };

  const processFiles = async (newFiles: File[]) => {
    const items = newFiles.map((f) => ({ file: f, status: "uploading" as const }));
    setFiles((prev) => [...prev, ...items]);
    try {
      await onUpload(newFiles);
      setFiles((prev) =>
        prev.map((p) =>
          items.some((i) => i.file === p.file) ? { ...p, status: "done" } : p
        )
      );
    } catch {
      setFiles((prev) =>
        prev.map((p) =>
          items.some((i) => i.file === p.file) ? { ...p, status: "error" } : p
        )
      );
    }
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-4">
      {/* Drop Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
          dragging ? "scale-[1.02]" : ""
        }`}
        style={{
          borderColor: dragging ? "hsl(var(--primary))" : "hsl(var(--border))",
          background: dragging ? "hsl(var(--primary) / 0.05)" : "hsl(var(--surface))",
        }}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleSelect}
          className="hidden"
        />
        <Upload
          className="w-10 h-10 mx-auto mb-3"
          style={{ color: "hsl(var(--primary))" }}
        />
        <p className="font-semibold text-sm" style={{ color: "hsl(var(--text))" }}>
          Drag & drop photos here
        </p>
        <p className="text-xs mt-1" style={{ color: "hsl(var(--text-muted))" }}>
          or click to browse · JPG, PNG, WEBP
        </p>
      </div>

      {/* File List */}
      <AnimatePresence>
        {files.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: "hsl(var(--surface))", border: "1px solid hsl(var(--border-light))" }}
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "hsl(var(--bg-secondary))" }}>
              <img
                src={URL.createObjectURL(item.file)}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "hsl(var(--text))" }}>
                {item.file.name}
              </p>
              <p className="text-xs" style={{ color: "hsl(var(--text-muted))" }}>
                {(item.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <div className="flex-shrink-0">
              {item.status === "uploading" && <Loader2 className="w-5 h-5 animate-spin" style={{ color: "hsl(var(--primary))" }} />}
              {item.status === "done" && <CheckCircle className="w-5 h-5" style={{ color: "hsl(var(--success))" }} />}
              {item.status === "error" && (
                <button onClick={() => removeFile(idx)}>
                  <X className="w-5 h-5" style={{ color: "hsl(var(--error))" }} />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
