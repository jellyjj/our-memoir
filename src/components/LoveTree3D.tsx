"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import type * as THREE from "three";

interface Photo {
  id: number;
  url: string;
  description: string | null;
}

interface LoveTree3DProps {
  photos: Photo[];
  onPhotoClick: (url: string) => void;
}

// 设备性能检测
function getDeviceTier() {
  if (typeof window === "undefined") return "mid";
  const ua = navigator.userAgent;
  const mobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const cores = navigator.hardwareConcurrency || 2;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;
  const dpr = window.devicePixelRatio || 1;
  if (!mobile && cores >= 8 && mem >= 8 && dpr >= 2) return "high";
  if (mobile || cores <= 4 || mem <= 4) return "low";
  return "mid";
}

// 3D 场景（仅在浏览器端加载）
async function createScene(
  container: HTMLDivElement,
  onPhotoClick: (url: string) => void
) {
  const THREE = await import("three");

  const tier = getDeviceTier();
  const isHigh = tier === "high";
  const isLow = tier === "low";

  // 性能分级配置
  const CFG = {
    particles: isHigh ? 1000 : isLow ? 300 : 600,
    snow: isHigh ? 600 : isLow ? 150 : 300,
    bloom: !isLow,
    pixelRatio: isLow ? 1 : Math.min(window.devicePixelRatio, 2),
    treeHeight: 20,
    treeRadius: 7,
    cameraZ: 45,
    photoSize: 1.5,
    fps: isLow ? 30 : 60,
  };

  // 粉紫色主题色
  const COLORS = {
    bg: 0x1a0510,
    fog: 0x1a0510,
    tree: 0xc084fc,
    treeAlt: 0xa855f7,
    gold: 0xfbbf24,
    pink: 0xfb7185,
    rose: 0xe11d48,
    snow: 0xffeeff,
  };

  // --- 场景初始化 ---
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COLORS.bg);
  scene.fog = new THREE.FogExp2(COLORS.fog, 0.012);

  const camera = new THREE.PerspectiveCamera(
    42,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 2, CFG.cameraZ);

  const renderer = new THREE.WebGLRenderer({
    antialias: !isLow,
    alpha: true,
    powerPreference: isLow ? "low-power" : "high-performance",
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(CFG.pixelRatio);
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.toneMappingExposure = 1.8;
  container.appendChild(renderer.domElement);

  const mainGroup = new THREE.Group();
  scene.add(mainGroup);

  // --- 灯光 ---
  const ambient = new THREE.AmbientLight(0xffeeff, 0.5);
  scene.add(ambient);

  const innerLight = new THREE.PointLight(0xffaadd, 1.5, 25);
  innerLight.position.set(0, 5, 0);
  mainGroup.add(innerLight);

  const spotPink = new THREE.SpotLight(0xff88cc, isLow ? 400 : 800);
  spotPink.position.set(25, 35, 30);
  spotPink.angle = 0.5;
  spotPink.penumbra = 0.5;
  scene.add(spotPink);

  const spotPurple = new THREE.SpotLight(0x8844ff, isLow ? 300 : 600);
  spotPurple.position.set(-25, 20, -25);
  scene.add(spotPurple);

  const fill = new THREE.DirectionalLight(0xffeebb, 0.5);
  fill.position.set(0, 0, 40);
  scene.add(fill);

  // --- Bloom 后处理 ---
  let composer: import("three/examples/jsm/postprocessing/EffectComposer.js").EffectComposer | null = null;
  if (CFG.bloom) {
    const { EffectComposer } = await import(
      "three/examples/jsm/postprocessing/EffectComposer.js"
    );
    const { RenderPass } = await import(
      "three/examples/jsm/postprocessing/RenderPass.js"
    );
    const { UnrealBloomPass } = await import(
      "three/examples/jsm/postprocessing/UnrealBloomPass.js"
    );
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      0.4,
      0.3,
      0.85
    );
    bloom.threshold = 0.7;
    bloom.strength = 0.35;
    bloom.radius = 0.3;
    composer.addPass(bloom);
  }

  // --- 粒子系统 ---
  const particles: {
    mesh: THREE.Object3D;
    type: string;
    posTree: THREE.Vector3;
    posScatter: THREE.Vector3;
    baseScale: number;
    spinSpeed: THREE.Vector3;
  }[] = [];

  // 材质
  const treeMat = new THREE.MeshStandardMaterial({
    color: COLORS.tree,
    metalness: 0.3,
    roughness: 0.6,
    emissive: 0x440066,
    emissiveIntensity: 0.2,
  });
  const treeAltMat = new THREE.MeshStandardMaterial({
    color: COLORS.treeAlt,
    metalness: 0.4,
    roughness: 0.5,
    emissive: 0x220044,
    emissiveIntensity: 0.3,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: COLORS.gold,
    metalness: 1.0,
    roughness: 0.1,
    emissive: 0x443300,
    emissiveIntensity: 0.3,
  });
  const pinkMat = new THREE.MeshPhysicalMaterial({
    color: COLORS.pink,
    metalness: 0.3,
    roughness: 0.2,
    clearcoat: 1.0,
    emissive: 0x330011,
  });

  const boxGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const sphereGeo = new THREE.SphereGeometry(0.4, isLow ? 12 : 24, isLow ? 12 : 24);

  // 生成树粒子
  function makeParticle(mesh: THREE.Object3D, type: string) {
    const h = CFG.treeHeight;
    const t = Math.pow(Math.random(), 0.8);
    const y = t * h - h / 2;
    const rMax = Math.max(0.5, CFG.treeRadius * (1.0 - t));
    const angle = t * 50 * Math.PI + Math.random() * Math.PI;
    const r = rMax * (0.8 + Math.random() * 0.4);
    const posTree = new THREE.Vector3(
      Math.cos(angle) * r,
      y,
      Math.sin(angle) * r
    );
    const rS = 8 + Math.random() * 12;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const posScatter = new THREE.Vector3(
      rS * Math.sin(phi) * Math.cos(theta),
      rS * Math.sin(phi) * Math.sin(theta),
      rS * Math.cos(phi)
    );
    const speedMult = 2.0;
    particles.push({
      mesh,
      type,
      posTree,
      posScatter,
      baseScale: (mesh as THREE.Mesh).scale?.x || 1,
      spinSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * speedMult,
        (Math.random() - 0.5) * speedMult,
        (Math.random() - 0.5) * speedMult
      ),
    });
    mainGroup.add(mesh);
  }

  // 树粒子
  for (let i = 0; i < CFG.particles; i++) {
    const r = Math.random();
    let mesh: THREE.Mesh;
    if (r < 0.45) {
      mesh = new THREE.Mesh(boxGeo, treeMat);
    } else if (r < 0.75) {
      mesh = new THREE.Mesh(boxGeo, treeAltMat);
    } else if (r < 0.92) {
      mesh = new THREE.Mesh(sphereGeo, goldMat);
    } else {
      mesh = new THREE.Mesh(sphereGeo, pinkMat);
    }
    const s = 0.35 + Math.random() * 0.45;
    mesh.scale.set(s, s, s);
    mesh.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    makeParticle(mesh, r < 0.75 ? "TREE" : "ORNAMENT");
  }

  // 顶部星星
  const starShape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 + Math.PI / 2;
    const rad = i % 2 === 0 ? 1.2 : 0.5;
    const x = Math.cos(angle) * rad;
    const y = Math.sin(angle) * rad;
    if (i === 0) starShape.moveTo(x, y);
    else starShape.lineTo(x, y);
  }
  starShape.closePath();
  const starGeo = new THREE.ExtrudeGeometry(starShape, {
    depth: 0.3,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.08,
    bevelSegments: 2,
  });
  starGeo.center();
  const starMat = new THREE.MeshStandardMaterial({
    color: 0xffdd88,
    emissive: 0xffaa00,
    emissiveIntensity: 1.2,
    metalness: 1.0,
    roughness: 0,
  });
  const star = new THREE.Mesh(starGeo, starMat);
  star.position.set(0, CFG.treeHeight / 2 + 1.5, 0);
  mainGroup.add(star);

  // 雪花
  const snowGeo = new THREE.BufferGeometry();
  const snowVerts: number[] = [];
  const snowSpeeds: number[] = [];
  for (let i = 0; i < CFG.snow; i++) {
    snowVerts.push(
      THREE.MathUtils.randFloatSpread(80),
      THREE.MathUtils.randFloatSpread(50),
      THREE.MathUtils.randFloatSpread(50)
    );
    snowSpeeds.push(Math.random() * 0.15 + 0.05, Math.random() * 0.04);
  }
  snowGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(snowVerts, 3)
  );
  snowGeo.setAttribute(
    "speed",
    new THREE.Float32BufferAttribute(snowSpeeds, 2)
  );
  const snowMat = new THREE.PointsMaterial({
    color: COLORS.snow,
    size: 0.35,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const snow = new THREE.Points(snowGeo, snowMat);
  scene.add(snow);

  // --- 照片系统 ---
  const photoGroup = new THREE.Group();
  mainGroup.add(photoGroup);
  const loadedPhotoIds = new Set<number>();
  const loader = new THREE.TextureLoader();

  function updatePhotoLayout() {
    const photoParticles = particles.filter((p) => p.type === "PHOTO");
    const count = photoParticles.length;
    if (count === 0) return;
    const h = CFG.treeHeight * 0.85;
    const bottomY = -h / 2;
    const stepY = h / count;
    const loops = 3;
    photoParticles.forEach((p, i) => {
      const y = bottomY + stepY * i + stepY / 2;
      const normalizedH = (y + h / 2) / CFG.treeHeight;
      const r =
        Math.max(1.0, CFG.treeRadius * (1.0 - normalizedH)) + 2.5;
      const angle = normalizedH * Math.PI * 2 * loops + Math.PI / 4;
      p.posTree.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
    });
  }

  function addPhoto(url: string, id: number) {
    if (loadedPhotoIds.has(id)) return;
    loadedPhotoIds.add(id);
    loader.load(
      url,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        const frameGeo = new THREE.BoxGeometry(
          CFG.photoSize * 1.15,
          CFG.photoSize * 1.15,
          0.04
        );
        const frameMat = new THREE.MeshStandardMaterial({
          color: COLORS.gold,
          metalness: 0.8,
          roughness: 0.15,
        });
        const frame = new THREE.Mesh(frameGeo, frameMat);

        let w = CFG.photoSize;
        let h = CFG.photoSize;
        if (texture.image) {
          const aspect = texture.image.width / texture.image.height;
          if (aspect > 1) h = w / aspect;
          else w = h * aspect;
        }
        const photoGeo = new THREE.PlaneGeometry(w, h);
        const photoMat = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.DoubleSide,
        });
        const photo = new THREE.Mesh(photoGeo, photoMat);
        photo.position.z = 0.03;

        const group = new THREE.Group();
        group.add(frame);
        group.add(photo);
        frame.scale.set(w / (CFG.photoSize * 1.15), h / (CFG.photoSize * 1.15), 1);
        group.scale.set(0.9, 0.9, 0.9);
        group.userData.url = url;
        photoGroup.add(group);

        const rS = 8 + Math.random() * 12;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        particles.push({
          mesh: group,
          type: "PHOTO",
          posTree: new THREE.Vector3(),
          posScatter: new THREE.Vector3(
            rS * Math.sin(phi) * Math.cos(theta),
            rS * Math.sin(phi) * Math.sin(theta),
            rS * Math.cos(phi)
          ),
          baseScale: 0.9,
          spinSpeed: new THREE.Vector3(
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3
          ),
        });
        updatePhotoLayout();
      },
      undefined,
      () => {} // 忽略加载失败
    );
  }

  function removePhoto(id: number) {
    if (!loadedPhotoIds.has(id)) return;
    loadedPhotoIds.delete(id);
    const idx = particles.findIndex(
      (p) => p.type === "PHOTO" && (p.mesh.userData.photoId === id)
    );
    if (idx !== -1) {
      const p = particles[idx];
      photoGroup.remove(p.mesh);
      p.mesh.traverse((child: THREE.Object3D) => {
        if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
        if ((child as THREE.Mesh).material) {
          const mat = (child as THREE.Mesh).material as THREE.Material;
          if ((mat as THREE.MeshBasicMaterial).map) (mat as THREE.MeshBasicMaterial).map?.dispose();
          mat.dispose();
        }
      });
      particles.splice(idx, 1);
      updatePhotoLayout();
    }
  }

  // --- 交互状态 ---
  const rotation = { x: 0, y: 0 };
  const touch = { active: false, lastX: 0, lastY: 0 };
  let mode: "TREE" | "SCATTER" = "TREE";

  // 触摸/鼠标拖拽
  function onPointerDown(e: PointerEvent) {
    touch.active = true;
    touch.lastX = e.clientX;
    touch.lastY = e.clientY;
  }
  function onPointerMove(e: PointerEvent) {
    if (!touch.active) return;
    rotation.y += (e.clientX - touch.lastX) * 0.005;
    rotation.x += (e.clientY - touch.lastY) * 0.002;
    rotation.x = Math.max(-0.5, Math.min(0.5, rotation.x));
    touch.lastX = e.clientX;
    touch.lastY = e.clientY;
  }
  function onPointerUp() {
    touch.active = false;
  }

  // 点击照片
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  function onClick(e: MouseEvent) {
    const rect = container.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(photoGroup.children, true);
    if (hits.length > 0) {
      // 向上找到 photoGroup 的直接子 Group
      let obj: THREE.Object3D = hits[0].object;
      while (obj.parent && obj.parent !== photoGroup) obj = obj.parent;
      const url = obj.userData?.url;
      if (url) onPhotoClick(url);
    }
  }

  // 双击切换散开/聚合
  let lastTap = 0;
  function onDblClick() {
    mode = mode === "TREE" ? "SCATTER" : "TREE";
  }
  function onTouchEnd(e: TouchEvent) {
    const now = Date.now();
    if (now - lastTap < 300) {
      mode = mode === "TREE" ? "SCATTER" : "TREE";
      e.preventDefault();
    }
    lastTap = now;
  }

  // 注册事件
  container.addEventListener("pointerdown", onPointerDown);
  container.addEventListener("pointermove", onPointerMove);
  container.addEventListener("pointerup", onPointerUp);
  container.addEventListener("pointerleave", onPointerUp);
  container.addEventListener("click", onClick);
  container.addEventListener("dblclick", onDblClick);
  container.addEventListener("touchend", onTouchEnd);

  // 窗口大小变化
  function onResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    if (composer) composer.setSize(w, h);
  }
  window.addEventListener("resize", onResize);

  // --- 动画循环 ---
  const clock = new THREE.Clock();
  let animId: number;
  let lastFrameTime = 0;
  const frameInterval = 1000 / CFG.fps;

  function animate() {
    animId = requestAnimationFrame(animate);

    // 限帧
    const now = performance.now();
    if (now - lastFrameTime < frameInterval) return;
    lastFrameTime = now;

    const dt = Math.min(clock.getDelta(), 0.05);

    // 自动旋转（拖拽时不转）
    if (!touch.active) {
      rotation.y += 0.25 * dt;
      rotation.x += (0 - rotation.x) * 1.5 * dt;
    }
    mainGroup.rotation.y = rotation.y;
    mainGroup.rotation.x = rotation.x;

    // 星星闪烁
    const starScale = 1 + Math.sin(clock.elapsedTime * 3) * 0.1;
    star.scale.set(starScale, starScale, starScale);

    // 更新粒子
    for (const p of particles) {
      const target = p.posTree;
      p.mesh.position.lerp(target, 2.5 * dt);

      if (p.type === "PHOTO") {
        p.mesh.lookAt(0, p.mesh.position.y, 0);
        p.mesh.rotateY(Math.PI);
      } else if (p.type === "ORNAMENT") {
        (p.mesh as THREE.Mesh).rotation.y += 0.8 * dt;
      }
    }

    // 雪花飘落
    const posAttr = snow.geometry.attributes.position;
    const spdAttr = snow.geometry.attributes.speed;
    for (let i = 0; i < CFG.snow; i++) {
      const y = posAttr.getY(i) - spdAttr.getX(i);
      const x =
        posAttr.getX(i) +
        Math.sin(clock.elapsedTime * 2 + i) * spdAttr.getY(i) * 0.1;
      if (y < -25) {
        posAttr.setY(i, 25);
        posAttr.setX(i, THREE.MathUtils.randFloatSpread(80));
      } else {
        posAttr.setY(i, y);
        posAttr.setX(i, x);
      }
    }
    posAttr.needsUpdate = true;

    // 渲染
    if (composer) composer.render();
    else renderer.render(scene, camera);
  }
  animate();

  // --- IntersectionObserver：离开视口暂停 ---
  let paused = false;
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && paused) {
        paused = false;
        lastFrameTime = performance.now();
        animate();
      } else if (!entry.isIntersecting && !paused) {
        paused = true;
        cancelAnimationFrame(animId);
      }
    },
    { threshold: 0.1 }
  );
  observer.observe(container);

  // 返回清理函数和照片管理方法
  return {
    addPhoto,
    removePhoto,
    destroy() {
      cancelAnimationFrame(animId);
      observer.disconnect();
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointerleave", onPointerUp);
      container.removeEventListener("click", onClick);
      container.removeEventListener("dblclick", onDblClick);
      container.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (composer) composer.dispose();
      container.removeChild(renderer.domElement);
    },
  };
}

