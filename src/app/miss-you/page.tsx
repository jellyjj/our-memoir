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

function HeartBurstIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
    </svg>
  );
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
          <h1 className="font-script text-4xl text-rose-500 mb-2">
            I Miss You
          </h1>
          <p className="text-rose-400 text-lg">Every tap is a heartbeat of longing</p>
        </div>

        {/* Big buttons */}
        <div className="grid grid-cols-2 gap-6 mb-10">
          {["A", "B"].map((who) => (
            <motion.button
              key={who}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleMiss(who)}
              className={`relative kitty-card p-8 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200 ${
                selectedWho === who ? "ring-2 ring-rose-400" : ""
              }`}
            >
              <div className="animate-pulse-heart text-rose-400">
                <HelloKittyLogo size={60} />
              </div>
              <span className="text-rose-600 font-bold text-lg font-serif">
                {who === "A" ? "航林" : "佳钰"}
              </span>
              <span className="text-rose-400 text-sm">想 TA 了就按一下</span>
              <span className="text-3xl font-bold text-rose-500 font-serif">
                {who === "A" ? stats.fromA : stats.fromB}
              </span>
              <span className="text-xs text-rose-300">times missed</span>

              {/* Heart burst animation */}
              <AnimatePresence>
                {showBurst && selectedWho === who && (
                  <>
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                        animate={{
                          opacity: 0,
                          scale: 1,
                          x: (Math.random() - 0.5) * 200,
                          y: (Math.random() - 0.5) * 200,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute text-rose-400 pointer-events-none"
                      >
                        <HeartBurstIcon className="w-6 h-6" />
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
          <input
            className="kitty-input w-full text-sm"
            placeholder="Leave a message (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {/* Stats */}
        <div className="kitty-card p-6 mb-8 text-center">
          <h2 className="font-serif text-lg font-bold text-rose-500 mb-4">Miss Stats</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-3xl font-bold text-rose-500 font-serif">{stats.total}</p>
              <p className="text-xs text-rose-400">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-rose-400 font-serif">{stats.fromA}</p>
              <p className="text-xs text-rose-400">Hang Lin</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-rose-300 font-serif">{stats.fromB}</p>
              <p className="text-xs text-rose-400">Jia Yu</p>
            </div>
          </div>
          {stats.total > 0 && (
            <div className="mt-4">
              <div className="h-2 bg-rose-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-rose-400 transition-all duration-500"
                  style={{ width: `${(stats.fromA / stats.total) * 100}%` }}
                />
                <div
                  className="bg-rose-300 transition-all duration-500"
                  style={{ width: `${(stats.fromB / stats.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Recent records */}
        <div className="kitty-card p-6">
          <h2 className="font-serif text-lg font-bold text-rose-500 mb-4">
            Recent Longings
          </h2>
          {records.length === 0 ? (
            <p className="text-center text-rose-300 py-4">
              No records yet — go tap that heart!
            </p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {records.map((record, i) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-3 bg-rose-50/50 rounded-xl"
                >
                  <div className="text-rose-400">
                    <HeartBurstIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-rose-600">
                      <span className="font-bold">{record.fromWho === "A" ? "Hang Lin" : "Jia Yu"}</span>
                      {" "}missed their love
                    </p>
                    {record.message && (
                      <p className="text-xs text-rose-400 mt-0.5 italic">
                        &ldquo;{record.message}&rdquo;
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-rose-300 whitespace-nowrap font-serif">
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
