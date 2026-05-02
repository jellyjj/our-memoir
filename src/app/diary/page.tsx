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
  { value: "happy", label: "开心", emoji: "😊" },
  { value: "love", label: "甜蜜", emoji: "🥰" },
  { value: "excited", label: "兴奋", emoji: "🤩" },
  { value: "miss", label: "想念", emoji: "🥺" },
  { value: "grateful", label: "感恩", emoji: "🙏" },
  { value: "angry", label: "小生气", emoji: "😤" },
  { value: "sad", label: "难过", emoji: "😢" },
];

const getMoodEmoji = (mood: string) =>
  moods.find((m) => m.value === mood)?.emoji || "😊";

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
          <h1 className="text-3xl font-bold text-pink-500 mb-2">
            我们的日记 📝
          </h1>
          <p className="text-pink-400">记录每一天的心情</p>
        </div>

        <div className="flex justify-center mb-8">
          <button
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
            className="kitty-btn flex items-center gap-2"
          >
            {showForm ? "取消" : "✏️ 写日记"}
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
                  placeholder="日记标题 🎀"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <textarea
                  className="kitty-input w-full h-32 resize-none"
                  placeholder="今天想说点什么..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                />
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-pink-500 text-sm mb-1">日期</label>
                    <input
                      type="date"
                      className="kitty-input w-full text-sm"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-pink-500 text-sm mb-1">谁写的</label>
                    <select
                      className="kitty-input w-full text-sm"
                      value={form.author}
                      onChange={(e) => setForm({ ...form, author: e.target.value })}
                    >
                      <option value="A">航林</option>
                      <option value="B">佳钰</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-pink-500 text-sm mb-1">心情</label>
                    <select
                      className="kitty-input w-full text-sm"
                      value={form.mood}
                      onChange={(e) => setForm({ ...form, mood: e.target.value })}
                    >
                      {moods.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.emoji} {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button onClick={handleSubmit} className="kitty-btn w-full">
                  {editingId ? "更新日记 💖" : "保存日记 💖"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Diary list */}
        {diaries.length === 0 ? (
          <div className="text-center py-20 text-pink-400">
            <p className="text-6xl mb-4">📖</p>
            <p className="text-lg">还没有日记，写下今天的心情吧~</p>
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
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getMoodEmoji(diary.mood)}</span>
                    <div>
                      <h3 className="text-lg font-bold text-pink-600">
                        {diary.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-pink-400">
                        <span>
                          📅 {new Date(diary.date).toLocaleDateString("zh-CN")}
                        </span>
                        <span className="bg-pink-100 px-2 py-0.5 rounded-full">
                          {diary.author === "A" ? "航林" : "佳钰"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(diary)}
                      className="text-pink-300 hover:text-pink-500 text-sm"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(diary.id)}
                      className="text-pink-300 hover:text-pink-500 text-sm"
                    >
                      删除
                    </button>
                  </div>
                </div>
                <p className="text-pink-500 text-sm leading-relaxed whitespace-pre-wrap">
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
