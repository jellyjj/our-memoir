"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HelloKittyLogo, FloatingHearts } from "@/components/HelloKitty";

function LockIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
}

// Fireworks canvas
function Fireworks({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: {
      x: number; y: number; vx: number; vy: number;
      color: string; alpha: number; size: number; decay: number;
    }[] = [];

    const colors = ["#E11D48", "#FB7185", "#F43F5E", "#FFD700", "#FF69B4", "#FDA4AF", "#FF1493", "#FFB6C1"];

    function burst(cx: number, cy: number) {
      for (let i = 0; i < 60; i++) {
        const angle = (Math.PI * 2 * i) / 60;
        const speed = 2 + Math.random() * 4;
        particles.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          size: 2 + Math.random() * 3,
          decay: 0.012 + Math.random() * 0.015,
        });
      }
    }

    // Initial bursts
    burst(canvas.width * 0.3, canvas.height * 0.35);
    burst(canvas.width * 0.7, canvas.height * 0.3);
    burst(canvas.width * 0.5, canvas.height * 0.25);

    let frame = 0;
    function loop() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Add new bursts periodically
      frame++;
      if (frame % 25 === 0 && frame < 120) {
        burst(
          canvas.width * (0.2 + Math.random() * 0.6),
          canvas.height * (0.15 + Math.random() * 0.4)
        );
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03; // gravity
        p.vx *= 0.99;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (particles.length > 0) {
        animRef.current = requestAnimationFrame(loop);
      }
    }

    loop();
  }, []);

  useEffect(() => {
    if (active) {
      animate();
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [active, animate]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none"
    />
  );
}

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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
        setSuccess(true);
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1800);
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
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
      <FloatingHearts />
      <Fireworks active={success} />

      {/* Success overlay */}
      {success && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-rose-500/10 backdrop-blur-sm animate-fade-in">
          <div className="text-center animate-bounce-in">
            <p className="font-script text-5xl text-rose-500 mb-2">Welcome Home</p>
            <p className="text-rose-400 text-lg font-serif">进入我们的小天地</p>
          </div>
        </div>
      )}

      <div className={`w-full max-w-sm animate-slide-up transition-all duration-500 ${success ? "scale-95 opacity-0" : ""}`}>
        <div className="kitty-card p-8">
          <div className="flex flex-col items-center mb-8">
            <HelloKittyLogo size={80} />
            <h1 className="font-script text-3xl text-rose-500 mt-4">
              Our Memoir
            </h1>
            <p className="text-rose-400 text-sm mt-1 font-serif">
              输入密码进入我们的小天地
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-300">
                <LockIcon className="w-5 h-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="kitty-input w-full text-center pl-10"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-rose-400 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="kitty-btn w-full py-3 text-lg disabled:opacity-50 cursor-pointer"
            >
              {loading ? "验证中..." : "进入"}
            </button>
          </form>
        </div>

        <p className="text-center text-rose-300 text-xs mt-6 font-serif">
          Made with love for us
        </p>
      </div>
    </div>
  );
}
