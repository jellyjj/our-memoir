"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HelloKittyLogo, FloatingHearts } from "@/components/HelloKitty";

function LockIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
}

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
        setError("Wrong password, try again");
      }
    } catch {
      setError("Something went wrong, try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <FloatingHearts />

      <div className="w-full max-w-sm animate-slide-up">
        <div className="kitty-card p-8">
          <div className="flex flex-col items-center mb-8">
            <HelloKittyLogo size={80} />
            <h1 className="font-script text-3xl text-rose-500 mt-4">
              Our Memoir
            </h1>
            <p className="text-rose-400 text-sm mt-1 font-serif">
              Enter the password to our little world
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
                placeholder="Enter password"
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
              {loading ? "Verifying..." : "Enter"}
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
