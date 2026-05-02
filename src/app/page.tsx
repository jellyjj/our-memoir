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

function PlusIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function PencilIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  );
}

function TrashIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
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

function EmptyIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" opacity={0.3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

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
          <h1 className="font-script text-4xl text-rose-500 mb-3">
            Our Story
          </h1>
          <p className="text-rose-400 text-lg font-serif">
            Together for <span className="text-3xl font-bold text-rose-500">{daysTogether}</span> days
          </p>
        </div>

        {/* Add button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
            className="kitty-btn flex items-center gap-2 cursor-pointer"
          >
            {showForm ? "Cancel" : <><PlusIcon /> New Memory</>}
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
                  placeholder="Memory title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <textarea
                  className="kitty-input w-full h-24 resize-none"
                  placeholder="Write about this moment..."
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
                  <label className="block text-rose-500 text-sm mb-2 font-serif">Upload photos</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUpload}
                    className="text-sm text-rose-400 cursor-pointer"
                  />
                  {uploading && <p className="text-rose-400 text-sm mt-1">Uploading...</p>}
                  {form.photos.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {form.photos.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt=""
                          className="w-16 h-16 object-cover rounded-lg border-2 border-rose-200"
                        />
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={handleSubmit} className="kitty-btn w-full cursor-pointer">
                  {editingId ? "Update Memory" : "Save Memory"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 timeline-line rounded-full" />

          {memories.length === 0 ? (
            <div className="text-center py-20 text-rose-300">
              <EmptyIcon className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg font-serif">No memories yet — add your first one!</p>
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
                <div className="absolute left-4 top-2 w-5 h-5 bg-rose-400 rounded-full border-4 border-white shadow-md z-10 flex items-center justify-center">
                  <HelloKittyBow size={12} />
                </div>

                <div className="kitty-card p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-rose-400 bg-rose-50 px-3 py-1 rounded-full font-serif">
                      {new Date(memory.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(memory)}
                        className="text-rose-300 hover:text-rose-500 text-sm cursor-pointer transition-colors duration-200 flex items-center gap-1"
                      >
                        <PencilIcon className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(memory.id)}
                        className="text-rose-300 hover:text-rose-500 text-sm cursor-pointer transition-colors duration-200 flex items-center gap-1"
                      >
                        <TrashIcon className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-rose-600 mb-1 font-serif">
                    {memory.title}
                  </h3>
                  {memory.content && (
                    <p className="text-rose-500 text-sm mb-3 leading-relaxed">{memory.content}</p>
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
