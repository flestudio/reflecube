import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { type FC, type ReactNode, useRef } from "react";
import type { Camera, Group } from "three";

import { type Mino, centerOf } from "../puzzle/mino";
import { scale } from "../puzzle/vector";
import { toPoint } from "../scene/space";
import { Lights } from "./lights";
import { MinoMesh } from "./mino-mesh";

const VISIBLE_UNITS = 4;

type MinoPreviewProps = {
  mino: Mino;
  visible: boolean;
  boardCamera: Camera | null;
};

type SyncedProps = {
  boardCamera: Camera | null;
  children: ReactNode;
};

const Synced: FC<SyncedProps> = ({ boardCamera, children }) => {
  const group = useRef<Group>(null);
  const unit = useThree(({ size }) => Math.min(size.width, size.height) / VISIBLE_UNITS);

  useFrame(() => {
    if (group.current === null || boardCamera === null) return;
    group.current.quaternion.copy(boardCamera.quaternion).invert();
  });

  return (
    <group ref={group} scale={unit}>
      {children}
    </group>
  );
};

export const MinoPreview: FC<MinoPreviewProps> = ({ mino, visible, boardCamera }) => {
  const center = centerOf(mino.map(({ offset }) => offset));

  return (
    <Canvas
      flat
      orthographic
      dpr={[1, 2]}
      frameloop={visible ? "always" : "demand"}
      camera={{ position: [0, 0, 500], far: 1000 }}
    >
      <Lights />

      {visible && (
        <Synced boardCamera={boardCamera}>
          <group position={toPoint(scale(center, -1))}>
            <MinoMesh mino={mino} lit={[]} ghost={false} />
          </group>
        </Synced>
      )}
    </Canvas>
  );
};
