export type Axis = "x" | "y" | "z";
export type Vec3 = Record<Axis, number>;

export const AXES = ["x", "y", "z"] satisfies Axis[];

const withoutNegativeZero = (n: number) => n || 0;

export const vec3 = (x: number, y: number, z: number) => ({
  x: withoutNegativeZero(x),
  y: withoutNegativeZero(y),
  z: withoutNegativeZero(z),
});

export const mapAxes = (f: (axis: Axis) => number) => vec3(f("x"), f("y"), f("z"));

export const add = (a: Vec3, b: Vec3) => mapAxes((axis) => a[axis] + b[axis]);

export const scale = (v: Vec3, k: number) => mapAxes((axis) => v[axis] * k);

export const dot = (a: Vec3, b: Vec3) => AXES.reduce((sum, axis) => sum + a[axis] * b[axis], 0);

export const equals = (a: Vec3, b: Vec3) => AXES.every((axis) => a[axis] === b[axis]);

export const keyOf = ({ x, y, z }: Vec3) => `${x},${y},${z}`;

export const unit = (axis: Axis, sign: number) => {
  return mapAxes((other) => (other === axis ? sign : 0));
};

export const axisOf = (direction: Vec3) => AXES.find((axis) => direction[axis] !== 0) ?? "x";

export const DIRECTIONS = AXES.flatMap((axis) => [unit(axis, 1), unit(axis, -1)]);
