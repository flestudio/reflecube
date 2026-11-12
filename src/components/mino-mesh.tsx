import { Edges } from "@react-three/drei";
import type { FC } from "react";

import { type Mino, jointsOf } from "../puzzle/mino";
import { mirrorQuaternion, sizeAlong, toPoint } from "../scene/space";
import { CORE_COLOR, toneOf } from "../scene/theme";

const HULL = 0.92;
const MIRROR_WIDTH = HULL * Math.SQRT2 * 0.9;
const MIRROR_HEIGHT = HULL * 0.9;
const MIRROR_THICKNESS = 0.05;
const IDLE_OPACITY = 0.28;
const LIT_OPACITY = 0.45;
const GHOST_FADE = 0.4;

type MinoMeshProps = {
  mino: Mino;
  lit: number[][];
  ghost: boolean;
};

export const MinoMesh: FC<MinoMeshProps> = ({ mino, lit, ghost }) => {
  const fade = ghost ? GHOST_FADE : 1;
  const idle = toneOf([]);

  return (
    <group>
      {mino.map(({ offset, tile }, i) => {
        const lasers = lit.at(i) ?? [];
        const tone = toneOf(lasers);
        const opacity = lasers.length > 0 ? LIT_OPACITY : IDLE_OPACITY;

        return (
          <group key={i} position={toPoint(offset)}>
            {tile !== null && (
              <mesh quaternion={mirrorQuaternion(tile)}>
                <boxGeometry args={[MIRROR_WIDTH, MIRROR_HEIGHT, MIRROR_THICKNESS]} />
                <meshBasicMaterial color={CORE_COLOR} transparent={ghost} opacity={fade} />
              </mesh>
            )}

            <mesh renderOrder={1}>
              <boxGeometry args={[HULL, HULL, HULL]} />
              <meshLambertMaterial
                color={tone.fill}
                transparent
                opacity={opacity * fade}
                depthWrite={false}
              />
              <Edges color={tone.stroke} lineWidth={2} transparent opacity={fade} renderOrder={1} />
            </mesh>
          </group>
        );
      })}

      {jointsOf(mino.map(({ offset }) => offset)).map(({ center, axis }, i) => (
        <mesh key={i} position={toPoint(center)} renderOrder={1}>
          <boxGeometry args={sizeAlong(axis, 1 - HULL, HULL)} />
          <meshLambertMaterial
            color={idle.fill}
            transparent
            opacity={IDLE_OPACITY * fade}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
};
