import { Edges, Line, OrbitControls } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import type { Dispatch, FC } from "react";

import { type Action, type Game, traceLasers } from "../puzzle/game";
import { minoCellsAt } from "../puzzle/mino";
import { type Vec3, equals, keyOf } from "../puzzle/vector";
import { portToWorld, toWorld } from "../scene/space";
import { CORE_COLOR, FRAME_COLOR, LASER_TONES, toneOf } from "../scene/theme";
import { Lights } from "./lights";
import { MinoMesh } from "./mino-mesh";
import { Port } from "./port";
import { Walls } from "./walls";

type BoardSceneProps = {
  game: Game;
  solved: boolean;
  ghost: Vec3 | undefined;
  dispatch: Dispatch<Action>;
};

export const BoardScene: FC<BoardSceneProps> = ({ game, solved, ghost, dispatch }) => {
  const { puzzle, positions, held } = game;
  const { size } = puzzle;
  const paths = traceLasers(game);
  const heldMino = held === undefined ? undefined : puzzle.minos.at(held);

  const lasersThrough = (cell: Vec3) => {
    return paths.flatMap(({ cells }, i) => (cells.some((lit) => equals(lit, cell)) ? [i] : []));
  };

  const lasersReaching = (port: Vec3) => {
    return paths.flatMap(({ exit }, i) => (equals(exit, port) ? [i] : []));
  };

  const pickUp = (index: number) => (event: ThreeEvent<PointerEvent>) => {
    if (solved || held !== undefined) return;

    event.stopPropagation();
    dispatch({ type: "hold", index });
  };

  return (
    <>
      <OrbitControls
        enabled={held === undefined}
        enablePan={false}
        enableZoom={false}
        autoRotate={solved}
        autoRotateSpeed={1.5}
      />

      <Lights />
      <Walls size={size} />
      <mesh>
        <boxGeometry args={[size, size, size]} />
        <meshBasicMaterial visible={false} />
        <Edges color={FRAME_COLOR} lineWidth={3} />
      </mesh>

      {puzzle.lasers.map(({ start, end }, i) => (
        <group key={keyOf(start)}>
          <Port port={start} size={size} tone={LASER_TONES.at(i) ?? toneOf([])} cored />
          <Port port={end} size={size} tone={toneOf(lasersReaching(end))} cored={false} />
        </group>
      ))}

      {puzzle.minos.map((mino, i) => {
        const anchor = positions.at(i);
        if (anchor === undefined) return null;

        const lit = minoCellsAt(mino, anchor).map(({ position }) => lasersThrough(position));

        return (
          <group key={i} position={toWorld(anchor, size)} onPointerDown={pickUp(i)}>
            <MinoMesh mino={mino} lit={lit} ghost={false} />
          </group>
        );
      })}

      {heldMino !== undefined && ghost !== undefined && (
        <group position={toWorld(ghost, size)}>
          <MinoMesh mino={heldMino} lit={[]} ghost />
        </group>
      )}

      {paths.map(({ cells, exit }, i) => {
        const start = puzzle.lasers.at(i)?.start;
        const tone = LASER_TONES.at(i);
        if (start === undefined || tone === undefined) return null;

        const points = [
          portToWorld(start, size),
          ...cells.map((cell) => toWorld(cell, size)),
          portToWorld(exit, size),
        ];

        return (
          <group key={keyOf(start)}>
            <Line
              points={points}
              color={tone.stroke}
              lineWidth={8}
              transparent
              depthTest={false}
              renderOrder={4}
            />
            <Line
              points={points}
              color={CORE_COLOR}
              lineWidth={3}
              transparent
              depthTest={false}
              renderOrder={5}
            />
          </group>
        );
      })}
    </>
  );
};
