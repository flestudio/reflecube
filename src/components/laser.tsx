import { Line } from "@react-three/drei";
import type { FC } from "react";

import type { Point } from "../scene/space";
import { CORE_COLOR, type Tone } from "../scene/theme";

const LIFT = -3000;

type LaserProps = {
  points: Point[];
  tone: Tone;
  lifted: boolean;
};

export const Laser: FC<LaserProps> = ({ points, tone, lifted }) => (
  <>
    <Line
      points={points}
      color={tone.stroke}
      lineWidth={8}
      transparent
      depthWrite={false}
      polygonOffset={lifted}
      polygonOffsetUnits={lifted ? LIFT : 0}
      renderOrder={4}
    />
    <Line
      points={points}
      color={CORE_COLOR}
      lineWidth={3}
      transparent
      depthWrite={false}
      polygonOffset={lifted}
      polygonOffsetUnits={lifted ? LIFT : 0}
      renderOrder={5}
    />
  </>
);
