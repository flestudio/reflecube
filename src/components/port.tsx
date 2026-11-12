import { Edges } from "@react-three/drei";
import type { FC } from "react";

import { inward } from "../puzzle/board";
import { type Vec3, axisOf } from "../puzzle/vector";
import { portToWorld, sizeAlong } from "../scene/space";
import { CORE_COLOR, HULL_COLOR, type Tone } from "../scene/theme";

type PortProps = {
  port: Vec3;
  size: number;
  tone: Tone;
  cored: boolean;
};

export const Port: FC<PortProps> = ({ port, size, tone, cored }) => {
  const axis = axisOf(inward(port, size));

  return (
    <group position={portToWorld(port, size)}>
      <mesh>
        <boxGeometry args={sizeAlong(axis, 0.16, 0.9)} />
        <meshBasicMaterial color={HULL_COLOR} />
      </mesh>

      <mesh>
        <boxGeometry args={sizeAlong(axis, 0.26, 0.6)} />
        <meshBasicMaterial color={tone.fill} />
        <Edges color={tone.stroke} />
      </mesh>

      {cored && (
        <mesh>
          <boxGeometry args={sizeAlong(axis, 0.34, 0.3)} />
          <meshBasicMaterial color={CORE_COLOR} />
        </mesh>
      )}
    </group>
  );
};
