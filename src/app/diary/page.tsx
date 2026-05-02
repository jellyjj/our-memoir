"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { FloatingHearts, KittyDecorCorner } from "@/components/HelloKitty";
import { motion, AnimatePresence } from "framer-motion";

interface Diary {
  id: number;
  title: string;
  content: string;
  mood: string;
  date: string;
  author: string;
  createdAt: string;
}

const moods = [
  { value: "happy", label: "Happy", icon: "😊" },
  { value: "love", label: "Sweet", icon: "🥰" },
  { value: "excited", label: "Excited", icon: "🤩" },
  { value: "miss", label: "Missing", icon: "🥺" },
  { value: "grateful", label: "Grateful", icon: "🙏" },
  { value: "angry", label: "Upset", icon: "😤" },
  { value: "sad", label: "Sad", icon: "😢" },
];

const getMoodIcon = (mood: string) =>
  moods.find((m) => m.value === mood)?.icon || "😊";

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

function BookIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" opacity={0.3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

export default function DiaryPage() {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    mood: "happy",
    date: new Date().toISOString().slice(0, 10),
    author: "A",
  });

  useEffect(() => {
    fetch("/api/diary")
      .then((r) => r.json())
      .then(setDiaries);
  }, []);

  const resetForm = () => {
    setForm({
      title: "",
      content: "",
      mood: "happy",
      date: new Date().toISOString().slice(0, 10),
      author: "A",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.content) return;

    if (editingId) {
      await fetch("/api/diary", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editingId }),
      });
    } else {
      await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }

    resetForm();
    const data = await fetch("/api/diary").then((r) => r.json());
    setDiaries(data);
  };

  const handleEdit = (diary: Diary) => {
    setForm({
      title: diary.title,
      content: diary.content,
      mood: diary.mood,
      date: diary.date.slice(0, 10),
      author: diary.author,
    });
    setEditingId(diary.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/diary?id=${id}`, { method: "DELETE" });
    setDiaries((d) => d.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen pb-20">
      <Navigation />
      <FloatingHearts />
      <KittyDecorCorner position="bottom-right" />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-10 animate-slide-up">
          <h1 className="font-script text-4xl text-rose-500 mb-2">
            Our Diary
          </h1>
          <p className="text-rose-400 text-lg font-serif">Writing down our days</p>
        </div>

        <div className="flex justify-center mb-8">
          <button
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
            className="kitty-btn flex items-center gap-2 cursor-pointer"
          >
            {showForm ? "Cancel" : <><PlusIcon /> New Entry</>}
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
                  placeholder="Diary title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <textarea
                  className="kitty-input w-full h-32 resize-none"
                  placeholder="What's on your mind today..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                />
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-rose-500 text-sm mb-1 font-serif">Date</label>
                    <input
                      type="date"
                      className="kitty-input w-full text-sm"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-rose-500 text-sm mb-1 font-serif">Author</label>
                    <select
                      className="kitty-input w-full text-sm cursor-pointer"
                      value={form.author}
                      onChange={(e) => setForm({ ...form, author: e.target.value })}
                    >
                      <option value="A">Hang Lin</option>
                      <option value="B">Jia Yu</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-rose-500 text-sm mb-1 font-serif">Mood</label>
                    <select
                      className="kitty-input w-full text-sm cursor-pointer"
                      value={form.mood}
                      onChange={(e) => setForm({ ...form, mood: e.target.value })}
                    >
                      {moods.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.icon} {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button onClick={handleSubmit} className="kitty-btn w-full cursor-pointer">
                  {editingId ? "Update Entry" : "Save Entry"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Diary list */}
        {diaries.length === 0 ? (
          <div className="text-center py-20 text-rose-300">
            <BookIcon className="w-16 h-16 mx-auto mb-4" />
            <p className="text-lg font-serif">No entries yet — write your first one!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {diaries.map((diary, index) => (
              <motion.div
                key={diary.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="kitty-card p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getMoodIcon(diary.mood)}</span>
                    <div>
                      <h3 className="text-lg font-bold text-rose-600 font-serif">
                        {diary.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-rose-400">
                        <span className="font-serif">
                          {new Date(diary.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </span>
                        <span className="bg-rose-100 px-2 py-0.5 rounded-full text-rose-500">
                          {diary.author === "A" ? "Hang Lin" : "Jia Yu"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(diary)}
                      className="text-rose-300 hover:text-rose-500 text-sm cursor-pointer transition-colors duration-200 flex items-center gap-1"
                    >
                      <PencilIcon className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(diary.id)}
                      className="text-rose-300 hover:text-rose-500 text-sm cursor-pointer transition-colors duration-200 flex items-center gap-1"
                    >
                      <TrashIcon className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
                <p className="text-rose-500 text-sm leading-relaxed whitespace-pre-wrap font-serif">
                  {diary.content}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
