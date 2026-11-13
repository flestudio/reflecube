import type { FC } from "react";

import { AXES, mapAxes } from "../puzzle/vector";
import { toPoint } from "../scene/space";
import { FRAME_COLOR } from "../scene/theme";

const THICKNESS = 0.05;
const SIDES = [1, -1];

type FrameProps = {
  size: number;
};

export const Frame: FC<FrameProps> = ({ size }) => {
  return AXES.flatMap((axis) => {
    const [first] = AXES.filter((other) => other !== axis);

    return SIDES.flatMap((a) => {
      return SIDES.map((b) => {
        const position = mapAxes((other) => {
          if (other === axis) return 0;
          return ((other === first ? a : b) * size) / 2;
        });
        const lengths = mapAxes((other) => (other === axis ? size + THICKNESS : THICKNESS));

        return (
          <mesh key={`${axis},${a},${b}`} position={toPoint(position)}>
            <boxGeometry args={toPoint(lengths)} />
            <meshBasicMaterial color={FRAME_COLOR} />
          </mesh>
        );
      });
    });
  });
};
