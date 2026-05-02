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

// SVG 心形路径，用于 clip-path 和边框
const HEART_PATH = `M 12.5 28
  C 12.5 28 2 20 2 12
  C 2 6 6 2 11 2
  C 14 2 17 4 18.5 7
  C 20 4 23 2 26 2
  C 31 2 35 6 35 12
  C 35 20 24.5 28 12.5 28 Z`;

export default function LoveTree({ photos, onPhotoClick }: LoveTreeProps) {
  const count = photos.length;
  if (count === 0) return null;

  // 尺寸随照片数量增长
  const size = Math.min(56, 46 + Math.log2(Math.max(count, 1)) * 2);
  const gap = Math.min(12, 8 + Math.log2(Math.max(count, 1)) * 0.8);
  const trunkHeight = Math.min(200, 80 + count * 0.3);
  const scale = 1 + Math.min(count, 200) * 0.0008;

  return (
    <div className="mb-8">
      <h2 className="font-serif text-xl font-bold text-rose-500 text-center mb-2">
        爱情树
      </h2>
      <p className="text-center text-rose-400 text-sm mb-4 font-serif">
        每一张照片都让这棵树更加茂盛 · 共 {count} 张
      </p>

      {/* 隐藏 SVG 用于定义 clipPath */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <clipPath id="heartClip" clipPathUnits="objectBoundingBox">
            <path d={HEART_PATH} transform={`scale(${1 / 37}, ${1 / 30})`} />
          </clipPath>
        </defs>
      </svg>

      <div className="flex justify-center">
        <div
          className="love-tree-wrap relative"
          style={{ transform: `scale(${scale})`, transition: "transform 1s ease-out" }}
        >
          {/* 照片树冠 */}
          <div
            className="flex flex-wrap justify-center"
            style={{ gap: `${gap}px`, padding: `0 ${gap}px` }}
          >
            <AnimatePresence>
              {photos.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 22,
                    delay: Math.min(i * 0.02, 0.5),
                  }}
                  className="love-leaf relative cursor-pointer"
                  style={{ width: size, height: size * 0.82 }}
                  onClick={() => onPhotoClick(photo.url)}
                  title={photo.description || ""}
                >
                  {/* 心形边框 */}
                  <svg
                    viewBox="0 0 37 30"
                    className="absolute inset-0 w-full h-full z-10 pointer-events-none"
                    fill="none"
                  >
                    <path
                      d={HEART_PATH}
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                    />
                    <path
                      d={HEART_PATH}
                      fill="none"
                      stroke="#FDA4AF"
                      strokeWidth="1"
                    />
                  </svg>
                  {/* 照片（心形裁剪） */}
                  <img
                    src={photo.url}
                    alt={photo.description || ""}
                    className="w-full h-full"
                    style={{
                      clipPath: `path('${HEART_PATH}')`,
                      objectFit: "cover",
                    }}
                    loading="lazy"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* 树干 */}
          <svg
            viewBox="0 0 120 100"
            className="w-24 md:w-32 mx-auto block"
            style={{ height: trunkHeight }}
          >
            <path
              d="M 58 100 C 56 80 50 60 48 45 C 46 30 55 15 50 5"
              stroke="#A0522D"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 62 100 C 64 80 68 60 67 45 C 66 30 60 20 62 8"
              stroke="#8B4513"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
            {/* 左树枝 */}
            <path
              d="M 52 55 C 40 48 30 38 22 28"
              stroke="#A0522D"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
            />
            {/* 右树枝 */}
            <path
              d="M 63 50 C 75 42 85 35 92 25"
              stroke="#8B4513"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
            />
            {/* 小树枝 */}
            <path
              d="M 50 70 C 42 65 35 58 28 50"
              stroke="#A0522D"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 65 65 C 73 58 80 52 88 45"
              stroke="#8B4513"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            {/* 树根爱心 */}
            <text
              x="58"
              y="98"
              textAnchor="middle"
              fontSize="14"
              fill="#E11D48"
            >
              ♥
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}
