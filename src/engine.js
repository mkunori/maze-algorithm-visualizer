export const generators = {
  backtracker: [
    "Recursive Backtracker",
    "深さ優先型",
    "Stack",
    "O(V)",
    "行き止まりまで通路を掘り、戻りながら枝を伸ばします。長い一本道が生まれやすい方式です。",
  ],
  prim: [
    "Randomized Prim",
    "ランダムPrim法",
    "Frontier",
    "O(V + E)",
    "通路の境界にある候補をランダムに選び、未接続のセルへ伸ばします。細かい枝分かれが多くなります。",
  ],
  kruskal: [
    "Randomized Kruskal",
    "ランダムKruskal法",
    "Union-Find",
    "O(E α(V))",
    "壁をランダムな順序で調べ、異なる集合をつなぐ壁だけを取り除きます。",
  ],
  division: [
    "Recursive Division",
    "再帰分割法",
    "Recursion / Stack",
    "O(V log V) 上界",
    "開いた空間に、通り抜ける穴を1つ残した壁を置き、領域を再帰的に分割します。",
  ],
  binary: [
    "Binary Tree",
    "バイナリツリー法",
    "なし",
    "O(V)",
    "各セルを北か東へつなぎます。北東に偏った、特徴的な迷路ができます。",
  ],
  sidewinder: [
    "Sidewinder",
    "サイドワインダー法",
    "Run",
    "O(V)",
    "横方向に通路を伸ばし、区切った区間から1か所を北側につなぎます。",
  ],
};
export const finders = {
  bfs: [
    "Breadth First Search",
    "幅優先探索",
    "Queue",
    "O(V + E)",
    "近いマスから順に探索します。重みなしでは最短経路を保証します。重み付きでは移動回数を最小にします。",
  ],
  dfs: [
    "Depth First Search",
    "深さ優先探索",
    "Stack",
    "O(V + E)",
    "一方向へ深く進みます。最短経路や最小コストは保証しません。",
  ],
  dijkstra: [
    "Dijkstra",
    "ダイクストラ法",
    "Priority Queue",
    "O((V + E) log V)",
    "累積コスト g が小さいマスから探索します。非負の重みで最小コストを保証します。",
  ],
  astar: [
    "A*",
    "Aスター探索",
    "Open Set",
    "O((V + E) log V)",
    "f = g + h を優先します。h はマンハッタン距離。上下左右の移動・最小コスト1なので、最小コストを保証します。",
  ],
  greedy: [
    "Greedy Best First",
    "貪欲最良優先探索",
    "Open Set",
    "O((V + E) log V)",
    "ゴールまでの推定距離 h だけを優先します。速く近づけても最短経路・最小コストは保証しません。",
  ],
  bidirectional: [
    "Bidirectional BFS",
    "双方向幅優先探索",
    "Two Queues",
    "O(V + E)",
    "両端から1層ずつ幅優先探索し、接点で経路をつなぎます。移動回数を最小にしますが、地形コストは考慮しません。",
  ],
};
Object.assign(generators, {
  hunt: [
    "Hunt and Kill",
    "ハント・アンド・キル法",
    "Scan / Walk",
    "O(V²)",
    "未訪問セルへ歩き、行き止まると未訪問セルを走査して再開地点を探します。長い通路と、走査による再開を観察できます。",
  ],
  growing: [
    "Growing Tree",
    "成長木法（最新75%・ランダム25%）",
    "Active List",
    "O(V²) このリスト実装",
    "候補リストから75%の確率で最新セル、25%でランダムなセルを選びます。深さ優先型とPrim型の中間の形になります。",
  ],
  aldous: [
    "Aldous–Broder",
    "アルダス・ブローダー法",
    "Random Walk",
    "ランダムウォークの被覆時間に依存",
    "ランダムに歩き、初めて訪れたセルへだけ通路を掘ります。格子の全域木を一様に選びます。終盤は既訪問セルの往復が多いため、最速再生も活用してください。",
  ],
});
Object.assign(finders, {
  weightedastar: [
    "Weighted A*",
    "重み付きA*（w = 2）",
    "Open Set",
    "O((V + E) log V)",
    "f = g + 2h でゴール方向を強く優先します。この実装は確定済みセルを再展開しません。最小コストは保証しません。地形の重みと、ヒューリスティックの重み w は別の設定です。",
  ],
  bellman: [
    "Bellman–Ford",
    "ベルマン・フォード法",
    "Distance Table",
    "O(VE)",
    "全頂点の辺を繰り返し緩和します。1周で更新がなければ終了。最小コストを保証します。一般には負の辺も扱えますが、このサイトの地形コストは1・5・10です。",
  ],
});
export const xy = (id, n) => `(${id % n}, ${Math.floor(id / n)})`;
export const neighbors = (id, n) =>
  [id - n, id + 1, id + n, id - 1].filter(
    (v) =>
      v >= 0 &&
      v < n * n &&
      Math.abs((v % n) - (id % n)) +
        Math.abs(Math.floor(v / n) - Math.floor(id / n)) ===
        1,
  );
