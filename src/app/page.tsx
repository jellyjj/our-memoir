"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { FloatingHearts, KittyDecorCorner, HelloKittyBow } from "@/components/HelloKitty";
import { motion, AnimatePresence } from "framer-motion";

interface Memory {
  id: number;
  title: string;
  content: string;
  date: string;
  photos: string;
  createdAt: string;
}

const START_DATE = new Date("2025-10-20");

export default function TimelinePage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", content: "", date: "", photos: [] as string[] });
  const [uploading, setUploading] = useState(false);

  const daysTogether = Math.floor(
    (Date.now() - START_DATE.getTime()) / (1000 * 60 * 60 * 24)
  );

  useEffect(() => {
    fetch("/api/memories")
      .then((r) => r.json())
      .then(setMemories);
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);

    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      urls.push(data.url);
    }

    setForm((f) => ({ ...f, photos: [...f.photos, ...urls] }));
    setUploading(false);
  };

  const resetForm = () => {
    setForm({ title: "", content: "", date: "", photos: [] });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (memory: Memory) => {
    setForm({
      title: memory.title,
      content: memory.content || "",
      date: memory.date.slice(0, 10),
      photos: JSON.parse(memory.photos),
    });
    setEditingId(memory.id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.date) return;

    if (editingId) {
      await fetch("/api/memories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editingId }),
      });
    } else {
      await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }

    resetForm();
    const data = await fetch("/api/memories").then((r) => r.json());
    setMemories(data);
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/memories?id=${id}`, { method: "DELETE" });
    setMemories((m) => m.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen pb-20">
      <Navigation />
      <FloatingHearts />
      <KittyDecorCorner position="bottom-right" />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10 animate-slide-up">
          <h1 className="text-3xl font-bold text-pink-500 mb-2">
            我们的故事 🌸
          </h1>
          <p className="text-pink-400">
            已经在一起 <span className="text-2xl font-bold text-pink-500">{daysTogether}</span> 天啦 💕
          </p>
        </div>

        {/* Add button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
            className="kitty-btn flex items-center gap-2"
          >
            {showForm ? "取消" : "✨ 添加新回忆"}
          </button>
        </div>

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="kitty-card p-6 space-y-4">
                <input
                  className="kitty-input w-full"
                  placeholder="回忆标题 🎀"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <textarea
                  className="kitty-input w-full h-24 resize-none"
                  placeholder="记录一下这个美好时刻..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                />
                <input
                  type="date"
                  className="kitty-input w-full"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
                <div>
                  <label className="block text-pink-500 text-sm mb-2">上传照片</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUpload}
                    className="text-sm text-pink-400"
                  />
                  {uploading && <p className="text-pink-400 text-sm mt-1">上传中...</p>}
                  {form.photos.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {form.photos.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt=""
                          className="w-16 h-16 object-cover rounded-lg border-2 border-pink-200"
                        />
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={handleSubmit} className="kitty-btn w-full">
                  {editingId ? "更新回忆 💖" : "保存回忆 💖"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 timeline-line rounded-full" />

          {memories.length === 0 ? (
            <div className="text-center py-20 text-pink-400">
              <p className="text-6xl mb-4">🎀</p>
              <p className="text-lg">还没有回忆，快去添加第一个吧~</p>
            </div>
          ) : (
            memories.map((memory, index) => (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-16 pb-8"
              >
                {/* Timeline dot */}
                <div className="absolute left-4 top-2 w-5 h-5 bg-pink-400 rounded-full border-4 border-white shadow-md z-10 flex items-center justify-center">
                  <HelloKittyBow size={12} />
                </div>

                <div className="kitty-card p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-pink-400 bg-pink-50 px-2 py-1 rounded-full">
                      📅 {new Date(memory.date).toLocaleDateString("zh-CN")}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(memory)}
                        className="text-pink-300 hover:text-pink-500 text-sm"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(memory.id)}
                        className="text-pink-300 hover:text-pink-500 text-sm"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-pink-600 mb-1">
                    {memory.title}
                  </h3>
                  {memory.content && (
                    <p className="text-pink-500 text-sm mb-3">{memory.content}</p>
                  )}
                  {JSON.parse(memory.photos).length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {JSON.parse(memory.photos).map((url: string, i: number) => (
                        <div key={i} className="kitty-frame relative overflow-hidden">
                          <img
                            src={url}
                            alt=""
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
