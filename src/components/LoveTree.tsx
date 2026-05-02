"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Photo {
  id: number;
  url: string;
  description: string | null;
}

interface LoveTreeProps {
  photos: Photo[];
  onPhotoClick: (url: string) => void;
}

// 每片叶子的位置
const LEAF_POSITIONS = [
  // Tier 0: 顶部
  { x: 200, y: 55 },
  // Tier 1: 上层
  { x: 148, y: 102 },
  { x: 252, y: 102 },
  // Tier 2: 中上层
  { x: 100, y: 152 },
  { x: 200, y: 135 },
  { x: 300, y: 152 },
  // Tier 3: 中层
  { x: 65, y: 202 },
  { x: 155, y: 185 },
  { x: 245, y: 185 },
  { x: 335, y: 202 },
  // Tier 4: 最大
  { x: 35, y: 255 },
  { x: 108, y: 238 },
  { x: 175, y: 248 },
  { x: 225, y: 248 },
  { x: 292, y: 238 },
  { x: 365, y: 255 },
];

// 树枝路径：[显示所需最少照片数, SVG path]
const BRANCHES: [number, string][] = [
  // 主干
  [1, "M 195 420 C 193 380 190 330 195 285 C 200 240 198 170 200 115 C 201 90 200 68 200 55"],
  // 1: 主干到顶部左
  [2, "M 200 115 C 190 108 172 105 148 102"],
  // 2: 主干到顶部右
  [3, "M 200 115 C 210 108 228 105 252 102"],
  // 3: 左枝干
  [4, "M 195 180 C 170 172 135 162 100 152"],
  // 4: 左上小枝
  [5, "M 155 170 C 165 162 178 155 200 135"],
  // 5: 右枝干
  [6, "M 205 180 C 230 172 265 162 300 152"],
  // 6: 左大枝
  [7, "M 148 200 C 120 205 90 205 65 202"],
  // 7: 左内枝
  [8, "M 155 192 C 155 188 155 186 155 185"],
  // 8: 右内枝
  [9, "M 245 192 C 245 188 245 186 245 185"],
  // 9: 右大枝
  [10, "M 252 200 C 280 205 310 205 335 202"],
  // 10: 最左枝
  [11, "M 65 210 C 52 230 40 248 35 255"],
  // 11: 左中枝
  [12, "M 100 218 C 103 226 106 234 108 238"],
  // 12: 左内大枝
  [13, "M 155 215 C 162 228 168 242 175 248"],
  // 13: 右内大枝
  [14, "M 245 215 C 238 228 232 242 225 248"],
  // 14: 右中枝
  [15, "M 300 218 C 297 226 294 234 292 238"],
  // 15: 最右枝
  [16, "M 335 210 C 348 230 360 248 365 255"],
];

const LEAF_SIZE = 44;

export default function LoveTree({ photos, onPhotoClick }: LoveTreeProps) {
  const count = photos.length;
  if (count === 0) return null;

  const visibleLeaves = Math.min(count, LEAF_POSITIONS.length);

  return (
    <div className="mb-8">
      <h2 className="font-serif text-xl font-bold text-rose-500 text-center mb-4">
        爱情树
      </h2>
      <p className="text-center text-rose-400 text-sm mb-3 font-serif">
        {count < LEAF_POSITIONS.length
          ? `每一张照片都让这棵树更加茂盛 (${count}/${LEAF_POSITIONS.length})`
          : `这棵爱情树已经枝繁叶茂啦 (${count} 张照片)`}
      </p>
      <div className="flex justify-center">
        <svg
          viewBox="0 0 400 450"
          className="w-full max-w-md h-auto love-tree-svg"
        >
          <defs>
            <linearGradient id="trunkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D2691E" />
              <stop offset="100%" stopColor="#8B4513" />
            </linearGradient>
            <filter id="leafShadow">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#E11D48" floodOpacity="0.25" />
            </filter>
            <clipPath id="leafCircle">
              <circle cx="0" cy="0" r={LEAF_SIZE / 2 - 1} />
            </clipPath>
          </defs>

          {/* 地面装饰 */}
          <ellipse cx="200" cy="425" rx="80" ry="8" fill="#FECDD3" opacity="0.5" />

          {/* 树枝 */}
          {BRANCHES.map(([minPhotos, d], i) => (
            <path
              key={`branch-${i}`}
              d={d}
              stroke="url(#trunkGrad)"
              strokeWidth={minPhotos === 1 ? 14 : minPhotos <= 3 ? 7 : 5}
              fill="none"
              strokeLinecap="round"
              opacity={count >= minPhotos ? 1 : 0}
              style={{ transition: "opacity 1s ease-out" }}
            />
          ))}

          {/* 底部爱心 */}
          <text x="200" y="438" textAnchor="middle" fontSize="16" fill="#E11D48">
            ♥
          </text>

          {/* 装饰小花 */}
          {count >= 5 && (
            <>
              <circle cx="168" cy="225" r="4" fill="#FECDD3" opacity="0.7" className="animate-sway" />
              <circle cx="232" cy="225" r="4" fill="#FECDD3" opacity="0.7" className="animate-sway-delay" />
            </>
          )}
          {count >= 10 && (
            <>
              <circle cx="80" cy="240" r="3.5" fill="#FBBF24" opacity="0.6" className="animate-sway-delay" />
              <circle cx="320" cy="240" r="3.5" fill="#FBBF24" opacity="0.6" className="animate-sway" />
              <circle cx="200" cy="160" r="4" fill="#F9A8D4" opacity="0.6" className="animate-sway" />
            </>
          )}
          {count >= 15 && (
            <>
              <circle cx="50" cy="270" r="3" fill="#FECDD3" opacity="0.5" className="animate-sway-delay" />
              <circle cx="350" cy="270" r="3" fill="#FECDD3" opacity="0.5" className="animate-sway" />
              <circle cx="130" cy="170" r="3.5" fill="#FBBF24" opacity="0.5" className="animate-sway" />
              <circle cx="270" cy="170" r="3.5" fill="#FBBF24" opacity="0.5" className="animate-sway-delay" />
            </>
          )}

          {/* 照片叶子 */}
          <AnimatePresence>
            {photos.slice(0, visibleLeaves).map((photo, i) => {
              const pos = LEAF_POSITIONS[i];
              return (
                <motion.g
                  key={photo.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: i * 0.05,
                  }}
                  className="love-leaf"
                  style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
                >
                  {/* 照片圆形 */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={LEAF_SIZE / 2}
                    fill="white"
                    filter="url(#leafShadow)"
                    className="cursor-pointer"
                    onClick={() => onPhotoClick(photo.url)}
                  />
                  <image
                    href={photo.url}
                    x={pos.x - LEAF_SIZE / 2 + 2}
                    y={pos.y - LEAF_SIZE / 2 + 2}
                    width={LEAF_SIZE - 4}
                    height={LEAF_SIZE - 4}
                    clipPath="url(#leafCircle)"
                    style={{
                      transformOrigin: `${pos.x}px ${pos.y}px`,
                      cursor: "pointer",
                    }}
                    onClick={() => onPhotoClick(photo.url)}
                    preserveAspectRatio="xMidYMid slice"
                  />
                </motion.g>
              );
            })}
          </AnimatePresence>
        </svg>
      </div>
    </div>
  );
}
