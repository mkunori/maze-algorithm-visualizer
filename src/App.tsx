import { useEffect, useRef } from "react";
import { generators, finders, xy } from "./engine.js";
import { useMaze, speeds } from "./useMaze";
import { draw } from "./draw";
import { CodeView } from "./CodeView";
const gens = generators as Record<string, string[]>,
  searches = finders as Record<string, string[]>;
export default function App() {
  const api = useMaze(),
    { m, refresh } = api,
    s = m.s,
    canvas = useRef<HTMLCanvasElement>(null),
    drag = useRef(false),
    last = useRef(-1);
  useEffect(() => {
    if (canvas.current) draw(canvas.current, s, m.phase, m.start, m.goal);
  });
  const generating = m.phase === "generation" && !s.done,
    isSearch = m.phase === "search",
    algorithm = m.study === "generation" ? m.gen : m.finder,
    a = (m.study === "generation" ? gens : searches)[algorithm],
    structure = (m.phase === "generation" ? gens : searches)[
      m.phase === "generation" ? m.gen : m.finder
    ][2],
    pass = s.grid.filter((v) => v > 0).length,
    pct = isSearch && pass ? Math.round((s.visited.size / pass) * 100) : 0;
  const change = (fn: () => void) => {
    fn();
    refresh();
  };
  function paint(e: React.PointerEvent<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect(),
      x = Math.floor(((e.clientX - r.left) / r.width) * m.n),
      y = Math.floor(((e.clientY - r.top) / r.height) * m.n),
      id = y * m.n + x;
    if (id === last.current) return;
    last.current = id;
    api.paint(x, y);
  }
  return (
    <>
      <header>
        <a className="brand" href="./">
          <span className="brandmark">▦</span>
          <span>
            MAZE<span className="brandlight"> LABORATORY</span>
            <small>ALGORITHM VISUALIZER</small>
          </span>
        </a>
        <div className="headernote">
          観察する。進める。理解する。
          <span className="keyhint">Space 再生 / 停止 · → STEP</span>
        </div>
      </header>
      <main>
        <div className="topline">
          <div>
            <span className="eyebrow">EXPERIMENT 01</span>
            <h1>迷路から、アルゴリズムを読み解く。</h1>
          </div>
          <button id="surprise" className="quiet" onClick={api.surprise}>
            ⤨ SURPRISE ME
          </button>
        </div>
        <div className="workspace">
          <aside className="setup panel">
            <div className="panelhead">
              <span>CONFIGURATION</span>
              <span className="sectionno">01</span>
            </div>
            <label htmlFor="generator">
              迷路生成 <span>GENERATOR</span>
            </label>
            <select
              id="generator"
              value={m.gen}
              disabled={generating}
              onChange={(e) => {
                m.gen = e.target.value;
                m.study = "generation";
                api.reset();
              }}
            >
              {Object.entries(gens).map(([key, v]) => (
                <option key={key} value={key}>
                  {v[0]}
                </option>
              ))}
            </select>
            <p id="generatorHint" className="hint">
              {gens[m.gen][1]}
            </p>
            <label htmlFor="finder">
              経路探索 <span>PATH FINDER</span>
            </label>
            <select
              id="finder"
              value={m.finder}
              disabled={generating}
              onChange={(e) => {
                m.finder = e.target.value;
                m.study = "search";
                api.reset();
              }}
            >
              {Object.entries(searches).map(([key, v]) => (
                <option key={key} value={key}>
                  {v[0]}
                </option>
              ))}
            </select>
            <label htmlFor="sizes">迷路サイズ</label>
            <div
              id="sizes"
              className="segmented"
              role="group"
              aria-label="迷路サイズ"
            >
              {[15, 21, 31].map((n) => (
                <button
                  key={n}
                  aria-pressed={m.n === n}
                  className={m.n === n ? "active" : ""}
                  onClick={() => {
                    m.n = n;
                    api.initial();
                  }}
                >
                  {n} × {n}
                </button>
              ))}
            </div>
            <div className="topology">
              <label htmlFor="loopMode">ループ設定</label>
              <select
                id="loopMode"
                value={m.loopMode}
                onChange={(e) => change(() => (m.loopMode = e.target.value))}
              >
                <option value="none">ループなし · 経路が一意</option>
                <option value="few">ループあり · 少なめ</option>
                <option value="many">ループあり · 多め</option>
              </select>
              <p className="hint">設定変更は次の NEW MAZE から反映します。</p>
            </div>
            <div className="setupactions">
              <button
                id="newMaze"
                className="outline"
                onClick={() => api.newMaze()}
              >
                ↻ NEW MAZE
              </button>
              <button
                id="search"
                className="primary"
                disabled={generating}
                onClick={() => api.beginSearch()}
              >
                探索する <span>SEARCH →</span>
              </button>
            </div>
            <div className="divider" />
            <label className="check">
              <input
                id="weighted"
                type="checkbox"
                checked={m.weighted}
                disabled={generating}
                onChange={(e) => api.weighted(e.target.checked)}
              />
              重み付き地形 <span>WEIGHTED</span>
            </label>
            <p className="hint">
              通路 1 · 泥 5 · 水 10
              <br />
              重みは移動先のマスで加算します。
            </p>
            <button
              id="loops"
              className="quiet full"
              disabled={generating}
              onClick={api.loops}
            >
              ＋ ループを追加
            </button>
            <p className="hint">
              複数の経路で、距離とコストの違いを比較できます。
            </p>
            <details
              id="editor"
              onToggle={(e) => change(() => (m.editor = e.currentTarget.open))}
            >
              <summary>手書きで編集</summary>
              <label htmlFor="brush">ブラシ</label>
              <select
                id="brush"
                disabled={generating}
                value={m.brush}
                onChange={(e) => change(() => (m.brush = e.target.value))}
              >
                {Object.entries({
                  wall: "壁",
                  road: "通路",
                  mud: "泥 · 5",
                  water: "水 · 10",
                  start: "START",
                  goal: "GOAL",
                }).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <p className="hint">
                盤面をクリック・ドラッグ。編集後は経路がない場合もあります。
              </p>
            </details>
          </aside>
          <section className="mazeSection panel">
            <div className="panelhead">
              <span id="phaseLabel">
                {m.phase === "generation"
                  ? "GENERATION / " + gens[m.gen][0].toUpperCase()
                  : isSearch
                    ? "PATH FINDING / " + m.finder.toUpperCase()
                    : "MAZE / READY"}
              </span>
              <span className="mono">
                {m.n} × {m.n}
              </span>
            </div>
            <div className="boardwrap">
              <canvas
                ref={canvas}
                id="maze"
                width={840}
                height={840}
                role="img"
                aria-label="迷路。Sが開始地点、Gがゴールです。"
                style={{ touchAction: m.editor ? "none" : "auto" }}
                onPointerDown={(e) => {
                  if (!m.editor) return;
                  drag.current = true;
                  last.current = -1;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  paint(e);
                }}
                onPointerMove={(e) => {
                  if (drag.current) paint(e);
                }}
                onPointerUp={() => {
                  drag.current = false;
                  last.current = -1;
                }}
                onPointerCancel={() => {
                  drag.current = false;
                  last.current = -1;
                }}
              />
            </div>
            <div className="legend">
              {[
                ["wall", "壁", ""],
                ["road", "通路", ""],
                ["current", "処理中", ""],
                ["frontier", "候補", "·"],
                ["visited", "探索済", "·"],
                ["path", "経路", "—"],
                ["mud", "泥", "5"],
                ["water", "水", "10"],
              ].map(([c, t, i]) => (
                <span key={c}>
                  <i className={c}>{i}</i>
                  {t}
                </span>
              ))}
            </div>
            <div className="transport">
              <button
                id="play"
                className="primary"
                disabled={m.playing}
                onClick={api.play}
              >
                ▶ PLAY
              </button>
              <button
                id="pause"
                className="outline"
                disabled={!m.playing}
                onClick={api.pause}
              >
                Ⅱ PAUSE
              </button>
              <button id="step" className="outline" onClick={api.step}>
                ▸| STEP
              </button>
              <button id="reset" className="quiet" onClick={api.reset}>
                ↺ RESET
              </button>
            </div>
            <div className="speedrow">
              <label htmlFor="speed">SPEED</label>
              <input
                id="speed"
                type="range"
                min={0}
                max={5}
                value={m.speed}
                onChange={(e) => change(() => (m.speed = +e.target.value))}
              />
              <output>
                {speeds[m.speed] === 0 ? "最速" : speeds[m.speed] + " ms"}
              </output>
            </div>
          </section>
          <aside className="inspector panel">
            <div className="panelhead">
              <span>LIVE INSPECTOR</span>
              <span className="sectionno">02</span>
            </div>
            <div className="statusline">
              <span id="status" className="badge">
                {s.done
                  ? "COMPLETE"
                  : m.playing
                    ? "RUNNING"
                    : m.stepMode
                      ? "STEP MODE"
                      : m.phase === "ready"
                        ? "READY"
                        : "PAUSED"}
              </span>
              <span className="mono">
                STEP <b id="stepCount">{String(s.step).padStart(4, "0")}</b>
              </span>
            </div>
            <div className="currentbox">
              <span className="eyebrow">CURRENT CELL</span>
              <strong>{s.current < 0 ? "—" : xy(s.current, m.n)}</strong>
              <small>座標 (x, y) · 左上 (0, 0)</small>
            </div>
            <div className="actionbox">
              <span className="eyebrow">ACTION</span>
              <p aria-live={m.playing ? "off" : "polite"}>{s.action}</p>
              <span className="eyebrow">NEXT</span>
              <p>{s.next}</p>
            </div>
            <div className="datastructure">
              <div className="datahead">
                <strong>{structure.toUpperCase()}</strong>
                <span className="mono">{s.frontier.length}</span>
              </div>
              <p className="hint">
                {!m.stepMode
                  ? "STEPを押すと、候補の中身を表示します。"
                  : isSearch && ["astar", "weightedastar"].includes(m.finder)
                    ? `g: 累積 / h: 推定 / f = g + ${m.finder === "weightedastar" ? "2" : ""}h`
                    : structure === "Stack"
                      ? "TOP → 下へ"
                      : m.finder === "bidirectional" && isSearch
                        ? "S: START側 / G: GOAL側"
                        : m.finder === "bellman" && isSearch
                          ? "有限距離の頂点。候補キューは使いません。"
                          : "先頭・最小優先度から表示（最大8件）"}
              </p>
              <div id="structure">
                {m.stepMode &&
                  (s.frontier.length ? (
                    <>
                      {s.frontier.slice(0, 8).map((e, i) => (
                        <div className="entry" key={i}>
                          <span>
                            {e.side ? e.side + " " : ""}
                            {xy(e.id, m.n)}
                          </span>
                          <em>
                            {isSearch &&
                            ["astar", "weightedastar"].includes(m.finder)
                              ? `g${e.g} h${e.h} f${e.p}`
                              : isSearch &&
                                  ["dijkstra", "bellman"].includes(m.finder)
                                ? `cost ${e.g}`
                                : isSearch && m.finder === "greedy"
                                  ? `h ${e.h}`
                                  : i === 0
                                    ? structure === "Stack"
                                      ? "TOP"
                                      : "FRONT"
                                    : ""}
                          </em>
                        </div>
                      ))}
                      {s.frontier.length > 8 && (
                        <div className="more">
                          +{s.frontier.length - 8} more
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="hint">候補は空です。</p>
                  ))}
              </div>
            </div>
          </aside>
        </div>
        <div className="lowergrid">
          <section className="learning panel">
            <div className="panelhead learninghead">
              <div className="tabs" role="tablist" aria-label="教材表示">
                {[false, true].map((code) => (
                  <button
                    key={String(code)}
                    role="tab"
                    aria-selected={m.code === code}
                    className={m.code === code ? "active" : ""}
                    onClick={() => change(() => (m.code = code))}
                  >
                    {code ? "C# CODE" : "解説"}
                  </button>
                ))}
              </div>
              <select
                id="studyTarget"
                aria-label="教材の対象"
                value={m.study}
                onChange={(e) => change(() => (m.study = e.target.value))}
              >
                <option value="search">探索アルゴリズム</option>
                <option value="generation">生成アルゴリズム</option>
              </select>
            </div>
            {m.code ? (
              <CodeView
                kind={m.study}
                algorithm={algorithm}
                title={a[0]}
                s={s}
                highlight={
                  m.study === m.phase &&
                  (m.stepMode || (m.playing && speeds[m.speed] >= 500))
                }
              />
            ) : (
              <div id="explanation">
                <span className="eyebrow">
                  {m.study === "generation"
                    ? "MAZE GENERATION"
                    : "PATH FINDING"}
                </span>
                <h2>{a[0]}</h2>
                <p className="jptitle">{a[1]}</p>
                <p>{a[4]}</p>
                <div className="facts">
                  <div>
                    <span className="eyebrow">DATA STRUCTURE</span>
                    <strong>{a[2]}</strong>
                  </div>
                  <div>
                    <span className="eyebrow">TIME COMPLEXITY</span>
                    <strong>{a[3]}</strong>
                  </div>
                </div>
                <p className="hint">
                  V は頂点数、E
                  は辺数です。計算量は一般的な実装の目安で、描画・教材表示の処理は含みません。
                </p>
                <p className="learnnote">
                  {m.study === "generation"
                    ? "NEW MAZE で生成を観察。PAUSE → STEP で一手ずつ進められます。ループ追加は生成アルゴリズムとは別の後処理です。"
                    : "STEP を押して、候補の取り出し・追加・経路復元を観察しましょう。"}
                </p>
              </div>
            )}
          </section>
          <section className="results panel">
            <div className="panelhead">
              <span>STATISTICS</span>
              <span className="sectionno">03</span>
            </div>
            <div className="stats">
              {[
                ["VISITED", isSearch ? s.visited.size : "—"],
                [
                  "FRONTIER",
                  isSearch && m.finder !== "bellman" ? s.frontier.length : "—",
                ],
                [
                  "PATH LENGTH",
                  isSearch && s.found ? Math.max(0, s.path.length - 1) : "—",
                ],
                ["PATH COST", isSearch && s.found ? s.cost : "—"],
              ].map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <div className="coverage">
              <span>
                探索率 <b>{pct}%</b>
              </span>
              <span>
                計算時間 <b>{s.cpu.toFixed(2)} ms</b>
              </span>
            </div>
            <div className="progress">
              <div style={{ width: pct + "%" }} />
            </div>
            <p className="hint">
              経路長は移動回数。計算時間は描画・待機を除く参考値です。生成中は探索統計を表示しません。
            </p>
            <div className="comparehead">
              <h2>同じ迷路で比較</h2>
              <button
                className="quiet"
                onClick={() => change(() => (m.results = []))}
              >
                クリア
              </button>
            </div>
            <div className="tablewrap">
              <table>
                <thead>
                  <tr>
                    {["Algorithm", "Visited", "Path", "Cost"].map((t) => (
                      <th key={t}>{t}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {m.results.map((r, i) => (
                    <tr key={i}>
                      <td>{searches[r.key][0]}</td>
                      <td>{r.visited}</td>
                      <td>{r.path ?? "なし"}</td>
                      <td>{r.cost ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!m.results.length && (
              <p className="hint">探索を完了すると、ここに結果が残ります。</p>
            )}
          </section>
        </div>
        <footer>
          <span>MAZE LABORATORY</span>
          <span>9 generators / 8 path finders · C# implementations</span>
        </footer>
      </main>
    </>
  );
}
