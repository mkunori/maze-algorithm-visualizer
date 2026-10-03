export const extraGeneration = {
  growing: `    public static int[,] GrowingTree(int n)
    {
        var maze = Empty(n);
        var active = new List<(int X, int Y)> { (1, 1) };
        maze[1, 1] = 1;
        while (active.Count > 0)
        {
            int i = Random.Shared.NextDouble() < 0.75
                ? active.Count - 1 : Random.Shared.Next(active.Count);
            var (x, y) = active[i];
            var choices = Neighbors(n, x, y)
                .Where(p => maze[p.Y, p.X] == 0).ToList();
            if (choices.Count == 0)
            {
                active.RemoveAt(i);
                continue;
            }
            var next = choices[Random.Shared.Next(choices.Count)];
            maze[(y + next.Y) / 2, (x + next.X) / 2] = 1;
            maze[next.Y, next.X] = 1;
            active.Add(next);
        }
        return maze;
    }`,
  hunt: `    public static int[,] HuntAndKill(int n)
    {
        var maze = Empty(n);
        int x = 1, y = 1;
        maze[y, x] = 1;
        while (true)
        {
            var choices = Neighbors(n, x, y)
                .Where(p => maze[p.Y, p.X] == 0).ToList();
            if (choices.Count > 0)
            {
                var next = choices[Random.Shared.Next(choices.Count)];
                maze[(y + next.Y) / 2, (x + next.X) / 2] = 1;
                (x, y) = next;
                maze[y, x] = 1;
                continue;
            }
            // 行き止まりから戻る代わりに、再開地点を走査。
            bool found = false;
            for (int sy = 1; sy < n - 1 && !found; sy += 2)
                for (int sx = 1; sx < n - 1 && !found; sx += 2)
                {
                    if (maze[sy, sx] != 0) continue;
                    var connected = Neighbors(n, sx, sy)
                        .Where(p => maze[p.Y, p.X] != 0).ToList();
                    if (connected.Count == 0) continue;
                    var neighbor = connected[Random.Shared.Next(connected.Count)];
                    maze[(sy + neighbor.Y) / 2, (sx + neighbor.X) / 2] = 1;
                    maze[sy, sx] = 1;
                    (x, y) = (sx, sy);
                    found = true;
                }
            if (!found) break;
        }
        return maze;
    }`,
  aldous: `    public static int[,] AldousBroder(int n)
    {
        var maze = Empty(n);
        int x = 1, y = 1, visited = 1;
        int total = ((n - 1) / 2) * ((n - 1) / 2);
        maze[y, x] = 1;
        // 完了までの歩数はランダム。大きい迷路では長くなります。
        while (visited < total)
        {
            var choices = Neighbors(n, x, y);
            var next = choices[Random.Shared.Next(choices.Count)];
            if (maze[next.Y, next.X] == 0)
            {
                maze[(y + next.Y) / 2, (x + next.X) / 2] = 1;
                maze[next.Y, next.X] = 1;
                visited++;
            }
            (x, y) = next; // 既訪問でも必ず移動
        }
        return maze;
    }`,
};
export const bellmanCode = `    public static List<Point> BellmanFord(int[,] maze, Point start, Point goal)
    {
        var vertices = new List<Point>();
        for (int y = 0; y < maze.GetLength(0); y++)
            for (int x = 0; x < maze.GetLength(1); x++)
                if (maze[y, x] > 0) vertices.Add(new Point(x, y));
        var distance = new Dictionary<Point, int> { [start] = 0 };
        var parent = new Dictionary<Point, Point>();
        // この教材の地形は正のコストのみ。負閉路判定は不要。
        for (int pass = 1; pass < vertices.Count; pass++)
        {
            bool changed = false;
            foreach (Point current in vertices)
            {
                if (!distance.TryGetValue(current, out int g)) continue;
                foreach (Point next in GetNeighbors(maze, current))
                {
                    int newG = g + maze[next.Y, next.X];
                    if (distance.TryGetValue(next, out int oldG) && newG >= oldG)
                        continue;
                    distance[next] = newG;
                    parent[next] = current;
                    changed = true;
                }
            }
            if (!changed) break;
        }
        return distance.ContainsKey(goal) ? BuildPath(parent, start, goal) : [];
    }`;
export const loopCode = `
    // 生成した迷路に後処理でループを追加。ratio = 0.15 / 0.45。
    // 呼び出し例: MazeGenerator.AddLoops(maze, 0.15);
    public static void AddLoops(int[,] maze, double ratio)
    {
        if (ratio <= 0) return;
        var walls = new List<(int X, int Y)>();
        int n = maze.GetLength(0);
        for (int y = 1; y < n - 1; y++)
            for (int x = 1; x < n - 1; x++)
            {
                if (maze[y, x] != 0) continue;
                bool horizontal = x % 2 == 0 && y % 2 == 1
                    && maze[y, x - 1] > 0 && maze[y, x + 1] > 0;
                bool vertical = x % 2 == 1 && y % 2 == 0
                    && maze[y - 1, x] > 0 && maze[y + 1, x] > 0;
                if (horizontal || vertical) walls.Add((x, y));
            }
        Shuffle(walls);
        int count = Math.Min(walls.Count,
            Math.Max(1, (int)Math.Floor(walls.Count * Math.Clamp(ratio, 0, 1) + 0.5)));
        foreach (var wall in walls.Take(count)) maze[wall.Y, wall.X] = 1;
    }
`;
