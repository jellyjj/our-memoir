"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Comment {
  id: number;
  memoryId: number;
  author: string;
  content: string;
  sticker: string | null;
  image: string | null;
  createdAt: string;
}

const AUTHOR_NAMES: Record<string, string> = { A: "航林", B: "佳钰" };
const AUTHOR_COLORS: Record<string, string> = {
  A: "from-blue-400 to-cyan-400",
  B: "from-pink-400 to-rose-400",
};
const AUTHOR_BG: Record<string, string> = {
  A: "bg-blue-50 border-blue-200",
  B: "bg-pink-50 border-pink-200",
};
const AUTHOR_TEXT: Record<string, string> = {
  A: "text-blue-600",
  B: "text-rose-600",
};

function StickerIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
    </svg>
  );
}

function ImageIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M2.25 18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V6A2.25 2.25 0 0 0 19.5 3.75h-15A2.25 2.25 0 0 0 2.25 6v12Zm13.5-9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
    </svg>
  );
}

function SendIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
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

function TrashIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  );
}

function CommentBubbleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
    </svg>
  );
}

export default function CommentSection({ memoryId }: { memoryId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [author, setAuthor] = useState<"A" | "B">("A");
  const [content, setContent] = useState("");
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [stickers, setStickers] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/comments?memoryId=${memoryId}`)
      .then((r) => r.json())
      .then(setComments)
      .finally(() => setLoadingComments(false));
  }, [memoryId]);

  const loadStickers = async () => {
    if (stickers.length === 0) {
      const data = await fetch("/api/stickers").then((r) => r.json());
      setStickers(data);
    }
    setShowStickerPicker((v) => !v);
  };

  const handleSend = async () => {
    if (!content.trim() && !selectedSticker && !selectedImage) return;
    setSending(true);

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memoryId,
        author,
        content: content.trim(),
        sticker: selectedSticker,
        image: selectedImage,
      }),
    });

    if (res.ok) {
      const newComment = await res.json();
      setComments((prev) => [...prev, newComment]);
      setContent("");
      setSelectedSticker(null);
      setSelectedImage(null);
      setShowStickerPicker(false);
    }
    setSending(false);
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/comments?id=${id}`, { method: "DELETE" });
    setComments((c) => c.filter((item) => item.id !== id));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setSelectedImage(data.url);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("zh-CN", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="mt-3 pt-3 border-t border-rose-100">
      {/* Comment list */}
      {comments.length > 0 && (
        <div className="space-y-2.5 mb-3">
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`comment-bubble border rounded-xl p-3 ${AUTHOR_BG[comment.author]}`}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className={`w-7 h-7 rounded-full bg-gradient-to-br ${AUTHOR_COLORS[comment.author]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                >
                  {AUTHOR_NAMES[comment.author]?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-bold ${AUTHOR_TEXT[comment.author]}`}>
                      {AUTHOR_NAMES[comment.author]}
                    </span>
                    <span className="text-xs text-rose-300">
                      {formatTime(comment.createdAt)}
                    </span>
                  </div>
                  {comment.content && (
                    <p className="text-sm text-rose-700 leading-relaxed break-words">
                      {comment.content}
                    </p>
                  )}
                  {comment.sticker && (
                    <img
                      src={comment.sticker}
                      alt="sticker"
                      className="max-w-[120px] max-h-[120px] rounded-lg mt-1"
                    />
                  )}
                  {comment.image && (
                    <img
                      src={comment.image}
                      alt="comment image"
                      className="max-w-[200px] max-h-[200px] rounded-lg mt-1 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(comment.image!, "_blank")}
                    />
                  )}
                </div>
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-rose-300 hover:text-rose-500 transition-colors p-1 flex-shrink-0"
                  title="删除评论"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Toggle comment input */}
      {!showInput ? (
        <button
          onClick={() => setShowInput(true)}
          className="flex items-center gap-1.5 text-rose-300 hover:text-rose-500 text-sm transition-colors cursor-pointer"
        >
          <CommentBubbleIcon className="w-4 h-4" />
          {comments.length > 0 ? `${comments.length} 条评论` : "写评论..."}
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2"
        >
          {/* Author toggle */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-rose-400 mr-1">身份:</span>
            {(["A", "B"] as const).map((who) => (
              <button
                key={who}
                onClick={() => setAuthor(who)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  author === who
                    ? `bg-gradient-to-r ${AUTHOR_COLORS[who]} text-white shadow-sm`
                    : "bg-rose-50 text-rose-400 hover:bg-rose-100"
                }`}
              >
                {AUTHOR_NAMES[who]}
              </button>
            ))}
            <button
              onClick={() => {
                setShowInput(false);
                setShowStickerPicker(false);
              }}
              className="ml-auto text-rose-300 hover:text-rose-500 transition-colors p-1 cursor-pointer"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Sticker preview */}
          <AnimatePresence>
            {selectedSticker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-block relative"
              >
                <img
                  src={selectedSticker}
                  alt="selected sticker"
                  className="max-w-[100px] max-h-[100px] rounded-lg border-2 border-rose-200"
                />
                <button
                  onClick={() => setSelectedSticker(null)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-rose-600 transition-colors"
                >
                  <CloseIcon className="w-3 h-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Image preview */}
          <AnimatePresence>
            {selectedImage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-block relative"
              >
                <img
                  src={selectedImage}
                  alt="selected image"
                  className="max-w-[150px] max-h-[150px] rounded-lg border-2 border-rose-200 object-cover"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-rose-600 transition-colors"
                >
                  <CloseIcon className="w-3 h-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sticker picker */}
          <AnimatePresence>
            {showStickerPicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="sticker-grid grid grid-cols-5 sm:grid-cols-7 gap-2 p-3 bg-rose-50/80 rounded-xl border border-rose-100 max-h-[200px] overflow-y-auto">
                  {stickers.map((url) => (
                    <button
                      key={url}
                      onClick={() => {
                        setSelectedSticker(url);
                        setShowStickerPicker(false);
                      }}
                      className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-110 hover:shadow-md ${
                        selectedSticker === url
                          ? "border-rose-500 shadow-md"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={url}
                        alt="sticker"
                        className="w-full h-auto aspect-square object-cover"
                      />
                    </button>
                  ))}
                  {stickers.length === 0 && (
                    <p className="col-span-full text-center text-rose-300 text-sm py-4">
                      还没有表情包，往 public/stickers/ 放一些吧~
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input area */}
          <div className="flex items-end gap-2">
            <div className="flex-1 flex items-end gap-1 bg-white/70 rounded-2xl border border-rose-200 px-3 py-2 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100 transition-all">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="写点什么..."
                className="flex-1 bg-transparent outline-none text-sm text-rose-700 placeholder-rose-300"
              />
              <button
                onClick={loadStickers}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  showStickerPicker
                    ? "bg-rose-100 text-rose-500"
                    : "text-rose-300 hover:text-rose-500 hover:bg-rose-50"
                }`}
                title="表情包"
              >
                <StickerIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1 rounded-lg text-rose-300 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                title="上传图片"
              >
                {uploading ? (
                  <span className="text-xs text-rose-400">...</span>
                ) : (
                  <ImageIcon className="w-5 h-5" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={sending || (!content.trim() && !selectedSticker && !selectedImage)}
              className="kitty-btn !px-3 !py-2.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
              title="发送"
            >
              <SendIcon className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
