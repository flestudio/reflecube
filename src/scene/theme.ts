export type Tone = {
  fill: string;
  stroke: string;
};

const IDLE_TONE = { fill: "#9ba5ad", stroke: "#828c94" } satisfies Tone;
const BOTH_TONE = { fill: "#ffffff", stroke: "#dddddd" } satisfies Tone;

export const LASER_TONES = [
  { fill: "#2fd6f5", stroke: "#00bfe6" },
  { fill: "#ffe14d", stroke: "#f5c800" },
] satisfies Tone[];

export const HULL_COLOR = "#c2c8cc";
export const WALL_COLOR = "#48505e";
export const GRID_COLOR = "#414958";
export const FRAME_COLOR = "#ffffff";
export const CORE_COLOR = "#ffffff";

export const toneOf = (lasers: number[]) => {
  const [first, second] = lasers;
  if (first === undefined) return IDLE_TONE;
  if (second !== undefined) return BOTH_TONE;

  return LASER_TONES.at(first) ?? IDLE_TONE;
};
