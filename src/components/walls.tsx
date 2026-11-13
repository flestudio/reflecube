import type { FC } from "react";

import { DIRECTIONS, keyOf, scale } from "../puzzle/vector";
import { facing, toPoint } from "../scene/space";
import { GRID_COLOR, WALL_COLOR } from "../scene/theme";

const LINE = 0.08;
const LIFT = 0.002;

type WallsProps = {
  size: number;
};

export const Walls: FC<WallsProps> = ({ size }) => {
  const half = size / 2;
  const ticks = [...Array(size - 1)].map((_, i) => i + 1 - half);
  const grid = <meshBasicMaterial color={GRID_COLOR} />;

  return DIRECTIONS.map((direction) => (
    <group
      key={keyOf(direction)}
      position={toPoint(scale(direction, half))}
      quaternion={facing(scale(direction, -1))}
    >
      <mesh>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial color={WALL_COLOR} />
      </mesh>

      {ticks.map((tick) => (
        <group key={tick} position={[0, 0, LIFT]}>
          <mesh position={[tick, 0, 0]}>
            <planeGeometry args={[LINE, size]} />
            {grid}
          </mesh>
          <mesh position={[0, tick, 0]}>
            <planeGeometry args={[size, LINE]} />
            {grid}
          </mesh>
        </group>
      ))}
    </group>
  ));
};
