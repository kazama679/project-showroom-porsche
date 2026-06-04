"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Html, OrbitControls } from "@react-three/drei";
import { useTranslations } from "next-intl";
import {
  Box3,
  Color,
  Group,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Vector3,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

type CarModel3DViewerProps = {
  modelUrl: string;
  paintColorHex?: string;
  paintMaterialTarget?: string;
  wheelMeshName?: string;
  wheelVariantKey?: string;
  partVisibility?: PartVisibility;
  className?: string;
};

type LoadedModelProps = Omit<CarModel3DViewerProps, "className">;
type ToggleablePartKey =
  | "wing"
  | "frontBumper"
  | "rearBumper"
  | "sideSkirts"
  | "hood"
  | "trunk";
type PartVisibility = Record<ToggleablePartKey, boolean>;
type ObjectTransformSnapshot = {
  position: [number, number, number];
  rotation: [number, number, number];
};

const PART_TOGGLES: Array<{
  key: ToggleablePartKey;
  label: string;
  patterns: string[];
}> = [
  { key: "wing", label: "Cánh gió", patterns: ["detachwing"] },
  { key: "frontBumper", label: "Cản trước", patterns: ["detachbumperf"] },
  { key: "rearBumper", label: "Cản sau", patterns: ["detachbumperb"] },
  {
    key: "sideSkirts",
    label: "Side skirt",
    patterns: ["detachskirtl", "detachskirtr"],
  },
  { key: "hood", label: "Nắp capo", patterns: ["detachhood"] },
  { key: "trunk", label: "Nắp cốp", patterns: ["detachtrunk"] },
];

const DEFAULT_PART_VISIBILITY: PartVisibility = {
  wing: true,
  frontBumper: true,
  rearBumper: true,
  sideSkirts: true,
  hood: true,
  trunk: true,
};

function normalize(value?: string | null) {
  return (value || "").toLowerCase().replace(/[\s_-]+/g, "");
}

function meshName(mesh: Mesh) {
  const material = Array.isArray(mesh.material)
    ? mesh.material[0]
    : mesh.material;
  return `${mesh.name} ${material?.name || ""}`;
}

function shouldPaint(mesh: Mesh, target?: string) {
  const normalizedTarget = normalize(target);
  const name = normalize(meshName(mesh));

  if (normalizedTarget && name.includes(normalizedTarget)) return true;
  if (
    /(wheel|rim|tire|tyre|brake|disc|glass|window|light|lamp|chrome)/.test(name)
  )
    return false;
  return /(body|paint|carbody|vehiclebody|exterior|shell|chassis)/.test(name);
}

function isWheel(mesh: Mesh) {
  return /(wheel|rim|tire|tyre)/.test(normalize(meshName(mesh)));
}

function toggleablePartKey(object: Object3D): ToggleablePartKey | null {
  const name = normalize(object.name);
  const matched = PART_TOGGLES.find((part) =>
    part.patterns.some((pattern) => name.includes(pattern)),
  );
  return matched?.key ?? null;
}

function isTopLevelToggleablePart(
  object: Object3D,
  partKey: ToggleablePartKey,
) {
  let parent = object.parent;
  while (parent) {
    if (toggleablePartKey(parent) === partKey) return false;
    parent = parent.parent;
  }
  return true;
}

function snapshotTransform(object: Object3D): ObjectTransformSnapshot {
  const saved = object.userData.initialTransform as
    | ObjectTransformSnapshot
    | undefined;
  if (saved) return saved;

  const snapshot: ObjectTransformSnapshot = {
    position: [object.position.x, object.position.y, object.position.z],
    rotation: [object.rotation.x, object.rotation.y, object.rotation.z],
  };
  object.userData.initialTransform = snapshot;
  return snapshot;
}

function restoreTransform(object: Object3D, snapshot: ObjectTransformSnapshot) {
  object.position.set(...snapshot.position);
  object.rotation.set(...snapshot.rotation);
}

function applyOpenHoodTransform(
  object: Object3D,
  snapshot: ObjectTransformSnapshot,
) {
  restoreTransform(object, snapshot);
  object.rotation.x = snapshot.rotation[0] + 0.62;
  object.position.y = snapshot.position[1] - 0.68;
  object.position.z = snapshot.position[2] + 0.35;
}

function wheelColor(variant?: string) {
  const normalized = normalize(variant);
  if (
    normalized.includes("sport") ||
    normalized.includes("turbo") ||
    normalized.includes("rs")
  )
    return "#111111";
  if (normalized.includes("classic")) return "#c8c8c8";
  if (
    normalized.includes("large") ||
    normalized.includes("21") ||
    normalized.includes("20")
  )
    return "#34383d";
  return "#4c4f54";
}

function cloneMaterial(mesh: Mesh) {
  if (Array.isArray(mesh.material)) {
    mesh.material = mesh.material.map((material) => material.clone());
    return;
  }
  mesh.material = mesh.material.clone();
}

function forEachStandardMaterial(
  mesh: Mesh,
  callback: (material: MeshStandardMaterial) => void,
) {
  const materials = Array.isArray(mesh.material)
    ? mesh.material
    : [mesh.material];
  materials.forEach((material) => {
    if (material instanceof MeshStandardMaterial) {
      callback(material);
    }
  });
}

function prepareScene(root: Group) {
  root.traverse((object: Object3D) => {
    if (object instanceof Mesh) {
      cloneMaterial(object);
    }
  });

  const box = new Box3().setFromObject(root);
  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  const maxAxis = Math.max(size.x, size.y, size.z) || 1;
  const scale = 4.2 / maxAxis;

  root.position.sub(center);
  root.scale.setScalar(scale);
  return root;
}

function ProceduralCarModel({
  paintColorHex,
  wheelVariantKey,
}: {
  paintColorHex?: string;
  wheelVariantKey?: string;
}) {
  const paintColor = paintColorHex || "#D5001C";
  const rimColor = wheelColor(wheelVariantKey);

  return (
    <group position={[0, -0.55, 0]} rotation={[0, Math.PI, 0]}>
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[3.9, 0.62, 1.32]} />
        <meshStandardMaterial
          color={paintColor}
          metalness={0.55}
          roughness={0.32}
        />
      </mesh>
      <mesh position={[-0.42, 0.75, 0]}>
        <boxGeometry args={[1.55, 0.58, 1.04]} />
        <meshStandardMaterial
          color={paintColor}
          metalness={0.5}
          roughness={0.34}
        />
      </mesh>
      <mesh position={[-0.42, 0.91, 0]}>
        <boxGeometry args={[1.32, 0.28, 0.9]} />
        <meshStandardMaterial
          color="#151719"
          metalness={0.25}
          roughness={0.18}
          transparent
          opacity={0.72}
        />
      </mesh>
      <mesh position={[1.45, 0.3, 0]}>
        <boxGeometry args={[0.86, 0.22, 1.18]} />
        <meshStandardMaterial
          color={paintColor}
          metalness={0.52}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[-1.55, 0.28, 0]}>
        <boxGeometry args={[0.76, 0.2, 1.16]} />
        <meshStandardMaterial
          color={paintColor}
          metalness={0.52}
          roughness={0.3}
        />
      </mesh>

      {[
        [-1.25, -0.2, -0.72],
        [1.25, -0.2, -0.72],
        [-1.25, -0.2, 0.72],
        [1.25, -0.2, 0.72],
      ].map(([x, y, z]) => (
        <group
          key={`${x}-${z}`}
          position={[x, y, z]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <mesh>
            <cylinderGeometry args={[0.34, 0.34, 0.18, 48]} />
            <meshStandardMaterial color="#101010" roughness={0.45} />
          </mesh>
          <mesh position={[0, 0.095, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.035, 32]} />
            <meshStandardMaterial
              color={rimColor}
              metalness={0.8}
              roughness={0.22}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function LoadedModel({
  modelUrl,
  paintColorHex,
  paintMaterialTarget,
  wheelMeshName,
  wheelVariantKey,
  partVisibility,
}: LoadedModelProps) {
  const [scene, setScene] = useState<Group | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setScene(null);
    setError(null);

    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        if (cancelled) return;
        setScene(prepareScene(gltf.scene.clone(true)));
      },
      undefined,
      () => {
        if (!cancelled)
          setError(
            `Chưa tìm thấy file GLB tại ${modelUrl}. Đang dùng model 3D tạm để test màu và mâm.`,
          );
      },
    );

    return () => {
      cancelled = true;
    };
  }, [modelUrl]);

  useEffect(() => {
    if (!scene) return;

    scene.traverse((object: Object3D) => {
      const partKey = toggleablePartKey(object);
      if (!partKey) return;

      if (partKey === "hood") {
        object.visible = true;
        if (!isTopLevelToggleablePart(object, partKey)) return;
        const initialTransform = snapshotTransform(object);
        if (partVisibility?.hood === false) {
          applyOpenHoodTransform(object, initialTransform);
        } else {
          restoreTransform(object, initialTransform);
        }
        return;
      }

      object.visible = partVisibility?.[partKey] ?? true;
    });

    const selectedWheelName = normalize(wheelMeshName);
    let hasMatchingWheelMesh = false;

    scene.traverse((object: Object3D) => {
      if (!(object instanceof Mesh) || !isWheel(object)) return;
      const name = normalize(meshName(object));
      if (selectedWheelName && name.includes(selectedWheelName)) {
        hasMatchingWheelMesh = true;
      }
    });

    scene.traverse((object: Object3D) => {
      if (!(object instanceof Mesh)) return;

      const partKey = toggleablePartKey(object);
      if (partKey && partKey !== "hood") {
        object.visible = partVisibility?.[partKey] ?? true;
      }

      if (paintColorHex && shouldPaint(object, paintMaterialTarget)) {
        forEachStandardMaterial(object, (material) => {
          material.color = new Color(paintColorHex);
          material.metalness = Math.max(material.metalness, 0.45);
          material.roughness = Math.min(material.roughness || 0.35, 0.38);
          material.needsUpdate = true;
        });
      }

      if (isWheel(object)) {
        const name = normalize(meshName(object));
        object.visible =
          !hasMatchingWheelMesh ||
          !selectedWheelName ||
          name.includes(selectedWheelName);
        forEachStandardMaterial(object, (material) => {
          material.color = new Color(
            wheelColor(wheelVariantKey || wheelMeshName),
          );
          material.metalness = 0.75;
          material.roughness = 0.24;
          material.needsUpdate = true;
        });
      }
    });
  }, [
    paintColorHex,
    paintMaterialTarget,
    partVisibility,
    scene,
    wheelMeshName,
    wheelVariantKey,
  ]);

  if (error) {
    return (
      <>
        <ProceduralCarModel
          paintColorHex={paintColorHex}
          wheelVariantKey={wheelVariantKey || wheelMeshName}
        />
        <Html position={[0, 1.8, 0]} center>
          <div className="w-inventory-sidebar rounded-lg bg-white/95 p-3 text-center text-xs text-near-black shadow-xl">
            {error}
          </div>
        </Html>
      </>
    );
  }

  if (!scene) {
    return (
      <Html center>
        <div className="rounded-full bg-white/90 px-4 py-2 text-sm text-near-black shadow">
          Đang tải model 3D...
        </div>
      </Html>
    );
  }

  return <primitive object={scene} />;
}

export function CarModel3DViewer({
  modelUrl,
  paintColorHex,
  paintMaterialTarget,
  wheelMeshName,
  wheelVariantKey,
  className,
}: CarModel3DViewerProps) {
  const t = useTranslations("configurator");
  const camera = useMemo(
    () => ({ position: [4.6, 2.1, 5.2] as [number, number, number], fov: 38 }),
    [],
  );
  const [partVisibility, setPartVisibility] = useState<PartVisibility>(
    DEFAULT_PART_VISIBILITY,
  );

  const togglePart = (part: ToggleablePartKey) => {
    setPartVisibility((current) => ({
      ...current,
      [part]: !current[part],
    }));
  };

  return (
    <div className={className}>
      <Canvas camera={camera} dpr={[1, 2]} gl={{ antialias: true }}>
        <color attach="background" args={["#f3f3f3"]} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 6, 4]} intensity={2.2} />
        <Suspense fallback={null}>
          <LoadedModel
            modelUrl={modelUrl}
            paintColorHex={paintColorHex}
            paintMaterialTarget={paintMaterialTarget}
            wheelMeshName={wheelMeshName}
            wheelVariantKey={wheelVariantKey}
            partVisibility={partVisibility}
          />
          <Environment preset="city" />
        </Suspense>
        <OrbitControls
          enablePan={false}
          minDistance={3.2}
          maxDistance={8}
          target={[0, 0, 0]}
        />
      </Canvas>
      <div className="absolute bottom-4 left-4 z-20 max-w-modal-wide rounded-2xl bg-white/92 p-2 shadow-lg backdrop-blur">
        <div className="mb-1 px-2 text-micro-label font-medium uppercase tracking-section-label text-neutral-500">
          {t("testBodyParts")}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => togglePart("hood")}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              partVisibility.hood
                ? "border-black bg-black text-white"
                : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-500"
            }`}
          >
            {partVisibility.hood ? t("openHood") : t("closeHood")}
          </button>
        </div>
      </div>
    </div>
  );
}
