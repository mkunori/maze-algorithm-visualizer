# Maze Algorithm Visualizer

React + TypeScript + Viteで動作する、迷路生成・探索の学習アプリです。
迷路生成と経路探索を1ステップずつ観察し、データ構造やC#実装例とともにアルゴリズムを学べます。

[公開サイトを開く](https://mkunori.github.io/maze-algorithm-visualizer/)

## 実行

Node.js 24を使用します。

```sh
npm ci
npm run dev
```

表示されたURL（`/maze-algorithm-visualizer/`）を開きます。

```sh
npm test
npm run build
npm run preview
```

## 機能

- 生成: Recursive Backtracker / Randomized Prim / Randomized Kruskal / Recursive Division / Binary Tree / Sidewinder / Hunt and Kill / Growing Tree / Aldous–Broder
- 探索: BFS / DFS / Dijkstra / A* / Greedy Best First / Bidirectional BFS / Weighted A* / Bellman–Ford
- 15×15、21×21、31×31、ループなし／少なめ／多め
- PLAY / PAUSE / STEP / RESET、6段階の速度、経路復元
- STEP時の候補表示（最大8件）、処理説明、関連C#コードの強調
- 重み付き地形（移動先のコスト1 / 5 / 10）、手書き編集、同一迷路での結果比較
- SIMPLE版C#コード、補助コード、行番号、構文色、コピー
- Spaceで再生／停止、右矢印でSTEP（入力欄の操作中は無効）

初期状態は21×21、Backtracker、BFS、生成済み迷路です。NEW MAZEの生成途中もPAUSEとSTEPで観察できます。RESETは生成途中なら生成を完了させ、同じ迷路を探索前の状態へ戻します。迷路や地形の変更で比較結果をクリアします。

## GitHub Pages

`main`へのpushで、GitHub Actionsがテスト・build・GitHub Pagesへのdeployを実行します。Pull Requestと`main`以外のブランチへのpushでは、テストとbuildを実行します。

このリポジトリをfork、またはcloneして自分のGitHubリポジトリで公開する場合は、公開先リポジトリの **Settings → Pages → Source** を **GitHub Actions** に設定してください。

現在の`vite.config.ts`の`base`は`/maze-algorithm-visualizer/`です。別のリポジトリ名で公開する場合は、`base`を`/<リポジトリ名>/`に変更してください。例えば、リポジトリ名が`maze-demo`なら`/maze-demo/`にします。

プロジェクトサイトの公開URLは`https://<ユーザー名>.github.io/<リポジトリ名>/`です。このリポジトリの公開URLは https://mkunori.github.io/maze-algorithm-visualizer/ です。

## 構成

- `src/App.tsx`: React画面
- `src/useMaze.ts`: 再生・生成・探索・編集の状態管理
- `src/draw.ts`: Canvas描画
- `src/types.ts`: アプリ状態の型
- `src/engine.js`: 迷路生成・経路探索エンジン（JSDocで状態型を指定）
- `src/codes.js`, `src/extra-codes.js`: C#教材
- `tests/`: アルゴリズムと画面操作の自動テスト

画面・状態管理・描画はTypeScript、生成・探索エンジンとC#教材はJavaScriptモジュールで実装しています。ブラウザー内で動作する静的Webアプリです。

## 検証

101テスト。9生成法×3サイズ×3ループ設定の81ケースごとに、無重み／重み付きで8探索法を実行（1,296探索ケース）。迷路の連結性、閉路、経路の隣接性とコスト、BFSと双方向BFSの距離一致、Dijkstra・A*・Bellman–Fordのコスト一致を検証します。さらに到達不可、開始＝終了、Heapの安定順序、ReactのSTEP・リセット・再生・停止・生成・比較記録を検証します。

計算時間は描画と待機を除いた参考値です。手書き編集では到達不可の迷路も作れます。BFSと双方向BFSは移動回数を、Dijkstra・A*・Bellman–Fordは地形コストを最小化します。Weighted A*とGreedyは最小コストを保証しません。