const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const pick = (a) => a[Math.floor(Math.random() * a.length)];
export class Heap {
  constructor() {
    this.a = [];
    this.order = 0;
  }
  push(v, p) {
    const e = { ...v, p, order: this.order++ };
    let i = this.a.length;
    this.a.push(e);
    while (i) {
      let j = (i - 1) >> 1;
      if (!this.less(e, this.a[j])) break;
      this.a[i] = this.a[j];
      i = j;
    }
    this.a[i] = e;
  }
  less(a, b) {
    return a.p < b.p || (a.p === b.p && a.order < b.order);
  }
  pop() {
    const root = this.a[0],
      v = this.a.pop();
    if (this.a.length) {
      let i = 0;
      while (i * 2 + 1 < this.a.length) {
        let c = i * 2 + 1;
        if (c + 1 < this.a.length && this.less(this.a[c + 1], this.a[c])) c++;
        if (!this.less(this.a[c], v)) break;
        this.a[i] = this.a[c];
        i = c;
      }
      this.a[i] = v;
    }
    return root;
  }
  get length() {
    return this.a.length;
  }
}
/** @param {number} n @param {number[] | null} grid @param {number} start @param {number} goal @returns {import("./types").MazeState} */
export function makeState(n, grid = null, start = n + 1, goal = n * n - n - 2) {
  return {
    n,
    grid: grid ? grid.slice() : Array(n * n).fill(0),
    start,
    goal,
    current: -1,
    visited: new Set(),
    frontier: [],
    path: [],
    step: 0,
    action: "準備できました。SEARCH で探索を開始します。",
    next: "STEP で1操作ずつ進められます。",
    tag: "init",
    done: false,
    cost: 0,
    cpu: 0,
    found: false,
  };
}
function event(s, action, tag = "carve", next = "次の候補を確認します。") {
  s.action = action;
  s.tag = tag;
  s.next = next;
  s.step++;
  return s;
}
export function* generate(s, type, loopMode = "none") {
  const { n } = s,
    id = (x, y) => y * n + x;
  const cells = [];
  for (let y = 1; y < n - 1; y += 2)
    for (let x = 1; x < n - 1; x += 2) cells.push(id(x, y));
  s.grid.fill(0);
  const carve = function* (v) {
    s.grid[v] = 1;
    s.current = v;
    s.visited.add(v);
    yield event(s, `${xy(v, n)} を通路にしました。`);
  };
  const links = (v) =>
    [v - 2 * n, v + 2, v + 2 * n, v - 2].filter(
      (w) =>
        w > n &&
        w < n * (n - 1) &&
        w % n > 0 &&
        w % n < n - 1 &&
        Math.abs((w % n) - (v % n)) +
          Math.abs(Math.floor(w / n) - Math.floor(v / n)) ===
          2,
    );
  if (type === "growing") {
    let active = [s.start];
    yield* carve(s.start);
    while (active.length) {
      let i =
          Math.random() < 0.75
            ? active.length - 1
            : Math.floor(Math.random() * active.length),
        v = active[i];
      s.current = v;
      s.frontier = active.map((id) => ({ id }));
      yield event(s, `候補リストから ${xy(v, n)} を選びました。`, "pop");
      let opts = links(v).filter((w) => !s.grid[w]);
      if (opts.length) {
        let w = pick(opts);
        yield* carve((v + w) / 2);
        active.push(w);
        yield* carve(w);
      } else {
        active.splice(i, 1);
        s.frontier = active.map((id) => ({ id }));
        yield event(
          s,
          "未訪問の隣接セルがないので候補から除外します。",
          "skip",
        );
      }
    }
  } else if (type === "hunt") {
    let v = s.start;
    yield* carve(v);
    while (true) {
      let opts = links(v).filter((w) => !s.grid[w]);
      if (opts.length) {
        let w = pick(opts);
        yield* carve((v + w) / 2);
        yield* carve(w);
        v = w;
        continue;
      }
      let found = false;
      for (const w of cells) {
        s.current = w;
        yield event(s, `${xy(w, n)} を走査し、再開地点を探します。`, "scan");
        if (s.grid[w]) continue;
        let connected = links(w).filter((t) => s.grid[t]);
        if (connected.length) {
          yield* carve((w + pick(connected)) / 2);
          yield* carve(w);
          v = w;
          found = true;
          break;
        }
      }
      if (!found) break;
    }
  } else if (type === "aldous") {
    let v = s.start,
      count = 1;
    yield* carve(v);
    while (count < cells.length) {
      let w = pick(links(v));
      s.frontier = links(v).map((id) => ({ id }));
      if (!s.grid[w]) {
        yield* carve((v + w) / 2);
        yield* carve(w);
        count++;
      } else {
        s.current = w;
        yield event(s, `既訪問の ${xy(w, n)} へ移動。壁は掘りません。`, "walk");
      }
      v = w;
    }
  } else if (type === "division") {
    for (let y = 1; y < n - 1; y++)
      for (let x = 1; x < n - 1; x++) s.grid[id(x, y)] = 1;
    function* divide(x1, y1, x2, y2) {
      if (x2 - x1 < 2 || y2 - y1 < 2) return;
      let horizontal =
        y2 - y1 > x2 - x1 || (y2 - y1 === x2 - x1 && Math.random() < 0.5);
      let range = (a, b) => {
        let r = [];
        for (let i = a; i <= b; i += 2) r.push(i);
        return r;
      };
      if (horizontal) {
        let y = pick(range(y1 + 1, y2 - 1)),
          hole = pick(range(x1, x2));
        for (let x = x1; x <= x2; x++)
          if (x !== hole) {
            let v = id(x, y);
            s.grid[v] = 0;
            s.current = v;
            s.visited.add(v);
            yield event(
              s,
              `${xy(v, n)} に壁を追加。穴は ${xy(id(hole, y), n)}。`,
              "divide",
            );
          }
        yield* divide(x1, y1, x2, y - 1);
        yield* divide(x1, y + 1, x2, y2);
      } else {
        let x = pick(range(x1 + 1, x2 - 1)),
          hole = pick(range(y1, y2));
        for (let y = y1; y <= y2; y++)
          if (y !== hole) {
            let v = id(x, y);
            s.grid[v] = 0;
            s.current = v;
            s.visited.add(v);
            yield event(
              s,
              `${xy(v, n)} に壁を追加。穴は ${xy(id(x, hole), n)}。`,
              "divide",
            );
          }
        yield* divide(x1, y1, x - 1, y2);
        yield* divide(x + 1, y1, x2, y2);
      }
    }
    yield* divide(1, 1, n - 2, n - 2);
  } else if (type === "backtracker") {
    let stack = [s.start];
    yield* carve(s.start);
    while (stack.length) {
      s.frontier = stack
        .slice()
        .reverse()
        .map((id) => ({ id }));
      let v = stack.at(-1),
        opts = links(v).filter((w) => !s.grid[w]);
      if (opts.length) {
        let w = pick(opts);
        yield* carve((v + w) / 2);
        stack.push(w);
        yield* carve(w);
      } else {
        stack.pop();
        s.current = v;
        yield event(s, `行き止まり ${xy(v, n)} から戻ります。`, "pop");
      }
    }
  } else if (type === "prim") {
    let edges = [];
    const add = (v) => {
      for (const w of links(v)) if (!s.grid[w]) edges.push({ from: v, id: w });
    };
    yield* carve(s.start);
    add(s.start);
    while (edges.length) {
      s.frontier = edges.map((e) => ({ id: (e.from + e.id) / 2 }));
      let i = Math.floor(Math.random() * edges.length),
        e = edges[i];
      edges[i] = edges[edges.length - 1];
      edges.pop();
      s.current = (e.from + e.id) / 2;
      if (s.grid[e.id]) {
        yield event(s, "両側が接続済みなので、この候補を除外します。", "skip");
        continue;
      }
      yield* carve((e.from + e.id) / 2);
      yield* carve(e.id);
      add(e.id);
    }
  } else if (type === "kruskal") {
    let parent = Array.from({ length: n * n }, (_, i) => i),
      rank = Array(n * n).fill(0);
    const root = (v) => {
      while (v !== parent[v]) {
        parent[v] = parent[parent[v]];
        v = parent[v];
      }
      return v;
    };
    let edges = [];
    for (const v of cells) {
      s.grid[v] = 1;
      for (const w of links(v)) if (v < w) edges.push([v, w]);
    }
    shuffle(edges);
    while (edges.length) {
      let [v, w] = edges.pop(),
        a = root(v),
        b = root(w);
      s.current = (v + w) / 2;
      s.frontier = edges
        .slice()
        .reverse()
        .map(([v, w]) => ({ id: (v + w) / 2 }));
      if (a !== b) {
        if (rank[a] < rank[b]) [a, b] = [b, a];
        parent[b] = a;
        if (rank[a] === rank[b]) rank[a]++;
        yield* carve((v + w) / 2);
      } else yield event(s, "同じ集合なので、壁を残します。", "skip");
    }
  } else if (type === "binary") {
    for (const v of cells) {
      yield* carve(v);
      let opts = [];
      if (v >= 3 * n) opts.push(v - 2 * n);
      if (v % n < n - 2) opts.push(v + 2);
      if (opts.length) yield* carve((v + pick(opts)) / 2);
    }
  } else {
    for (let y = 1; y < n - 1; y += 2) {
      let run = [];
      for (let x = 1; x < n - 1; x += 2) {
        let v = id(x, y);
        run.push(v);
        s.frontier = run.map((id) => ({ id }));
        yield* carve(v);
        if (x === n - 2 || (y > 1 && Math.random() < 0.5)) {
          if (y > 1) yield* carve(pick(run) - n);
          run = [];
        } else yield* carve(v + 1);
      }
    }
  }
  if (loopMode !== "none") {
    const walls = [];
    for (let y = 1; y < n - 1; y++)
      for (let x = 1; x < n - 1; x++) {
        let v = id(x, y);
        if (
          !s.grid[v] &&
          ((x % 2 === 0 && y % 2 === 1 && s.grid[v - 1] && s.grid[v + 1]) ||
            (x % 2 === 1 && y % 2 === 0 && s.grid[v - n] && s.grid[v + n]))
        )
          walls.push(v);
      }
    shuffle(walls);
    let count = Math.max(
      1,
      Math.round(walls.length * (loopMode === "many" ? 0.45 : 0.15)),
    );
    s.frontier = [];
    for (const v of walls.slice(0, count)) {
      s.grid[v] = 1;
      s.current = v;
      yield event(
        s,
        `ループ追加：${xy(v, n)} の壁を開きました。`,
        "loop",
        "異なる経路をつなぎ、迂回路を作ります。",
      );
    }
  }
  s.frontier = [];
  s.current = -1;
  s.done = true;
  yield event(
    s,
    "迷路の生成が完了しました。",
    "done",
    "SEARCH で探索、または RESET で生成表示を解除。",
  );
}
export function* search(s, type) {
  const { n, start, goal, grid } = s;
  const adj = (v) => neighbors(v, n).filter((w) => grid[w] > 0);
  const h = (v) =>
    Math.abs((v % n) - (goal % n)) +
    Math.abs(Math.floor(v / n) - Math.floor(goal / n));
  let parent = new Map(),
    path = null;
  if (type === "bellman") {
    const vertices = grid.map((v, i) => (v ? i : -1)).filter((v) => v >= 0),
      dist = new Map([[start, 0]]);
    for (let pass = 1; pass < vertices.length; pass++) {
      let changed = false;
      for (const v of vertices) {
        if (!dist.has(v)) continue;
        s.current = v;
        s.visited.add(v);
        s.frontier = [...dist]
          .map(([id, g]) => ({ id, g }))
          .sort((a, b) => a.g - b.g);
        yield event(
          s,
          `${pass}周目：${xy(v, n)} の隣接辺を確認します。`,
          "scan",
        );
        for (const w of adj(v)) {
          let g = dist.get(v) + grid[w];
          if (g < (dist.get(w) ?? Infinity)) {
            dist.set(w, g);
            parent.set(w, v);
            changed = true;
            s.frontier = [...dist]
              .map(([id, g]) => ({ id, g }))
              .sort((a, b) => a.g - b.g);
            yield event(
              s,
              `${xy(w, n)} の距離を ${g} に更新しました。`,
              "push",
            );
          }
        }
      }
      if (!changed) break;
    }
    if (dist.has(goal)) {
      path = [];
      let v = goal;
      while (v !== undefined) {
        path.push(v);
        v = parent.get(v);
      }
      path.reverse();
    }
    s.frontier = [];
  } else if (type === "bidirectional") {
    let qa = [start],
      qb = [goal],
      pa = new Map([[start, null]]),
      pb = new Map([[goal, null]]);
    let meet = start === goal ? start : null;
    while (qa.length && qb.length && meet === null) {
      for (let side = 0; side < 2 && meet === null; side++) {
        let q = side ? qb : qa,
          own = side ? pb : pa,
          other = side ? pa : pb,
          layer = q.length;
        for (let i = 0; i < layer && meet === null; i++) {
          let v = q.shift();
          s.current = v;
          s.visited.add(v);
          s.frontier = [
            ...qa.map((id) => ({ id, side: "S" })),
            ...qb.map((id) => ({ id, side: "G" })),
          ];
          yield event(
            s,
            `${side ? "GOAL" : "START"} Queue から ${xy(v, n)} を取り出しました。`,
            "pop",
            "未訪問の隣接マスを追加します。",
          );
          for (let w of adj(v)) {
            if (own.has(w)) continue;
            own.set(w, v);
            q.push(w);
            s.frontier = [
              ...qa.map((id) => ({ id, side: "S" })),
              ...qb.map((id) => ({ id, side: "G" })),
            ];
            yield event(
              s,
              `${xy(w, n)} を ${side ? "GOAL" : "START"} Queue に追加しました。`,
              "push",
            );
            if (other.has(w)) {
              meet = w;
              break;
            }
          }
        }
      }
    }
    if (meet !== null) {
      let a = [],
        v = meet;
      while (v !== null) {
        a.push(v);
        v = pa.get(v);
      }
      a.reverse();
      v = pb.get(meet);
      while (v !== null) {
        a.push(v);
        v = pb.get(v);
      }
      path = a;
    }
  } else {
    const pq = ["dijkstra", "astar", "weightedastar", "greedy"].includes(type),
      heap = new Heap(),
      q = [],
      seen = new Set([start]),
      dist = new Map([[start, 0]]);
    let seq = 0;
    const push = (v, g) => {
      if (pq)
        heap.push(
          { id: v, g, h: h(v) },
          type === "dijkstra"
            ? g
            : type === "astar"
              ? g + h(v)
              : type === "weightedastar"
                ? g + 2 * h(v)
                : h(v),
        );
      else q.push({ id: v, g, h: h(v), order: seq++ });
    };
    const snapshot = () => {
      s.frontier = pq
        ? heap.a.slice().sort((a, b) => a.p - b.p || a.order - b.order)
        : type === "dfs"
          ? q.slice().reverse()
          : q.slice();
    };
    push(start, 0);
    snapshot();
    yield event(s, `START ${xy(start, n)} を追加しました。`, "push");
    while (pq ? heap.length : q.length) {
      let e = pq ? heap.pop() : type === "dfs" ? q.pop() : q.shift(),
        v = e.id;
      snapshot();
      if (s.visited.has(v) || e.g !== dist.get(v)) {
        yield event(s, `古い候補 ${xy(v, n)} をスキップします。`, "skip");
        continue;
      }
      s.current = v;
      s.visited.add(v);
      yield event(
        s,
        `${finders[type][2]} から ${xy(v, n)} を取り出しました。`,
        "pop",
        "GOALか確認し、隣接する4方向を調べます。",
      );
      if (v === goal) {
        path = [];
        let v = goal;
        while (v !== undefined) {
          path.push(v);
          v = parent.get(v);
        }
        path.reverse();
        break;
      }
      for (const w of adj(v)) {
        if (s.visited.has(w)) continue;
        let g = dist.get(v) + grid[w];
        let weighted =
          type === "dijkstra" || type === "astar" || type === "weightedastar";
        if (weighted ? g < (dist.get(w) ?? Infinity) : !seen.has(w)) {
          seen.add(w);
          dist.set(w, g);
          parent.set(w, v);
          push(w, g);
          snapshot();
          yield event(
            s,
            `${xy(w, n)} を追加${weighted ? " / コスト更新" : ""}。g = ${g}${type === "astar" || type === "weightedastar" ? `, h = ${h(w)}, f = ${g + (type === "weightedastar" ? 2 : 1) * h(w)}` : ""}。`,
            "push",
            "残りの隣接マスを確認します。",
          );
        }
      }
    }
  }
  if (path) {
    s.found = true;
    s.cost = path.slice(1).reduce((a, v) => a + grid[v], 0);
    for (const v of path.slice().reverse()) {
      s.current = v;
      s.path.push(v);
      yield event(
        s,
        `経路復元：${xy(v, n)} を経路に追加しました。`,
        "path",
        "親をたどって START へ戻ります。",
      );
    }
    s.path.reverse();
  }
  s.done = true;
  s.current = -1;
  yield event(
    s,
    path ? "探索が完了しました。" : "到達可能な経路がありません。",
    "done",
    "RESET やアルゴリズム変更で、同じ迷路を再探索できます。",
  );
}
