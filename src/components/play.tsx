import { Canvas } from "@react-three/fiber";
import { type FC, type PointerEvent, useReducer, useState } from "react";
import type { Camera } from "three";

import { formatDate, formatElapsed, seedOf, shareText } from "../daily";
import { useStopwatch } from "../hooks/use-stopwatch";
import { createGame, isSolved, reduce } from "../puzzle/game";
import { generatePuzzle } from "../puzzle/generate";
import { type Vec3, equals } from "../puzzle/vector";
import { pickAnchor, toPointer } from "../scene/space";
import { BoardScene } from "./board-scene";
import { MinoPreview } from "./mino-preview";

import styles from "./play.module.css";

const SHARE_LABEL = "Share";
const SHARE_LABEL_DURATION = 2000;

type PlayProps = {
  date: string;
  onTop: () => void;
};

export const Play: FC<PlayProps> = ({ date, onTop }) => {
  const [game, dispatch] = useReducer(reduce, date, (initial) => {
    return createGame(generatePuzzle(seedOf(initial)));
  });
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  const [boardCamera, setBoardCamera] = useState<Camera | null>(null);
  const [ghost, setGhost] = useState<Vec3>();
  const [shareLabel, setShareLabel] = useState(SHARE_LABEL);

  const solved = isSolved(game);
  const elapsed = useStopwatch(!solved);

  const anchorAt = ({ clientX, clientY }: PointerEvent) => {
    if (stage === null || boardCamera === null) return undefined;

    const pointer = toPointer(stage.getBoundingClientRect(), clientX, clientY);
    return pointer === undefined ? undefined : pickAnchor(game, boardCamera, pointer);
  };

  const hold = (index: number) => (event: PointerEvent) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dispatch({ type: "hold", index });
  };

  const drag = (event: PointerEvent) => {
    if (game.held === undefined) return;

    const anchor = anchorAt(event);
    const isSame = anchor !== undefined && ghost !== undefined && equals(anchor, ghost);
    if (!isSame) setGhost(anchor);
  };

  const drop = (event: PointerEvent) => {
    if (game.held === undefined) return;

    const anchor = anchorAt(event);
    dispatch(anchor === undefined ? { type: "release" } : { type: "drop", anchor });
    setGhost(undefined);
  };

  const cancel = () => {
    dispatch({ type: "release" });
    setGhost(undefined);
  };

  const share = async () => {
    const text = shareText(date, elapsed, location.origin);
    const isCopied = await navigator.clipboard.writeText(text).then(
      () => true,
      () => false,
    );

    setShareLabel(isCopied ? "Copied" : "Failed");
    setTimeout(() => setShareLabel(SHARE_LABEL), SHARE_LABEL_DURATION);
  };

  return (
    <div className={styles.play} onPointerMove={drag} onPointerUp={drop} onPointerCancel={cancel}>
      <div className={styles.board} data-solved={solved}>
        <section className={styles.info}>
          <time className={styles.timer}>{formatElapsed(elapsed)}</time>
          <p className={styles.state}>{solved ? "Solved" : "Playing"}</p>
          <p className={styles.date}>{formatDate(date)}</p>
        </section>

        <div ref={setStage} className={styles.stage} data-holding={game.held !== undefined}>
          <Canvas
            flat
            dpr={[1, 2]}
            camera={{ position: [5, 4.1, 6.4], fov: 35 }}
            onCreated={({ camera }) => setBoardCamera(camera)}
          >
            <BoardScene game={game} solved={solved} ghost={ghost} dispatch={dispatch} />
          </Canvas>
        </div>

        <div className={styles.inventory}>
          {game.puzzle.minos.map((mino, i) => {
            const isStocked = game.held !== i && game.positions.at(i) === undefined;

            return (
              <button
                key={i}
                type="button"
                className={styles.slot}
                aria-label={`Mino ${i + 1}`}
                aria-disabled={!isStocked}
                onPointerDown={isStocked ? hold(i) : undefined}
              >
                <MinoPreview mino={mino} visible={isStocked} boardCamera={boardCamera} />
              </button>
            );
          })}
        </div>
      </div>

      {solved && (
        <div className={styles.actions}>
          <button type="button" className={styles.action} onClick={share}>
            {shareLabel}
          </button>
          <button type="button" className={styles.action} onClick={onTop}>
            Top
          </button>
        </div>
      )}
    </div>
  );
};
