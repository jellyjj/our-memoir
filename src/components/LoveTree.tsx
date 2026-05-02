"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

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

// 计算每张照片在树上的位置（圣诞树形状排列）
function arrangePhotos(
  count: number,
  treeH: number,
  treeW: number,
  topPad: number
) {
  if (count === 0 || treeH <= 0) return [];
  const tiers = Math.max(1, Math.min(40, Math.ceil(count / 8)));
  const positions: { x: number; y: number }[] = [];
  let placed = 0;

  for (let tier = 0; tier < tiers && placed < count; tier++) {
    // 该层在树上的相对位置（0=顶，1=底）
    const t = (tier + 0.5) / tiers;
    const rowY = topPad + t * treeH;
    // 该层宽度（三角形：顶部窄，底部宽）
    const rowW = treeW * t * 0.92;
    // 该层最多放几张（越往下越多）
    const maxInRow = Math.max(1, Math.ceil(t * tiers * 1.5));
    const inRow = Math.min(maxInRow, count - placed);
    const spacing = inRow > 1 ? rowW / (inRow - 1) : 0;

    for (let i = 0; i < inRow && placed < count; i++) {
      const x =
        inRow === 1
          ? treeW / 2 + 10
          : (treeW - rowW) / 2 + 10 + i * spacing;
      positions.push({ x, y: rowY });
      placed++;
    }
  }
  return positions;
}

// 树上的装饰小球
function ornaments(treeW: number, treeH: number, topPad: number) {
  const pts: { x: number; y: number; color: string; r: number }[] = [];
  const colors = ["#E11D48", "#FBBF24", "#A78BFA", "#FB7185", "#FDE68A"];
  for (let i = 0; i < 18; i++) {
    const t = 0.15 + Math.random() * 0.75;
    const y = topPad + t * treeH;
    const halfW = treeW * t * 0.42;
    const side = Math.random() > 0.5 ? 1 : -1;
    const x = treeW / 2 + 10 + side * (Math.random() * halfW);
    pts.push({
      x,
      y,
      color: colors[i % colors.length],
      r: 2.5 + Math.random() * 2,
    });
  }
  return pts;
}

