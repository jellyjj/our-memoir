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

const HEART = "M 12.5 28 C 12.5 28 2 20 2 12 C 2 6 6 2 11 2 C 14 2 17 4 18.5 7 C 20 4 23 2 26 2 C 31 2 35 6 35 12 C 35 20 24.5 28 12.5 28 Z";

// 每层照片数量（从底到顶）
const TIER_SIZES = [20, 14, 10, 7, 5, 3, 2, 1];

function getTiers(count: number) {
  const tiers: number[] = [];
  let remaining = count;
  let i = 0;
  while (remaining > 0) {
    const size = i < TIER_SIZES.length ? TIER_SIZES[i] : TIER_SIZES[TIER_SIZES.length - 1];
    tiers.push(Math.min(remaining, size));
    remaining -= size;
    i++;
  }
  return tiers.reverse(); // 顶部在前
}

export default function LoveTree({ photos, onPhotoClick }: LoveTreeProps) {
  const count = photos.length;
  if (count === 0) return null;

  const tiers = getTiers(count);
  const maxPerRow = Math.max(...tiers, 1);

  return (
    <div className="mb-8">
      <h2 className="font-serif text-xl font-bold text-rose-500 text-center mb-2">
        爱情树
      </h2>
      <p className="text-center text-rose-400 text-sm mb-4 font-serif">
        每一张照片都让这棵树更加茂盛 · 共 {count} 张
      </p>

      {/* 隐藏 SVG 定义 clipPath */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <clipPath id="heartClip" clipPathUnits="objectBoundingBox">
            <path d={HEART} transform="scale(0.02703, 0.03333)" />
          </clipPath>
        </defs>
      </svg>

      <div className="max-w-3xl mx-auto">
        <div className="love-tree-wrap relative">
          {/* 树冠：心形照片层 */}
          <div className="relative z-10">
            {tiers.map((tierCount, rowIdx) => (
              <div
                key={rowIdx}
                className="flex justify-center"
                style={{ gap: "5px", marginBottom: "5px" }}
              >
                {photos
                  .slice(
                    tiers.slice(0, rowIdx).reduce((s, t) => s + t, 0),
                    tiers.slice(0, rowIdx).reduce((s, t) => s + t, 0) + tierCount
                  )
                  .map((photo, i) => (
                    <LoveLeaf
                      key={photo.id}
                      photo={photo}
                      index={rowIdx * 20 + i}
                      maxPerRow={maxPerRow}
                      onClick={() => onPhotoClick(photo.url)}
                    />
                  ))}
              </div>
            ))}
          </div>

          {/* 树枝 + 树干 SVG */}
          <div className="relative z-0" style={{ marginTop: "-40px" }}>
            <svg
              viewBox="0 0 400 180"
              className="w-full"
              style={{ display: "block" }}
              preserveAspectRatio="xMidYMax meet"
            >
              {/* 树干 */}
              <path
                d="M 192 180 C 190 155 188 130 190 105 C 192 80 195 60 197 40 C 198 30 199 20 200 10"
                stroke="#8B4513"
                strokeWidth="18"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 208 180 C 210 155 212 130 210 105 C 208 80 205 60 203 40"
                stroke="#A0522D"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
              />

              {/* 主要树枝 */}
              <path d="M 195 75 C 160 58 120 45 80 35" stroke="#8B4513" strokeWidth="9" fill="none" strokeLinecap="round" />
              <path d="M 205 75 C 240 58 280 45 320 35" stroke="#A0522D" strokeWidth="9" fill="none" strokeLinecap="round" />
              <path d="M 197 55 C 170 40 140 28 110 20" stroke="#A0522D" strokeWidth="7" fill="none" strokeLinecap="round" />
              <path d="M 203 55 C 230 40 260 28 290 20" stroke="#8B4513" strokeWidth="7" fill="none" strokeLinecap="round" />
              <path d="M 199 38 C 175 25 150 15 125 8" stroke="#8B4513" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M 201 38 C 225 25 250 15 275 8" stroke="#A0522D" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M 200 22 C 185 12 165 5 150 2" stroke="#A0522D" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M 200 22 C 215 12 235 5 250 2" stroke="#8B4513" strokeWidth="4" fill="none" strokeLinecap="round" />

              {/* 小枝 */}
              <path d="M 140 50 C 125 65 105 72 85 78" stroke="#A0522D" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M 260 50 C 275 65 295 72 315 78" stroke="#8B4513" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M 120 35 C 100 50 80 58 60 65" stroke="#8B4513" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M 280 35 C 300 50 320 58 340 65" stroke="#A0522D" strokeWidth="3" fill="none" strokeLinecap="round" />

              {/* 树根 */}
              <path d="M 192 178 C 180 183 165 185 150 182" stroke="#8B4513" strokeWidth="7" fill="none" strokeLinecap="round" />
              <path d="M 208 178 C 220 183 235 185 250 182" stroke="#A0522D" strokeWidth="7" fill="none" strokeLinecap="round" />

              {/* 爱心 */}
              <text x="200" y="172" textAnchor="middle" fontSize="16" fill="#E11D48">♥</text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoveLeaf({
  photo,
  index,
  maxPerRow,
  onClick,
}: {
  photo: Photo;
  index: number;
  maxPerRow: number;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 22,
        delay: Math.min(index * 0.015, 0.4),
      }}
      className="love-leaf relative cursor-pointer shrink-0"
      style={{ width: "clamp(26px, 3.2vw, 36px)", aspectRatio: "37/30" }}
      onClick={onClick}
      title={photo.description || ""}
    >
      {/* 照片（心形裁剪） */}
      <img
        src={photo.url}
        alt={photo.description || ""}
        className="absolute inset-0 w-full h-full"
        style={{
          clipPath: `url(#heartClip)`,
          objectFit: "cover",
        }}
        loading="lazy"
      />
      {/* 心形边框 */}
      <svg
        viewBox="0 0 37 30"
        className="absolute inset-0 w-full h-full pointer-events-none"
        fill="none"
      >
        <path d={HEART} fill="none" stroke="white" strokeWidth="2" />
        <path d={HEART} fill="none" stroke="#FDA4AF" strokeWidth="0.8" />
      </svg>
    </motion.div>
  );
}
