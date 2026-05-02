"use client";

export function HelloKittyLogo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Face */}
      <ellipse cx="50" cy="55" rx="35" ry="30" fill="white" stroke="#FFB6C1" strokeWidth="2"/>
      {/* Left eye */}
      <ellipse cx="38" cy="52" rx="3" ry="4" fill="#1a1a1a"/>
      {/* Right eye */}
      <ellipse cx="62" cy="52" rx="3" ry="4" fill="#1a1a1a"/>
      {/* Nose */}
      <ellipse cx="50" cy="58" rx="2.5" ry="2" fill="#FFD700"/>
      {/* Whiskers left */}
      <line x1="15" y1="50" x2="35" y2="53" stroke="#1a1a1a" strokeWidth="1.5"/>
      <line x1="15" y1="57" x2="35" y2="57" stroke="#1a1a1a" strokeWidth="1.5"/>
      <line x1="15" y1="64" x2="35" y2="61" stroke="#1a1a1a" strokeWidth="1.5"/>
      {/* Whiskers right */}
      <line x1="85" y1="50" x2="65" y2="53" stroke="#1a1a1a" strokeWidth="1.5"/>
      <line x1="85" y1="57" x2="65" y2="57" stroke="#1a1a1a" strokeWidth="1.5"/>
      <line x1="85" y1="64" x2="65" y2="61" stroke="#1a1a1a" strokeWidth="1.5"/>
      {/* Bow */}
      <path d="M25 25 Q35 15 45 25 Q35 35 25 25Z" fill="#FF69B4"/>
      <path d="M55 25 Q65 15 75 25 Q65 35 55 25Z" fill="#FF69B4"/>
      <circle cx="50" cy="25" r="5" fill="#FF1493"/>
      {/* Ears */}
      <ellipse cx="22" cy="30" rx="8" ry="12" fill="white" stroke="#FFB6C1" strokeWidth="2"/>
      <ellipse cx="78" cy="30" rx="8" ry="12" fill="white" stroke="#FFB6C1" strokeWidth="2"/>
    </svg>
  );
}

export function HelloKittyBow({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" fill="none" className={className}>
      <path d="M5 20 Q15 5 25 20 Q15 35 5 20Z" fill="#FF69B4"/>
      <path d="M25 20 Q35 5 45 20 Q35 35 25 20Z" fill="#FF69B4"/>
      <circle cx="25" cy="20" r="5" fill="#FF1493"/>
    </svg>
  );
}

export function FloatingHearts() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-float opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
            fontSize: `${12 + Math.random() * 20}px`,
          }}
        >
          {["💕", "💖", "💗", "🌸", "🎀", "🩷"][i % 6]}
        </div>
      ))}
    </div>
  );
}

export function KittyDecorCorner({ position = "bottom-right" }: { position?: string }) {
  const posClass = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  }[position] || "bottom-4 right-4";

  return (
    <div className={`fixed ${posClass} opacity-30 pointer-events-none z-0`}>
      <HelloKittyLogo size={80} />
    </div>
  );
}