export default function LoveTree({ photos, onPhotoClick }: LoveTreeProps) {
  const count = photos.length;
  const [grown, setGrown] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);

  // 树的尺寸（每 8 张照片长一层，最大 40 层）
  const tiers = Math.max(1, Math.min(40, Math.ceil(count / 8)));
  const treeH = tiers * 12;
  const treeW = treeH * 0.7;
  const svgW = treeW + 20;
  const svgH = treeH + 65;
  const topPad = 22;

  // 心形大小（照片越多，每颗心越小）
  const heartSize = Math.max(8, Math.round(16 / Math.pow(count / 20, 0.25)));

  // 装饰数据（useMemo 避免每次渲染重新随机）
  const decor = useMemo(
    () => ornaments(treeW, treeH, topPad),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [treeW, treeH]
  );

  // 照片位置
  const positions = useMemo(
    () => arrangePhotos(count, treeH, treeW, topPad),
    [count, treeH, treeW, topPad]
  );

  // 打开页面 → 先播放生长动画
  useEffect(() => {
    setGrown(false);
    setShowPhotos(false);
    const t1 = setTimeout(() => setGrown(true), 100);
    const t2 = setTimeout(() => setShowPhotos(true), 1200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (count === 0) return null;

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

      <div className="flex justify-center">
        {/* 树生长容器：clip 从底部往上展开 */}
        <div
          className="overflow-hidden"
          style={{
            maxHeight: grown ? svgH + 20 : 0,
            transition: "max-height 1.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        >
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            style={{ width: Math.min(svgW, 500), display: "block" }}
          >
            <defs>
              <linearGradient id="treeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C084FC" />
                <stop offset="50%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#7C3AED" />
              </linearGradient>
              <linearGradient id="trunkGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D2691E" />
                <stop offset="100%" stopColor="#8B4513" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* 圣诞树主体（粉紫色锥形） */}
            <polygon
              points={`${svgW / 2},${topPad} ${svgW / 2 - treeW / 2 - 5},${topPad + treeH} ${svgW / 2 + treeW / 2 + 5},${topPad + treeH}`}
              fill="url(#treeGrad)"
              opacity="0.85"
            />

            {/* 树枝分层（锯齿边缘） */}
            {Array.from({ length: Math.min(tiers, 40) }).map((_, i) => {
              const t = (i + 1) / Math.min(tiers, 40);
              const y = topPad + t * treeH;
              const halfW = (treeW / 2) * t;
              const cx = svgW / 2;
              return (
                <path
                  key={`layer-${i}`}
                  d={`
                    M ${cx - halfW - 3} ${y}
                    Q ${cx - halfW * 0.65} ${y - 5} ${cx - halfW * 0.3} ${y + 1}
                    Q ${cx} ${y - 3} ${cx + halfW * 0.3} ${y + 1}
                    Q ${cx + halfW * 0.65} ${y - 5} ${cx + halfW + 3} ${y}
                  `}
                  stroke="#7C3AED"
                  strokeWidth="1.5"
                  fill="none"
                  opacity="0.35"
                />
              );
            })}

            {/* 白色雪顶边缘 */}
            <polygon
              points={`${svgW / 2},${topPad - 2} ${svgW / 2 - treeW * 0.08},${topPad + treeH * 0.12} ${svgW / 2 + treeW * 0.08},${topPad + treeH * 0.12}`}
              fill="white"
              opacity="0.35"
            />

            {/* 顶部星星 */}
            <g filter="url(#glow)">
              <text
                x={svgW / 2}
                y={topPad + 2}
                textAnchor="middle"
                fontSize="18"
                fill="#FBBF24"
              >
                ★
              </text>
              <animate
                attributeName="opacity"
                values="0.8;1;0.8"
                dur="2s"
                repeatCount="indefinite"
              />
            </g>

            {/* 装饰小球 */}
            {decor.map((d, i) => (
              <g key={`orn-${i}`}>
                <circle cx={d.x} cy={d.y} r={d.r} fill={d.color} opacity="0.7" />
                <circle
                  cx={d.x - d.r * 0.3}
                  cy={d.y - d.r * 0.3}
                  r={d.r * 0.3}
                  fill="white"
                  opacity="0.5"
                />
              </g>
            ))}

            {/* 树干 */}
            <rect
              x={svgW / 2 - 8}
              y={topPad + treeH}
              width="16"
              height="35"
              rx="3"
              fill="url(#trunkGrad)"
            />
            <rect
              x={svgW / 2 - 14}
              y={topPad + treeH + 30}
              width="28"
              height="8"
              rx="4"
              fill="#8B4513"
              opacity="0.5"
            />

            {/* 底部爱心 */}
            <text
              x={svgW / 2}
              y={svgH - 2}
              textAnchor="middle"
              fontSize="14"
              fill="#E11D48"
            >
              ♥
            </text>

            {/* 照片心形（生长动画完成后显示） */}
            {showPhotos &&
              positions.map((pos, i) => (
                <motion.g
                  key={photos[i]?.id ?? `p-${i}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 22,
                    delay: Math.min(i * 0.015, 0.6),
                  }}
                  style={{
                    transformOrigin: `${pos.x}px ${pos.y}px`,
                    cursor: "pointer",
                  }}
                  onClick={() => photos[i] && onPhotoClick(photos[i].url)}
                >
                  {/* 心形白色底 */}
                  <path
                    d={HEART}
                    transform={`translate(${pos.x - heartSize}, ${pos.y - heartSize * 0.8}) scale(${heartSize / 12.5 * 0.82})`}
                    fill="white"
                  />
                  {/* 心形照片 */}
                  {photos[i] && (
                    <image
                      href={photos[i].url}
                      x={pos.x - heartSize + 1.5}
                      y={pos.y - heartSize * 0.8 + 1.5}
                      width={heartSize * 2 - 3}
                      height={heartSize * 2 - 3}
                      clipPath="url(#heartClip)"
                      preserveAspectRatio="xMidYMid slice"
                    />
                  )}
                  {/* 心形粉色边框 */}
                  <path
                    d={HEART}
                    transform={`translate(${pos.x - heartSize}, ${pos.y - heartSize * 0.8}) scale(${heartSize / 12.5 * 0.82})`}
                    fill="none"
                    stroke="#FDA4AF"
                    strokeWidth="0.6"
                  />
                </motion.g>
              ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
