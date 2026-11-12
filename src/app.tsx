import { useState } from "react";

import { Play } from "./components/play";
import { Top } from "./components/top";
import { compact, parseDateParam, toDateString } from "./daily";

import styles from "./app.module.css";

const TODAY = toDateString(new Date());
const INITIAL_DATE = parseDateParam(new URLSearchParams(location.search).get("date"), TODAY);

export const App = () => {
  const [date, setDate] = useState(INITIAL_DATE);
  const [playing, setPlaying] = useState(false);

  const changeDate = (next: string) => {
    if (next !== "" && next <= TODAY) setDate(next);
  };

  const play = () => {
    history.replaceState(null, "", `?date=${compact(date)}`);
    setPlaying(true);
  };

  return (
    <div className={styles.page}>
      <div className={styles.app}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <button type="button" onClick={() => setPlaying(false)}>
              RefleCube
            </button>
          </h1>
        </header>

        <main>
          {playing ? (
            <Play date={date} onTop={() => setPlaying(false)} />
          ) : (
            <Top date={date} today={TODAY} onDateChange={changeDate} onPlay={play} />
          )}
        </main>
      </div>

      <footer className={styles.footer}>
        <p>
          A 3D remake of <a href="https://yavu.github.io/yv_reflecmino/">ReflecMino</a> © 2023 yavu
        </p>
        <p>Copyright © 2026 xflest</p>
      </footer>
    </div>
  );
};
