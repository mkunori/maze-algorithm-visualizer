import type { MazeState } from "./types";
export function draw(
  c: HTMLCanvasElement,
  s: MazeState,
  phase: string,
  start: number,
  goal: number,
) {
  const n = s.n,
    ctx = c.getContext("2d")!,
    size = 840 / n;
  ctx.clearRect(0, 0, 840, 840);
  const frontier = new Set(s.frontier.map((e) => e.id)),
    pathSet = new Set(s.path);
  for (let v = 0; v < n * n; v++) {
    let x = (v % n) * size,
      y = Math.floor(v / n) * size,
      val = s.grid[v];
    ctx.fillStyle =
      val === 0
        ? "#27394b"
        : val === 5
          ? "#d5b583"
          : val === 10
            ? "#7cbae1"
            : "#f5f8fa";
    if (s.visited.has(v) && phase === "search")
      ctx.fillStyle =
        val === 5 ? "#c1b291" : val === 10 ? "#8dafc8" : "#dce8f2";
    if (frontier.has(v)) ctx.fillStyle = "#beece1";
    if (pathSet.has(v)) ctx.fillStyle = "#35bb9e";
    if (v === s.current) ctx.fillStyle = "#f7bc51";
    ctx.fillRect(x, y, size + 0.3, size + 0.3);
    if (val) {
      ctx.strokeStyle = "#17233008";
      ctx.lineWidth = 0.6;
      ctx.strokeRect(x, y, size, size);
    }
    if (s.visited.has(v) && phase === "search" && !pathSet.has(v)) {
      ctx.fillStyle = "#7992a7";
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, 1.7, 0, Math.PI * 2);
      ctx.fill();
    }
    if (frontier.has(v)) {
      ctx.strokeStyle = "#258c78";
      ctx.lineWidth = 1.4;
      ctx.strokeRect(
        x + size * 0.28,
        y + size * 0.28,
        size * 0.44,
        size * 0.44,
      );
    }
    if (val > 1 && !pathSet.has(v)) {
      ctx.fillStyle = "#344d60";
      ctx.font = `${size * 0.36}px Consolas,monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(val), x + size / 2, y + size / 2);
    }
    if (v === s.current) {
      ctx.strokeStyle = "#835009";
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
    }
  }
  if (s.path.length > 1) {
    ctx.strokeStyle = "#126d5e";
    ctx.lineWidth = Math.max(2, size * 0.13);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    s.path.forEach((v, i) => {
      let x = ((v % n) + 0.5) * size,
        y = (Math.floor(v / n) + 0.5) * size;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.stroke();
  }
  for (const [v, label, color] of [
    [start, "S", "#087f70"],
    [goal, "G", "#9f4d66"],
  ] as [number, string, string][]) {
    let x = (v % n) * size,
      y = Math.floor(v / n) * size;
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `bold ${size * 0.65}px Inter, sans-serif`;
    ctx.fillText(label, x + size / 2, y + size * 0.54);
  }
}
