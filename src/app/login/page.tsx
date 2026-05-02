"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HelloKittyLogo, FloatingHearts } from "@/components/HelloKitty";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("密码错误，请重试");
      }
    } catch {
      setError("出了点问题，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <FloatingHearts />

      <div className="w-full max-w-sm animate-slide-up">
        <div className="kitty-card p-8">
          <div className="flex flex-col items-center mb-6">
            <HelloKittyLogo size={80} />
            <h1 className="text-2xl font-bold text-pink-500 mt-3">
              我们的回忆 💕
            </h1>
            <p className="text-pink-400 text-sm mt-1">
              输入密码进入我们的小天地
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="kitty-input w-full text-center"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="kitty-btn w-full py-3 text-lg disabled:opacity-50"
            >
              {loading ? "验证中..." : "进入 💖"}
            </button>
          </form>
        </div>

        <p className="text-center text-pink-300 text-xs mt-4">
          Made with 💕 for us
        </p>
      </div>
    </div>
  );
}
