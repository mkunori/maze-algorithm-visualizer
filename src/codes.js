import { extraGeneration, bellmanCode, loopCode } from "./extra-codes.js";
const searchHelpers = `    public readonly record struct Point(int X, int Y);

    // maze[y, x]: 0 = 壁、1 = 通路、5 = 泥、10 = 水
    // start / goal は範囲内の通路を指定します。
    private static IEnumerable<Point> GetNeighbors(int[,] maze, Point p)
    {
        Point[] directions = [new(0, -1), new(1, 0), new(0, 1), new(-1, 0)];
        foreach (Point d in directions)
        {
            Point next = new(p.X + d.X, p.Y + d.Y);
            if (next.X >= 0 && next.X < maze.GetLength(1)
                && next.Y >= 0 && next.Y < maze.GetLength(0)
                && maze[next.Y, next.X] > 0)
                yield return next;
        }
    }

    private static int Heuristic(Point a, Point b)
        => Math.Abs(a.X - b.X) + Math.Abs(a.Y - b.Y);

    private static List<Point> BuildPath(
        Dictionary<Point, Point> parent, Point start, Point goal)
    {
        var path = new List<Point> { goal };
        while (goal != start)
        {
            goal = parent[goal];
            path.Add(goal);
        }
        path.Reverse();
        return path;
    }`;
function basic(dfs) {
  const ds = dfs ? "stack" : "queue",
    typ = dfs ? "Stack" : "Queue",
    put = dfs ? "Push" : "Enqueue",
    get = dfs ? "Pop" : "Dequeue";
  return `    public static List<Point> ${dfs ? "DepthFirstSearch" : "BreadthFirstSearch"}(
        int[,] maze, Point start, Point goal)
    {
        var ${ds} = new ${typ}<Point>();
        var visited = new HashSet<Point> { start };
        var parent = new Dictionary<Point, Point>();
        ${ds}.${put}(start);

        while (${ds}.Count > 0)
        {
            Point current = ${ds}.${get}();
            if (current == goal)
                return BuildPath(parent, start, goal);

            foreach (Point next in GetNeighbors(maze, current))
            {
                // 登録時に訪問済みにして重複を防ぎます。
                if (!visited.Add(next)) continue;
                parent[next] = current;
                ${ds}.${put}(next);
            }
        }
        return []; // 到達不能
    }`;
}
function priority(type) {
  let astar = type === "astar" || type === "weightedastar",
    greedy = type === "greedy",
    name =
      type === "weightedastar"
        ? "WeightedAStar"
        : astar
          ? "AStar"
          : greedy
            ? "GreedyBestFirst"
            : "Dijkstra";
  return `    public static List<Point> ${name}(
        int[,] maze, Point start, Point goal)
    {
        // order により同じ優先度の要素を追加順に処理します。
        var open = new PriorityQueue<(Point P, int G), (int Priority, int Order)>();
        var distance = new Dictionary<Point, int> { [start] = 0 };
        var parent = new Dictionary<Point, Point>();
        var closed = new HashSet<Point>();
        int order = 0;
        open.Enqueue((start, 0), (${type === "dijkstra" ? "0" : type === "weightedastar" ? "2 * Heuristic(start, goal)" : "Heuristic(start, goal)"}, order++));

        while (open.Count > 0)
        {
            var (current, g) = open.Dequeue();
            // 更新前の古い候補を無視します。
            if (g != distance[current] || !closed.Add(current)) continue;
            if (current == goal)
                return BuildPath(parent, start, goal);

            foreach (Point next in GetNeighbors(maze, current))
            {
                if (closed.Contains(next)) continue;
                int newG = g + maze[next.Y, next.X];
                if (${greedy ? "distance.ContainsKey(next)" : "distance.TryGetValue(next, out int oldG) && newG >= oldG"}) continue;
                distance[next] = newG;
                parent[next] = current;
                int priority = ${astar ? (type === "weightedastar" ? "newG + 2 * Heuristic(next, goal)" : "newG + Heuristic(next, goal)") : greedy ? "Heuristic(next, goal)" : "newG"};
                open.Enqueue((next, newG), (priority, order++));
            }
        }
        return [];
    }`;
}
const bidirectional = `    public static List<Point> BidirectionalBfs(int[,] maze, Point start, Point goal)
    {
        if (start == goal) return [start];
        var a = new Queue<Point>();
        var b = new Queue<Point>();
        var pa = new Dictionary<Point, Point> { [start] = start };
        var pb = new Dictionary<Point, Point> { [goal] = goal };
        a.Enqueue(start);
        b.Enqueue(goal);
        while (a.Count > 0 && b.Count > 0)
        {
            Point? meet = ExpandLayer(maze, a, pa, pb)
                ?? ExpandLayer(maze, b, pb, pa);
            if (meet is not Point m) continue;
            var path = BuildPath(pa, start, m);
            // GOAL側の親はGOALを向いています。
            while (m != goal)
            {
                m = pb[m];
                path.Add(m);
            }
            return path;
        }
        return [];
    }

    private static Point? ExpandLayer(int[,] maze, Queue<Point> queue,
        Dictionary<Point, Point> own, Dictionary<Point, Point> other)
    {
        int count = queue.Count; // 必ず1層単位で展開
        for (int i = 0; i < count; i++)
        {
            Point current = queue.Dequeue();
            foreach (Point next in GetNeighbors(maze, current))
            {
                if (own.ContainsKey(next)) continue;
                own[next] = current;
                queue.Enqueue(next);
                if (other.ContainsKey(next)) return next;
            }
        }
        return null;
    }`;
