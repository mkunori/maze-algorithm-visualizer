import { describe, it, expect, vi } from "vitest";
import {
  generators,
  finders,
  makeState,
  generate,
  search,
  neighbors,
  Heap,
} from "../src/engine.js";
import type { MazeState } from "../src/types";
const state = (
  n: number,
  grid: number[] | null = null,
  start = n + 1,
  goal = n * n - n - 2,
) => makeState(n, grid, start, goal) as MazeState;
function run(s: MazeState, it: Iterable<unknown>) {
  let count = 0;
  for (const _ of it) expect(++count).toBeLessThan(250000);
  expect(s.done).toBe(true);
  return s;
}
function verify(s: MazeState) {
  if (!s.found) return;
  expect(s.path[0]).toBe(s.start);
  expect(s.path.at(-1)).toBe(s.goal);
  expect(new Set(s.path).size).toBe(s.path.length);
  for (let i = 1; i < s.path.length; i++) {
    expect(neighbors(s.path[i - 1], s.n)).toContain(s.path[i]);
    expect(s.grid[s.path[i]]).toBeGreaterThan(0);
  }
  expect(s.cost).toBe(s.path.slice(1).reduce((a, id) => a + s.grid[id], 0));
}
function seeded(seed: number) {
  return () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
describe("generation and search guarantees", () => {
  for (const n of [15, 21, 31])
    for (const gen of Object.keys(generators))
      for (const loop of ["none", "few", "many"])
        it(`${gen} ${n} ${loop}`, () => {
          const random = seeded(
            n * 997 +
              Object.keys(generators).indexOf(gen) * 31 +
              ["none", "few", "many"].indexOf(loop),
          );
          vi.spyOn(Math, "random").mockImplementation(random);
          try {
            const maze = state(n);
            run(maze, generate(maze, gen, loop));
            const seen = new Set([maze.start]),
              q = [maze.start];
            let edges = 0;
            for (let head = 0; head < q.length; head++)
              for (const w of neighbors(q[head], n)) {
                if (!maze.grid[w]) continue;
                edges++;
                if (!seen.has(w)) {
                  seen.add(w);
                  q.push(w);
                }
              }
            expect(seen.size).toBe(maze.grid.filter(Boolean).length);
            expect(seen.has(maze.goal)).toBe(true);
            if (loop === "none") expect(edges / 2).toBe(seen.size - 1);
            else expect(edges / 2).toBeGreaterThan(seen.size - 1);
            for (const weighted of [false, true]) {
              const grid = maze.grid.map((v) =>
                  v && weighted ? [1, 5, 10][Math.floor(random() * 3)] : v,
                ),
                r: Record<string, MazeState> = {};
              for (const f of Object.keys(finders)) {
                const s = state(n, grid);
                r[f] = run(s, search(s, f));
                expect(s.found).toBe(true);
                verify(s);
              }
              expect(r.bfs.path.length).toBe(r.bidirectional.path.length);
              expect(r.dijkstra.cost).toBe(r.astar.cost);
              expect(r.dijkstra.cost).toBe(r.bellman.cost);
              if (!weighted) expect(r.bfs.cost).toBe(r.dijkstra.cost);
            }
          } finally {
            vi.restoreAllMocks();
          }
        }, 30000);
});

describe("edge cases", () => {
  for (const f of Object.keys(finders)) {
    it(`${f} start equals goal`, () => {
      const s = state(5, Array(25).fill(1), 6, 6);
      run(s, search(s, f));
      verify(s);
      expect(s.path).toEqual([6]);
    });
    it(`${f} unreachable goal`, () => {
      const s = state(5);
      s.grid[s.start] = s.grid[s.goal] = 1;
      run(s, search(s, f));
      expect(s.found).toBe(false);
    });
  }
  it("stable heap ordering", () => {
    const heap = new Heap();
    for (let i = 0; i < 1000; i++) heap.push({ id: i }, i % 10);
    let previous = -1,
      order = -1;
    while (heap.length) {
      const e = heap.pop();
      expect(e.p).toBeGreaterThanOrEqual(previous);
      if (e.p === previous) expect(e.order).toBeGreaterThan(order);
      previous = e.p;
      order = e.order;
    }
  });
});
