"use client";

export function HelloKittyLogo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="55" rx="35" ry="30" fill="white" stroke="#FDA4AF" strokeWidth="2"/>
      <ellipse cx="38" cy="52" rx="3" ry="4" fill="#1a1a1a"/>
      <ellipse cx="62" cy="52" rx="3" ry="4" fill="#1a1a1a"/>
      <ellipse cx="50" cy="58" rx="2.5" ry="2" fill="#F59E0B"/>
      <line x1="15" y1="50" x2="35" y2="53" stroke="#1a1a1a" strokeWidth="1.5"/>
      <line x1="15" y1="57" x2="35" y2="57" stroke="#1a1a1a" strokeWidth="1.5"/>
      <line x1="15" y1="64" x2="35" y2="61" stroke="#1a1a1a" strokeWidth="1.5"/>
      <line x1="85" y1="50" x2="65" y2="53" stroke="#1a1a1a" strokeWidth="1.5"/>
      <line x1="85" y1="57" x2="65" y2="57" stroke="#1a1a1a" strokeWidth="1.5"/>
      <line x1="85" y1="64" x2="65" y2="61" stroke="#1a1a1a" strokeWidth="1.5"/>
      <path d="M25 25 Q35 15 45 25 Q35 35 25 25Z" fill="#E11D48"/>
      <path d="M55 25 Q65 15 75 25 Q65 35 55 25Z" fill="#E11D48"/>
      <circle cx="50" cy="25" r="5" fill="#BE123C"/>
      <ellipse cx="22" cy="30" rx="8" ry="12" fill="white" stroke="#FDA4AF" strokeWidth="2"/>
      <ellipse cx="78" cy="30" rx="8" ry="12" fill="white" stroke="#FDA4AF" strokeWidth="2"/>
    </svg>
  );
}

export function HelloKittyBow({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" fill="none" className={className}>
      <path d="M5 20 Q15 5 25 20 Q15 35 5 20Z" fill="#E11D48"/>
      <path d="M25 20 Q35 5 45 20 Q35 35 25 20Z" fill="#E11D48"/>
      <circle cx="25" cy="20" r="5" fill="#BE123C"/>
    </svg>
  );
}

function HeartSvg({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
    </svg>
  );
}

function FlowerSvg({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2a3 3 0 0 0-3 3c0 1.1.6 2.1 1.5 2.6A5 5 0 0 0 7 10a3 3 0 0 0 0 6 5 5 0 0 0 3.5 2.4A3 3 0 0 0 9 21a3 3 0 0 0 6 0 3 3 0 0 0-1.5-2.6A5 5 0 0 0 17 16a3 3 0 0 0 0-6 5 5 0 0 0-3.5-2.4A3 3 0 0 0 15 5a3 3 0 0 0-3-3Z" />
    </svg>
  );
}

export function FloatingHearts() {
  const shapes = [
    { type: "heart", color: "text-rose-300" },
    { type: "flower", color: "text-rose-200" },
    { type: "heart", color: "text-rose-200" },
    { type: "flower", color: "text-rose-300" },
    { type: "heart", color: "text-rose-100" },
    { type: "flower", color: "text-rose-200" },
    { type: "heart", color: "text-rose-300" },
    { type: "flower", color: "text-rose-100" },
    { type: "heart", color: "text-rose-200" },
    { type: "flower", color: "text-rose-300" },
    { type: "heart", color: "text-rose-100" },
    { type: "flower", color: "text-rose-200" },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {shapes.map((shape, i) => {
        const size = 12 + Math.random() * 16;
        return (
          <div
            key={i}
            className={`absolute animate-float ${shape.color}`}
            style={{
              left: `${5 + Math.random() * 90}%`,
              top: `${5 + Math.random() * 90}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          >
            {shape.type === "heart"
              ? <HeartSvg size={size} />
              : <FlowerSvg size={size} />
            }
          </div>
        );
      })}
    </div>
  );
}

export function KittyDecorCorner({ position = "bottom-right" }: { position?: string }) {
  const posClass = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-16 left-4",
    "bottom-right": "bottom-16 right-4",
  }[position] || "bottom-16 right-4";

  return (
    <div className={`fixed ${posClass} opacity-20 pointer-events-none z-0`}>
      <HelloKittyLogo size={80} />
    </div>
  );
}
