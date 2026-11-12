import type { FC } from "react";

import logo from "../assets/logo.svg";
import { randomDate } from "../daily";

import styles from "./top.module.css";

const HISTORY_ICON =
  "M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z";

type TopProps = {
  date: string;
  today: string;
  onDateChange: (date: string) => void;
  onPlay: () => void;
};

export const Top: FC<TopProps> = ({ date, today, onDateChange, onPlay }) => (
  <section className={styles.top}>
    <img className={styles.logo} src={logo} alt="" />
    <h2 className={styles.title}>RefleCube</h2>

    <div className={styles.date}>
      <input
        type="date"
        className={styles.picker}
        value={date}
        max={today}
        onChange={(event) => onDateChange(event.target.value)}
      />
      <button
        type="button"
        className={styles.random}
        aria-label="Random date"
        onClick={() => onDateChange(randomDate(Math.random(), new Date()))}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d={HISTORY_ICON} />
        </svg>
      </button>
    </div>

    <button type="button" className={styles.play} onClick={onPlay}>
      Play
    </button>
  </section>
);
