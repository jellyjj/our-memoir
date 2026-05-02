"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { FloatingHearts, HelloKittyLogo } from "@/components/HelloKitty";
import { motion, AnimatePresence } from "framer-motion";

interface MissYouRecord {
  id: number;
  fromWho: string;
  message: string | null;
  timestamp: string;
}

interface Stats {
  total: number;
  fromA: number;
  fromB: number;
}

export default function MissYouPage() {
  const [records, setRecords] = useState<MissYouRecord[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, fromA: 0, fromB: 0 });
  const [selectedWho, setSelectedWho] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [showBurst, setShowBurst] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchData = () => {
    fetch("/api/miss-you")
      .then((r) => r.json())
      .then((data) => {
        setRecords(data.records);
        setStats(data.stats);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMiss = async (fromWho: string) => {
    if (loading) return;
    setLoading(true);
    setSelectedWho(fromWho);

    await fetch("/api/miss-you", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromWho, message: message || null }),
    });

    setShowBurst(true);
    setMessage("");
    setTimeout(() => setShowBurst(false), 1500);

    fetchData();
    setLoading(false);
  };

  return (
    <div className="min-h-screen pb-20">
      <Navigation />
      <FloatingHearts />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-10 animate-slide-up">
          <h1 className="text-3xl font-bold text-pink-500 mb-2">
            想你了 💕
          </h1>
          <p className="text-pink-400">每一下点击都是满满的思念</p>
        </div>

        {/* Big buttons */}
        <div className="grid grid-cols-2 gap-6 mb-10">
          {["A", "B"].map((who) => (
            <motion.button
              key={who}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleMiss(who)}
              className={`relative kitty-card p-8 flex flex-col items-center gap-3 cursor-pointer transition-all ${
                selectedWho === who ? "ring-4 ring-pink-400" : ""
              }`}
            >
              <div className="animate-pulse-heart">
                <HelloKittyLogo size={60} />
              </div>
              <span className="text-pink-600 font-bold text-lg">
                {who === "A" ? "航林" : "佳钰"}
              </span>
              <span className="text-pink-400 text-sm">想 TA 了就按一下</span>
              <span className="text-3xl font-bold text-pink-500">
                {who === "A" ? stats.fromA : stats.fromB}
              </span>
              <span className="text-xs text-pink-300">次想念</span>

              {/* Heart burst animation */}
              <AnimatePresence>
                {showBurst && selectedWho === who && (
                  <>
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{
                          opacity: 1,
                          scale: 0,
                          x: 0,
                          y: 0,
                        }}
                        animate={{
                          opacity: 0,
                          scale: 1,
                          x: (Math.random() - 0.5) * 200,
                          y: (Math.random() - 0.5) * 200,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute text-2xl pointer-events-none"
                      >
                        💕
                      </motion.div>
                    ))}
                  </>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>

        {/* Optional message */}
        <div className="kitty-card p-4 mb-8">
          <div className="flex gap-3">
            <input
              className="kitty-input flex-1 text-sm"
              placeholder="想说点什么吗？（可选）"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="kitty-card p-6 mb-8 text-center">
          <h2 className="text-lg font-bold text-pink-500 mb-4">想念统计 📊</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-3xl font-bold text-pink-500">{stats.total}</p>
              <p className="text-xs text-pink-400">总想念次数</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-pink-400">{stats.fromA}</p>
              <p className="text-xs text-pink-400">航林想佳钰</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-pink-400">{stats.fromB}</p>
              <p className="text-xs text-pink-400">佳钰想航林</p>
            </div>
          </div>
          {stats.total > 0 && (
            <div className="mt-4">
              <div className="h-3 bg-pink-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-pink-400 transition-all"
                  style={{ width: `${(stats.fromA / stats.total) * 100}%` }}
                />
                <div
                  className="bg-pink-300 transition-all"
                  style={{ width: `${(stats.fromB / stats.total) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-pink-400 mt-1">
                <span>A</span>
                <span>B</span>
              </div>
            </div>
          )}
        </div>

        {/* Recent records */}
        <div className="kitty-card p-6">
          <h2 className="text-lg font-bold text-pink-500 mb-4">
            最近的想念 💭
          </h2>
          {records.length === 0 ? (
            <p className="text-center text-pink-400 py-4">
              还没有记录，快去按一下吧~
            </p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {records.map((record, i) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl"
                >
                  <span className="text-xl">💕</span>
                  <div className="flex-1">
                    <p className="text-sm text-pink-600">
                      <span className="font-bold">{record.fromWho === "A" ? "航林" : "佳钰"}</span>
                      {" "}想 TA 了
                    </p>
                    {record.message && (
                      <p className="text-xs text-pink-400 mt-0.5">
                        &ldquo;{record.message}&rdquo;
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-pink-300 whitespace-nowrap">
                    {new Date(record.timestamp).toLocaleString("zh-CN", {
                      month: "numeric",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