// --- React 组件 ---
function ThreeTreeScene({ photos, onPhotoClick }: LoveTree3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Awaited<ReturnType<typeof createScene>> | null>(null);
  const prevPhotosRef = useRef<Photo[]>([]);

  // 初始化场景
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    createScene(container, onPhotoClick).then((scene) => {
      if (cancelled) {
        scene.destroy();
        return;
      }
      sceneRef.current = scene;

      // 加载初始照片
      photos.forEach((p) => scene.addPhoto(p.url, p.id));
      prevPhotosRef.current = [...photos];
    });

    return () => {
      cancelled = true;
      sceneRef.current?.destroy();
      sceneRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 照片变化时增删
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const prev = prevPhotosRef.current;
    const prevIds = new Set(prev.map((p) => p.id));
    const currIds = new Set(photos.map((p) => p.id));

    // 新增
    photos.forEach((p) => {
      if (!prevIds.has(p.id)) scene.addPhoto(p.url, p.id);
    });

    // 删除
    prev.forEach((p) => {
      if (!currIds.has(p.id)) scene.removePhoto(p.id);
    });

    prevPhotosRef.current = [...photos];
  }, [photos]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "450px", borderRadius: "1rem", overflow: "hidden" }}
    />
  );
}

// 动态导入，禁用 SSR
const LoveTree3D = dynamic(() => Promise.resolve(ThreeTreeScene), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "450px",
        borderRadius: "1rem",
        background: "linear-gradient(135deg, #1a0510 0%, #2d0a1e 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <p className="text-rose-300 font-serif animate-pulse">爱情树加载中...</p>
    </div>
  ),
});

export default LoveTree3D;
