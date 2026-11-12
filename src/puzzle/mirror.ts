import { type Axis, type Vec3, axisOf, mapAxes } from "./vector";

export type Mirror = {
  axes: [Axis, Axis];
  sign: 1 | -1;
};

export const reflect = (direction: Vec3, { axes: [a, b], sign }: Mirror) => {
  return mapAxes((axis) => {
    if (axis === a) return sign * direction[b];
    if (axis === b) return sign * direction[a];
    return direction[axis];
  });
};

export const mirrorBetween = (incoming: Vec3, outgoing: Vec3) => {
  const a = axisOf(incoming);
  const b = axisOf(outgoing);

  return {
    axes: a < b ? [a, b] : [b, a],
    sign: incoming[a] * outgoing[b] > 0 ? 1 : -1,
  } satisfies Mirror;
};

export const mirrorNormal = ({ axes: [a, b], sign }: Mirror) => {
  return mapAxes((axis) => {
    if (axis === a) return Math.SQRT1_2;
    if (axis === b) return -sign * Math.SQRT1_2;
    return 0;
  });
};
