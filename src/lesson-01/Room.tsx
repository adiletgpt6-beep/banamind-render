// Класс: ковёр с узором, стены с деревянной панелью, окно с лучами света,
// книжный шкаф, растение, пылинки в луче. Текстура ковра рисуется на canvas.
import { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import type { V3 } from "./motion";

const carpetTexture = () => {
  const size = 512;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d")!;
  g.fillStyle = "#2d5b9a";
  g.fillRect(0, 0, size, size);
  // ромбы в две полосы, точки между ними — как на ковре исходника
  for (let row = 0; row < 2; row++) {
    const cy = size * (0.25 + 0.5 * row);
    for (let i = 0; i < 4; i++) {
      const cx = size * (0.125 + 0.25 * i);
      g.fillStyle = "#3a6cb0";
      g.beginPath();
      g.moveTo(cx, cy - 46);
      g.lineTo(cx + 64, cy);
      g.lineTo(cx, cy + 46);
      g.lineTo(cx - 64, cy);
      g.closePath();
      g.fill();
      g.fillStyle = "#2d5b9a";
      g.beginPath();
      g.moveTo(cx, cy - 24);
      g.lineTo(cx + 34, cy);
      g.lineTo(cx, cy + 24);
      g.lineTo(cx - 34, cy);
      g.closePath();
      g.fill();
      g.fillStyle = "#d9c58c";
      g.beginPath();
      g.arc(cx, cy, 8, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.arc(cx + size * 0.125, cy + size * 0.25, 5, 0, Math.PI * 2);
      g.fill();
    }
  }
  // лёгкая «ворсистость»
  for (let i = 0; i < 2600; i++) {
    const x = random(`cx${i}`) * size;
    const y = random(`cy${i}`) * size;
    g.fillStyle = random(`cc${i}`) > 0.5 ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.06)";
    g.fillRect(x, y, 2, 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(7, 5);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

const WALL = "#f2e6cf";
const PANEL = "#a66b3b";
const BOOK_COLORS = ["#d9534f", "#3b7dd8", "#4fae5a", "#f0a63a", "#8c5fc9", "#2bb3a8", "#e4713f", "#f2c14e", "#5b6ee1", "#c9434f"];

const Bookshelf: React.FC<{ readonly position: V3 }> = ({ position }) => {
  const books = useMemo(() => {
    const out: { shelf: number; x: number; w: number; h: number; color: string; tilt: number }[] = [];
    for (let shelf = 0; shelf < 4; shelf++) {
      let x = -0.72;
      let i = 0;
      while (x < 0.64) {
        const key = `b${shelf}-${i}`;
        const w = 0.07 + random(`${key}w`) * 0.07;
        const h = 0.22 + random(`${key}h`) * 0.12;
        const gap = random(`${key}g`) > 0.85 ? 0.08 : 0.006;
        out.push({ shelf, x: x + w / 2, w, h, color: BOOK_COLORS[Math.floor(random(`${key}c`) * BOOK_COLORS.length)], tilt: random(`${key}t`) > 0.9 ? -0.18 : 0 });
        x += w + gap;
        i++;
      }
    }
    return out;
  }, []);
  return (
    <group position={position}>
      <mesh position={[0, 1.15, -0.02]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 2.3, 0.36]} />
        <meshStandardMaterial color="#7d4f25" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.15, 0.0]}>
        <boxGeometry args={[1.58, 2.18, 0.3]} />
        <meshStandardMaterial color="#5c3817" roughness={0.95} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, 0.2 + i * 0.5, 0.02]} castShadow receiveShadow>
          <boxGeometry args={[1.58, 0.04, 0.32]} />
          <meshStandardMaterial color="#8a5a2b" roughness={0.85} />
        </mesh>
      ))}
      {books.map((b, i) => (
        <mesh key={i} position={[b.x, 0.22 + b.shelf * 0.5 + b.h / 2, 0.03]} rotation={[0, 0, b.tilt]} castShadow>
          <boxGeometry args={[b.w, b.h, 0.22]} />
          <meshStandardMaterial color={b.color} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
};

const Plant: React.FC<{ readonly position: V3 }> = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.22, 0.16, 0.4, 20]} />
      <meshStandardMaterial color="#c8724a" roughness={0.9} />
    </mesh>
    {[
      [0, 0.75, 0, 0.3],
      [-0.2, 0.62, 0.1, 0.22],
      [0.2, 0.66, -0.08, 0.24],
      [0.05, 0.95, 0.12, 0.2],
      [-0.1, 0.9, -0.15, 0.18],
    ].map(([x, y, z, r], i) => (
      <mesh key={i} position={[x, y, z]} castShadow>
        <sphereGeometry args={[r, 18, 14]} />
        <meshStandardMaterial color={i % 2 ? "#4f9a4a" : "#5fae55"} roughness={0.85} />
      </mesh>
    ))}
  </group>
);

