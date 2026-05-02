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
        <div className="text-center mb-10 animate-slide-up">
          <h1 className="text-3xl font-bold text-pink-500 mb-2">
            照片墙 📷
          </h1>
          <p className="text-pink-400">每一张照片都是一个故事</p>
        </div>

        {/* Upload button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="kitty-btn flex items-center gap-2"
          >
            {showUpload ? "取消" : "📸 上传照片"}
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
                  placeholder="照片描述（可选）🎀"
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleUpload}
                  className="text-sm text-pink-400"
                />
                {uploading && <p className="text-pink-400 text-sm">上传中...</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!hasPhotos ? (
          <div className="text-center py-20 text-pink-400">
            <p className="text-6xl mb-4">📸</p>
            <p className="text-lg">还没有照片，快去上传吧~</p>
          </div>
        ) : (
          <>
            {/* Standalone photos */}
            {photos.length > 0 && (
              <div className="mb-10">
                <h2 className="text-lg font-bold text-pink-500 mb-4 flex items-center gap-2">
                  📌 我的照片
                </h2>
                <div className="columns-2 md:columns-3 gap-4 space-y-4">
                  {photos.map((photo, i) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, scale: 0.9 }}
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
                        <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full">
                          置顶
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => togglePin(photo)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                            photo.pinned
                              ? "bg-pink-500 text-white"
                              : "bg-white/80 text-pink-500"
                          }`}
                          title={photo.pinned ? "取消置顶" : "置顶"}
                        >
                          📌
                        </button>
                        <button
                          onClick={() => handleDelete(photo.id)}
                          className="w-7 h-7 rounded-full bg-white/80 text-pink-400 flex items-center justify-center text-xs"
                          title="删除"
                        >
                          ✕
                        </button>
                      </div>
                      {photo.description && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-pink-500/60 to-transparent p-3 rounded-b-lg">
                          <p className="text-white text-xs font-medium">
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
                <h2 className="text-lg font-bold text-pink-500 mb-4 flex items-center gap-2">
                  💕 回忆里的照片
                </h2>
                <div className="columns-2 md:columns-3 gap-4 space-y-4">
                  {memoryPhotos.map((photo, i) => (
                    <motion.div
                      key={`m-${i}`}
                      initial={{ opacity: 0, scale: 0.9 }}
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
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-pink-500/60 to-transparent p-3 rounded-b-lg">
                        <p className="text-white text-xs font-medium truncate">
                          {photo.title}
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
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <motion.img
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            src={selectedPhoto}
            alt=""
            className="max-w-full max-h-full rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
