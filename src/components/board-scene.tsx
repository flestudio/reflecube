import { OrbitControls } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import type { Dispatch, FC } from "react";

import { type Action, type Game, boardOf, traceLasers, withGhost } from "../puzzle/game";
import { minoCellsAt } from "../puzzle/mino";
import { type Vec3, equals, keyOf } from "../puzzle/vector";
import { grazedSpans, laserPoints, toWorld } from "../scene/space";
import { LASER_TONES, toneOf } from "../scene/theme";
import { Frame } from "./frame";
import { Laser } from "./laser";
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
  const shown = withGhost(game, ghost);
  const paths = traceLasers(shown);
  const board = boardOf(shown);
  const heldMino = held === undefined ? undefined : puzzle.minos.at(held);

  const lasersThrough = (cell: Vec3) => {
    return paths.flatMap(({ cells }, i) => (cells.some((lit) => equals(lit, cell)) ? [i] : []));
  };

  const lasersReaching = (port: Vec3) => {
    return paths.flatMap(({ exit }, i) => (equals(exit, port) ? [i] : []));
  };

  const litOf = (index: number, anchor: Vec3) => {
    const cells = minoCellsAt(puzzle.minos.at(index) ?? [], anchor);
    return cells.map(({ position }) => lasersThrough(position));
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
      <Frame size={size} />

      {puzzle.lasers.map(({ start, end }, i) => (
        <group key={keyOf(start)}>
          <Port port={start} size={size} tone={LASER_TONES.at(i) ?? toneOf([])} cored />
          <Port port={end} size={size} tone={toneOf(lasersReaching(end))} cored={false} />
        </group>
      ))}

      {puzzle.minos.map((mino, i) => {
        const anchor = positions.at(i);
        if (anchor === undefined) return null;

        return (
          <group key={i} position={toWorld(anchor, size)} onPointerDown={pickUp(i)}>
            <MinoMesh mino={mino} lit={litOf(i, anchor)} ghost={false} />
          </group>
        );
      })}

      {held !== undefined && heldMino !== undefined && ghost !== undefined && (
        <group position={toWorld(ghost, size)}>
          <MinoMesh mino={heldMino} lit={litOf(held, ghost)} ghost />
        </group>
      )}

      {paths.map((path, i) => {
        const start = puzzle.lasers.at(i)?.start;
        const tone = LASER_TONES.at(i);
        if (start === undefined || tone === undefined) return null;

        return (
          <group key={keyOf(start)}>
            <Laser points={laserPoints(start, path, size)} tone={tone} lifted={false} />
            {grazedSpans(start, path, board, size).map((span, j) => (
              <Laser key={j} points={span} tone={tone} lifted />
            ))}
          </group>
        );
      })}
    </>
  );
};