/** Пылинки в солнечном луче — плавают по синусоидам, от кадра. */
const Dust: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const motes = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        x: -1.5 + random(`dx${i}`) * 4.5,
        y: 0.2 + random(`dy${i}`) * 2.4,
        z: -2.8 + random(`dz${i}`) * 3.6,
        a: 0.04 + random(`da${i}`) * 0.1,
        p: random(`dp${i}`) * 6.28,
        q: random(`dq${i}`) * 6.28,
        r: 0.004 + random(`dr${i}`) * 0.006,
      })),
    [],
  );
  return (
    <group>
      {motes.map((m, i) => (
        <mesh key={i} position={[m.x + m.a * Math.sin(frame * 0.012 + m.p), m.y + m.a * 0.6 * Math.sin(frame * 0.009 + m.q), m.z + m.a * Math.cos(frame * 0.01 + m.p)]}>
          <sphereGeometry args={[m.r, 6, 5]} />
          <meshBasicMaterial color="#fff4d6" transparent opacity={0.35 + 0.3 * Math.sin(frame * 0.05 + m.q)} />
        </mesh>
      ))}
    </group>
  );
};

export const Room: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const carpet = useMemo(carpetTexture, []);
  return (
    <group>
      {/* пол-ковёр */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1, 0, -0.5]} receiveShadow>
        <planeGeometry args={[16, 12]} />
        <meshStandardMaterial map={carpet} roughness={1} />
      </mesh>
      {/* задняя стена, панель, плинтус */}
      <mesh position={[1, 2.2, -3.6]} receiveShadow>
        <boxGeometry args={[18, 4.4, 0.2]} />
        <meshStandardMaterial color={WALL} roughness={0.95} />
      </mesh>
      <mesh position={[1, 0.5, -3.49]} receiveShadow>
        <boxGeometry args={[18, 1.0, 0.04]} />
        <meshStandardMaterial color={PANEL} roughness={0.8} />
      </mesh>
      <mesh position={[1, 1.03, -3.47]}>
        <boxGeometry args={[18, 0.06, 0.06]} />
        <meshStandardMaterial color="#c58a52" roughness={0.8} />
      </mesh>
      {/* боковые стены */}
      <mesh position={[-5.5, 2.2, -0.5]} receiveShadow>
        <boxGeometry args={[0.2, 4.4, 12]} />
        <meshStandardMaterial color={WALL} roughness={0.95} />
      </mesh>
      <mesh position={[7.5, 2.2, -0.5]} receiveShadow>
        <boxGeometry args={[0.2, 4.4, 12]} />
        <meshStandardMaterial color={WALL} roughness={0.95} />
      </mesh>
      {/* окно: рама, стекло, переплёт, подоконник */}
      <group position={[1.6, 2.15, -3.48]}>
        <mesh castShadow>
          <boxGeometry args={[2.1, 1.7, 0.12]} />
          <meshStandardMaterial color="#fbfaf5" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[1.9, 1.5]} />
          <meshBasicMaterial color="#8fc6f2" />
        </mesh>
        <mesh position={[0, 0.35, 0.03]}>
          <planeGeometry args={[1.9, 0.8]} />
          <meshBasicMaterial color="#e8f4ff" transparent opacity={0.55} />
        </mesh>
        <mesh position={[0, 0, 0.07]}>
          <boxGeometry args={[0.07, 1.5, 0.05]} />
          <meshStandardMaterial color="#fbfaf5" />
        </mesh>
        <mesh position={[0, 0, 0.07]}>
          <boxGeometry args={[1.9, 0.07, 0.05]} />
          <meshStandardMaterial color="#fbfaf5" />
        </mesh>
        <mesh position={[0, -0.9, 0.1]} castShadow receiveShadow>
          <boxGeometry args={[2.3, 0.08, 0.3]} />
          <meshStandardMaterial color="#f3eee2" roughness={0.7} />
        </mesh>
        {/* солнечные лучи из окна — полупрозрачные плоскости */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[-0.9 - i * 0.35, -1.3, 1.6 + i * 0.2]} rotation={[-0.95, -0.35, 0.1]}>
            <planeGeometry args={[1.4 - i * 0.2, 5.5]} />
            <meshBasicMaterial color="#ffe7b0" transparent opacity={0.055 - i * 0.012} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
      {/* картина-рамка с полумесяцем-орнаментом */}
      <group position={[4.4, 2.3, -3.47]}>
        <mesh castShadow>
          <boxGeometry args={[0.9, 0.7, 0.05]} />
          <meshStandardMaterial color="#8a5a2b" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[0.78, 0.58]} />
          <meshStandardMaterial color="#2f5b8f" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.02, 0.04]} rotation={[0, 0, 0.4]}>
          <torusGeometry args={[0.17, 0.035, 10, 32, Math.PI * 1.4]} />
          <meshStandardMaterial color="#f0c960" metalness={0.4} roughness={0.5} />
        </mesh>
      </group>
      <Bookshelf position={[-2.6, 0, -3.3]} />
      <Plant position={[5.6, 0, -2.9]} />
      <Dust frame={frame} />
    </group>
  );
};
