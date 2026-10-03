# 参照と再実装方針

参照: https://maze-algorithm-laboratory.guzaisann.chatgpt.site/

2026-10-03に公開画面とSTEP操作を確認。Sitesの履歴上の最新版はversion 2、source commit `9e63882adff2fa3dadee97a7744680020151686e`。
既存のローカル公開ソース `/workspace/sites/maze-laboratory/dist` を参照し、Sitesそのものは変更していません。

元の静的DOM更新をReactコンポーネントへ移し、再生ループはeffectとtimerのcleanupで管理します。Canvasの描画、生成・探索のイベント分割、SIMPLE C#教材、配色とレスポンシブレイアウトを継承します。

GitHub Pages用のVite base、依存関係のlockfile、build/testワークフロー、mainでのみdeployするワークフローを追加しています。

Sites専用hosting設定とWebMCP登録は移植対象に含めません。ユーザーが操作する迷路・教材機能は静的Webアプリで完結します。

## レビュー手順

1. npm ci / npm test / npm run build
2. 初期盤面でSTEPを押し、QueueとACTIONを確認
3. C# CODEへ切替、関連コードの強調とCopy Codeを確認
4. NEW MAZE → PAUSE → STEPで生成を観察
5. ループと重みを変更し、BFS / Dijkstra / A*の比較結果を確認
6. 手書き編集で壁・通路・START / GOALを変更
7. 320px幅とPC幅で操作・コードスクロールを確認

mainへのmergeはリポジトリ所有者がレビュー後に実施します。
