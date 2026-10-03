import { useEffect, useRef, useState } from "react";
import { makeState, generate, search, generators, finders } from "./engine.js";
import type { MazeState, Phase, Result } from "./types";
export const speeds = [1000, 500, 200, 100, 30, 0];
const state = (
  n: number,
  grid: number[] | null = null,
  start = n + 1,
  goal = n * n - n - 2,
) => makeState(n, grid, start, goal) as MazeState;
export function useMaze() {
  const [version, update] = useState(0);
  const model = useRef<ReturnType<typeof createModel> | null>(null);
  if (!model.current) model.current = createModel();
  const m = model.current;
  const refresh = () => update((v) => v + 1);
  function stop() {
    m.playing = false;
  }
  function terrain(grid: number[]) {
    return grid.map((v, i) =>
      v && i !== m.start && i !== m.goal
        ? Math.random() < 0.16
          ? 5
          : Math.random() < 0.1
            ? 10
            : 1
        : v,
    );
  }
  function reset() {
    stop();
    if (m.phase === "generation" && m.iterator && !m.s.done) {
      while (!m.s.done) m.iterator.next();
      m.base = m.s.grid.slice();
      if (m.weighted) m.base = terrain(m.base);
    }
    m.s = state(m.n, m.base, m.start, m.goal);
    m.iterator = null;
    m.phase = "ready";
    m.recorded = false;
    m.stepMode = false;
    refresh();
  }
  function initial() {
    stop();
    m.start = m.n + 1;
    m.goal = m.n * m.n - m.n - 2;
    const tmp = state(m.n);
    for (const _ of generate(tmp, m.gen, m.loopMode)) {
    }
    m.base = m.weighted ? terrain(tmp.grid) : tmp.grid.slice();
    m.results = [];
    reset();
  }
  function newMaze(auto = true) {
    stop();
    m.start = m.n + 1;
    m.goal = m.n * m.n - m.n - 2;
    m.results = [];
    m.recorded = false;
    m.s = state(m.n);
    m.phase = "generation";
    m.iterator = generate(m.s, m.gen, m.loopMode);
    m.study = "generation";
    m.stepMode = !auto;
    m.playing = auto;
    refresh();
  }
  function beginSearch(auto = true) {
    if (m.phase === "generation" && !m.s.done) return;
    stop();
    m.s = state(m.n, m.base, m.start, m.goal);
    m.iterator = search(m.s, m.finder);
    m.phase = "search";
    m.recorded = false;
    m.stepMode = !auto;
    m.study = "search";
    m.playing = auto;
    refresh();
  }
  function advance() {
    if (!m.iterator || m.s.done) return;
    const t = performance.now();
    m.iterator.next();
    m.s.cpu += performance.now() - t;
    if (m.s.done) {
      stop();
      if (m.phase === "generation") {
        m.base = m.weighted ? terrain(m.s.grid) : m.s.grid.slice();
        m.s.grid = m.base.slice();
      } else if (!m.recorded) {
        m.results.push({
          key: m.finder,
          visited: m.s.visited.size,
          path: m.s.found ? m.s.path.length - 1 : null,
          cost: m.s.found ? m.s.cost : null,
        });
        m.recorded = true;
      }
    }
  }
  function play() {
    if (!m.iterator || m.s.done) beginSearch(false);
    m.stepMode = false;
    m.playing = true;
    refresh();
  }
  function step() {
    stop();
    if (!m.iterator || m.s.done) beginSearch(false);
    m.stepMode = true;
    advance();
    refresh();
  }
  function loops() {
    for (let i = 0; i < Math.max(1, Math.floor(m.n * m.n * 0.018)); i++) {
      const walls = m.base.flatMap((v, id) => {
        const x = id % m.n,
          y = Math.floor(id / m.n);
        return !v &&
          x > 0 &&
          x < m.n - 1 &&
          y > 0 &&
          y < m.n - 1 &&
          ((m.base[id - 1] && m.base[id + 1]) ||
            (m.base[id - m.n] && m.base[id + m.n]))
          ? [id]
          : [];
      });
      if (!walls.length) break;
      m.base[walls[Math.floor(Math.random() * walls.length)]] = 1;
    }
    m.results = [];
    reset();
    m.s.action = "ループを追加しました。複数の経路を比較できます。";
    refresh();
  }
  function paint(x: number, y: number) {
    if (
      !m.editor ||
      (m.phase === "generation" && !m.s.done) ||
      x <= 0 ||
      y <= 0 ||
      x >= m.n - 1 ||
      y >= m.n - 1
    )
      return;
    const id = y * m.n + x;
    if (m.brush === "start") {
      if (id === m.goal) return;
      m.start = id;
      m.base[id] = 1;
    } else if (m.brush === "goal") {
      if (id === m.start) return;
      m.goal = id;
      m.base[id] = 1;
    } else {
      if (id === m.start || id === m.goal) return;
      m.base[id] = (
        { wall: 0, road: 1, mud: 5, water: 10 } as Record<string, number>
      )[m.brush];
      if (["mud", "water"].includes(m.brush)) m.weighted = true;
    }
    m.results = [];
    reset();
    m.s.action = "迷路を編集しました。SEARCH で到達可能か確認できます。";
    refresh();
  }
  useEffect(() => {
    if (!m.playing) return;
    const timer = setTimeout(() => {
      if (speeds[m.speed] === 0) {
        const t = performance.now();
        do {
          advance();
        } while (m.playing && performance.now() - t < 9);
      } else advance();
      refresh();
    }, speeds[m.speed]);
    return () => clearTimeout(timer);
  }, [version]);
  useEffect(() => {
    function key(e: KeyboardEvent) {
      if (
        /INPUT|SELECT|TEXTAREA|BUTTON/.test(
          (e.target as HTMLElement).tagName,
        ) ||
        (e.target as HTMLElement).isContentEditable
      )
        return;
      if (e.code === "Space") {
        e.preventDefault();
        if (m.playing) {
          stop();
          refresh();
        } else play();
      }
      if (e.code === "ArrowRight") {
        e.preventDefault();
        step();
      }
    }
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);
  return {
    m,
    refresh,
    reset,
    initial,
    newMaze,
    beginSearch,
    play,
    step,
    loops,
    paint,
    pause: () => {
      stop();
      refresh();
    },
    weighted: (checked: boolean) => {
      m.weighted = checked;
      m.base = checked ? terrain(m.base) : m.base.map((v) => (v ? 1 : 0));
      m.results = [];
      reset();
    },
    surprise: () => {
      const random = (o: object) =>
        Object.keys(o)[Math.floor(Math.random() * Object.keys(o).length)];
      m.gen = random(generators);
      m.finder = random(finders);
      newMaze();
    },
  };
}
function createModel() {
  const n = 21,
    s = state(n);
  for (const _ of generate(s, "backtracker", "none")) {
  }
  const base = s.grid.slice();
  return {
    n,
    gen: "backtracker",
    finder: "bfs",
    loopMode: "none",
    weighted: false,
    start: n + 1,
    goal: n * n - n - 2,
    base,
    s: state(n, base),
    phase: "ready" as Phase,
    iterator: null as Iterator<unknown> | null,
    playing: false,
    stepMode: false,
    speed: 3,
    results: [] as Result[],
    recorded: false,
    study: "search",
    code: false,
    editor: false,
    brush: "wall",
  };
}
