export interface Entry {
  id: number;
  g?: number;
  h?: number;
  p?: number;
  side?: string;
}
export interface MazeState {
  n: number;
  grid: number[];
  start: number;
  goal: number;
  current: number;
  visited: Set<number>;
  frontier: Entry[];
  path: number[];
  step: number;
  action: string;
  next: string;
  tag: string;
  done: boolean;
  cost: number;
  cpu: number;
  found: boolean;
}
export type Phase = "ready" | "generation" | "search";
export interface Result {
  key: string;
  visited: number;
  path: number | null;
  cost: number | null;
}
