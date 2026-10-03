import { useState } from "react";
import { getCode } from "./codes.js";
import type { MazeState } from "./types";
const tokens =
  /(\/\/.*$|"(?:[^"\\]|\\.)*"|\b(?:public|private|static|readonly|record|struct|class|sealed|int|bool|var|void|new|return|if|else|while|for|foreach|in|continue|break|throw|yield|out|is|not|null|true|false)\b|\b\d+\b)/g;
function syntax(line: string) {
  return line.split(tokens).map((p, i) => (
    <span
      key={i}
      className={
        p.startsWith("//")
          ? "comment"
          : p.startsWith('"')
            ? "str"
            : /^\d+$/.test(p)
              ? "num"
              : /^(public|private|static|readonly|record|struct|class|sealed|int|bool|var|void|new|return|if|else|while|for|foreach|in|continue|break|throw|yield|out|is|not|null|true|false)$/.test(
                    p,
                  )
                ? "kw"
                : undefined
      }
    >
      {p}
    </span>
  ));
}
export function CodeView({
  kind,
  algorithm,
  title,
  s,
  highlight,
}: {
  kind: string;
  algorithm: string;
  title: string;
  s: MazeState;
  highlight: boolean;
}) {
  const code = getCode(kind, algorithm) as string;
  const [copied, setCopied] = useState(false);
  const patterns: Record<string, RegExp> = {
    pop: /\.(Dequeue|Pop|Peek)\(/,
    push: /\.(Enqueue|Push)\(|parent\[next\]|distance\[next\]|own\[next\]/,
    path: /path.Add|goal = parent/,
    scan: /foreach \(Point current|for \(int sy/,
    walk: /\(x, y\) = next/,
    loop: /maze\[wall.Y, wall.X\]/,
    carve: /maze\[.*\] = 1/,
    divide: /maze\[.*\] = 0/,
    skip: /continue/,
  };
  return (
    <div id="codeView">
      <div className="codebar">
        <span>{title.replaceAll(" ", "")}.cs</span>
        <button
          className="quiet"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            } catch {
              setCopied(false);
              window
                .getSelection()
                ?.selectAllChildren(document.getElementById("code")!);
            }
          }}
        >
          {copied ? "Copied!" : "Copy Code"}
        </button>
      </div>
      <p className="codehint">
        SIMPLE · .NET 8 以降 / C# 12 · 関連する処理部分を強調表示
      </p>
      <pre id="code" tabIndex={0} aria-label="C#実装例">
        {code.split("\n").map((line, i) => (
          <span
            className={`codeline ${highlight && patterns[s.tag]?.test(line) ? "highlight" : ""}`}
            key={i}
          >
            <span className="ln">{i + 1}</span>
            {syntax(line)}
          </span>
        ))}
      </pre>
    </div>
  );
}
