"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { FloatingHearts, KittyDecorCorner } from "@/components/HelloKitty";
import { motion, AnimatePresence } from "framer-motion";

interface Photo {
  id: number;
  url: string;
  description: string | null;
  pinned: boolean;
  createdAt: string;
}

interface Memory {
  id: number;
  title: string;
  photos: string;
  date: string;
}

function CameraIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
    </svg>
  );
}

function PinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 2c-1.716 0-3.408.106-5.07.31C3.806 2.45 3 3.414 3 4.517V17.25a.75.75 0 0 0 1.075.676L10 15.082l5.925 2.844A.75.75 0 0 0 17 17.25V4.517c0-1.103-.806-2.068-1.93-2.207A41.403 41.403 0 0 0 10 2Z" clipRule="evenodd" />
    </svg>
  );
}

function CloseIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function UploadIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadDesc, setUploadDesc] = useState("");

  const fetchData = () => {
    fetch("/api/photos").then((r) => r.json()).then(setPhotos);
    fetch("/api/memories").then((r) => r.json()).then(setMemories);
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      await fetch("/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: data.url, description: uploadDesc || null }),
      });
    }

    setUploadDesc("");
    setShowUpload(false);
    setUploading(false);
    fetchData();
  };

  const togglePin = async (photo: Photo) => {
    await fetch("/api/photos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: photo.id, pinned: !photo.pinned }),
    });
    fetchData();
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/photos?id=${id}`, { method: "DELETE" });
    setPhotos((p) => p.filter((x) => x.id !== id));
  };

  // Memory photos (read-only, from timeline)
  const memoryPhotos: { url: string; title: string; date: string }[] = [];
  memories.forEach((m) => {
    const urls = JSON.parse(m.photos);
    urls.forEach((url: string) => {
      memoryPhotos.push({ url, title: m.title, date: m.date });
    });
  });

  const hasPhotos = photos.length > 0 || memoryPhotos.length > 0;

  return (
    <div className="min-h-screen pb-20">
      <Navigation />
      <FloatingHearts />
      <KittyDecorCorner position="bottom-left" />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10 animate-slide-up">
          <h1 className="font-script text-4xl text-rose-500 mb-2">
            Our Photo Wall
          </h1>
          <p className="text-rose-400 text-lg">Every photo tells a story</p>
        </div>

        {/* Upload button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="kitty-btn flex items-center gap-2 cursor-pointer"
          >
            {showUpload ? "Cancel" : <><UploadIcon /> Upload Photos</>}
          </button>
        </div>

        {/* Upload form */}
        <AnimatePresence>
          {showUpload && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="kitty-card p-6 space-y-4">
                <input
                  className="kitty-input w-full"
                  placeholder="Photo description (optional)"
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleUpload}
                  className="text-sm text-rose-400 cursor-pointer"
                />
                {uploading && <p className="text-rose-400 text-sm">Uploading...</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!hasPhotos ? (
          <div className="text-center py-20 text-rose-300">
            <CameraIcon className="w-16 h-16 mx-auto mb-4 opacity-40" />
            <p className="text-lg">No photos yet — start uploading!</p>
          </div>
        ) : (
          <>
            {/* Standalone photos */}
            {photos.length > 0 && (
              <div className="mb-10">
                <h2 className="font-serif text-xl font-bold text-rose-500 mb-4">
                  My Photos
                </h2>
                <div className="columns-2 md:columns-3 gap-4 space-y-4">
                  {photos.map((photo, i) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="kitty-frame relative cursor-pointer break-inside-avoid group"
                    >
                      <img
                        src={photo.url}
                        alt={photo.description || ""}
                        className="w-full rounded-lg"
                        onClick={() => setSelectedPhoto(photo.url)}
                      />
                      {photo.pinned && (
                        <div className="absolute top-2 left-2 bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                          <PinIcon className="w-3 h-3" /> Pinned
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => togglePin(photo)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                            photo.pinned
                              ? "bg-rose-500 text-white"
                              : "bg-white/80 text-rose-500"
                          }`}
                          title={photo.pinned ? "Unpin" : "Pin"}
                        >
                          <PinIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(photo.id)}
                          className="w-7 h-7 rounded-full bg-white/80 text-rose-400 flex items-center justify-center cursor-pointer hover:bg-rose-100 transition-colors"
                          title="Delete"
                        >
                          <CloseIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {/* Timestamp */}
                      <div className="px-2 py-1.5 flex items-center justify-between">
                        <span className="text-xs text-rose-400 font-serif">
                          {formatDate(photo.createdAt)}
                        </span>
                        <span className="text-xs text-rose-300">
                          {formatTime(photo.createdAt)}
                        </span>
                      </div>
                      {photo.description && (
                        <div className="px-2 pb-2">
                          <p className="text-rose-500 text-xs font-medium">
                            {photo.description}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Memory photos */}
            {memoryPhotos.length > 0 && (
              <div>
                <h2 className="font-serif text-xl font-bold text-rose-500 mb-4">
                  Memory Photos
                </h2>
                <div className="columns-2 md:columns-3 gap-4 space-y-4">
                  {memoryPhotos.map((photo, i) => (
                    <motion.div
                      key={`m-${i}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="kitty-frame relative cursor-pointer break-inside-avoid"
                      onClick={() => setSelectedPhoto(photo.url)}
                    >
                      <img
                        src={photo.url}
                        alt={photo.title}
                        className="w-full rounded-lg"
                      />
                      <div className="px-2 py-1.5">
                        <p className="text-rose-500 text-xs font-medium truncate">
                          {photo.title}
                        </p>
                        <p className="text-xs text-rose-300">
                          {formatDate(photo.date)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedPhoto(null)}
        >
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={selectedPhoto}
            alt=""
            className="max-w-full max-h-full rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