const genHelpers = `    // 奇数サイズ n >= 5。0 = 壁、1 = 通路。
    // START=(1,1)、GOAL=(n-2,n-2)
    private static int[,] Empty(int n)
    {
        if (n < 5 || n % 2 == 0)
            throw new ArgumentException("n must be odd and >= 5");
        return new int[n, n];
    }

    private static List<(int X, int Y)> Neighbors(int n, int x, int y)
    {
        (int X, int Y)[] candidates = [(x, y-2), (x+2, y), (x, y+2), (x-2, y)];
        return candidates.Where(p => p.X > 0 && p.X < n-1
            && p.Y > 0 && p.Y < n-1).ToList();
    }

    private static void Shuffle<T>(List<T> items)
    {
        for (int i = items.Count - 1; i > 0; i--)
        {
            int j = Random.Shared.Next(i + 1);
            (items[i], items[j]) = (items[j], items[i]);
        }
    }`;
const gens = {
  backtracker: `    public static int[,] RecursiveBacktracker(int n)
    {
        var maze = Empty(n);
        var stack = new Stack<(int X, int Y)>();
        stack.Push((1, 1));
        maze[1, 1] = 1;
        while (stack.Count > 0)
        {
            var (x, y) = stack.Peek();
            var choices = Neighbors(n, x, y)
                .Where(p => maze[p.Y, p.X] == 0).ToList();
            if (choices.Count == 0)
            {
                stack.Pop();
                continue;
            }
            var next = choices[Random.Shared.Next(choices.Count)];
            maze[(y + next.Y) / 2, (x + next.X) / 2] = 1;
            maze[next.Y, next.X] = 1;
            stack.Push(next);
        }
        return maze;
    }`,
  prim: `    public static int[,] RandomizedPrim(int n)
    {
        var maze = Empty(n);
        var edges = new List<(int X, int Y, int NX, int NY)>();
        void AddEdges(int x, int y)
        {
            foreach (var p in Neighbors(n, x, y))
                if (maze[p.Y, p.X] == 0) edges.Add((x, y, p.X, p.Y));
        }
        maze[1, 1] = 1;
        AddEdges(1, 1);
        while (edges.Count > 0)
        {
            int index = Random.Shared.Next(edges.Count);
            var (x, y, nx, ny) = edges[index];
            edges[index] = edges[^1]; // O(1)で候補を除去
            edges.RemoveAt(edges.Count - 1);
            if (maze[ny, nx] != 0) continue;
            maze[(y + ny) / 2, (x + nx) / 2] = 1;
            maze[ny, nx] = 1;
            AddEdges(nx, ny);
        }
        return maze;
    }`,
  kruskal: `    public static int[,] RandomizedKruskal(int n)
    {
        var maze = Empty(n);
        var uf = new UnionFind(n * n);
        var edges = new List<(int X, int Y, int NX, int NY)>();
        for (int y = 1; y < n - 1; y += 2)
            for (int x = 1; x < n - 1; x += 2)
            {
                maze[y, x] = 1;
                if (x + 2 < n - 1) edges.Add((x, y, x + 2, y));
                if (y + 2 < n - 1) edges.Add((x, y, x, y + 2));
            }
        Shuffle(edges);
        foreach (var (x, y, nx, ny) in edges)
            if (uf.Union(y * n + x, ny * n + nx))
                maze[(y + ny) / 2, (x + nx) / 2] = 1;
        return maze;
    }

    private sealed class UnionFind
    {
        private readonly int[] parent;
        private readonly int[] rank;
        public UnionFind(int n)
        {
            parent = Enumerable.Range(0, n).ToArray();
            rank = new int[n];
        }
        private int Find(int x)
        {
            if (parent[x] != x) parent[x] = Find(parent[x]);
            return parent[x];
        }
        public bool Union(int a, int b)
        {
            a = Find(a); b = Find(b);
            if (a == b) return false;
            if (rank[a] < rank[b]) (a, b) = (b, a);
            parent[b] = a;
            if (rank[a] == rank[b]) rank[a]++;
            return true;
        }
    }`,
  division: `    public static int[,] RecursiveDivision(int n)
    {
        var maze = Empty(n);
        for (int y = 1; y < n - 1; y++)
            for (int x = 1; x < n - 1; x++) maze[y, x] = 1;
        Divide(1, 1, n - 2, n - 2);
        return maze;

        int Pick(int first, int last)
            => first + 2 * Random.Shared.Next((last - first) / 2 + 1);

        void Divide(int x1, int y1, int x2, int y2)
        {
            if (x2 - x1 < 2 || y2 - y1 < 2) return;
            bool horizontal = y2 - y1 > x2 - x1
                || (y2 - y1 == x2 - x1 && Random.Shared.Next(2) == 0);
            if (horizontal)
            {
                int wall = Pick(y1 + 1, y2 - 1);
                int hole = Pick(x1, x2);
                for (int x = x1; x <= x2; x++)
                    if (x != hole) maze[wall, x] = 0;
                Divide(x1, y1, x2, wall - 1);
                Divide(x1, wall + 1, x2, y2);
            }
            else
            {
                int wall = Pick(x1 + 1, x2 - 1);
                int hole = Pick(y1, y2);
                for (int y = y1; y <= y2; y++)
                    if (y != hole) maze[y, wall] = 0;
                Divide(x1, y1, wall - 1, y2);
                Divide(wall + 1, y1, x2, y2);
            }
        }
    }`,
  binary: `    public static int[,] BinaryTree(int n)
    {
        var maze = Empty(n);
        for (int y = 1; y < n - 1; y += 2)
            for (int x = 1; x < n - 1; x += 2)
            {
                maze[y, x] = 1;
                var choices = new List<(int X, int Y)>();
                if (y > 1) choices.Add((x, y - 1));
                if (x < n - 2) choices.Add((x + 1, y));
                if (choices.Count == 0) continue;
                var wall = choices[Random.Shared.Next(choices.Count)];
                maze[wall.Y, wall.X] = 1;
            }
        return maze;
    }`,
  sidewinder: `    public static int[,] Sidewinder(int n)
    {
        var maze = Empty(n);
        for (int y = 1; y < n - 1; y += 2)
        {
            var run = new List<int>();
            for (int x = 1; x < n - 1; x += 2)
            {
                maze[y, x] = 1;
                run.Add(x);
                bool close = x == n - 2
                    || (y > 1 && Random.Shared.Next(2) == 0);
                if (close)
                {
                    if (y > 1)
                    {
                        int chosen = run[Random.Shared.Next(run.Count)];
                        maze[y - 1, chosen] = 1;
                    }
                    run.Clear();
                }
                else maze[y, x + 1] = 1;
            }
        }
        return maze;
    }`,
};
export function getCode(kind, key) {
  const body =
    kind === "generation"
      ? (gens[key] ?? extraGeneration[key])
      : key === "bellman"
        ? bellmanCode
        : key === "bfs"
          ? basic(false)
          : key === "dfs"
            ? basic(true)
            : key === "bidirectional"
              ? bidirectional
              : priority(key);
  return `using System;
using System.Collections.Generic;
using System.Linq;

// クラスをプロジェクトへ追加し、public メソッドを呼び出してください。
public static class ${kind === "generation" ? "MazeGenerator" : "PathFinder"}
{
${body}

${kind === "generation" ? genHelpers + loopCode : searchHelpers}
}`;
}
