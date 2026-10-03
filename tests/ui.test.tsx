// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, it, expect, vi } from "vitest";
import {
  render,
  fireEvent,
  screen,
  cleanup,
  act,
} from "@testing-library/react";
import App from "../src/App";
beforeEach(() => {
  vi.useFakeTimers();
  const context = new Proxy({}, { get: () => vi.fn(), set: () => true });
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    context as CanvasRenderingContext2D,
  );
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});
it("steps, shows queue and code, then resets the same maze", () => {
  render(<App />);
  fireEvent.click(screen.getByText("▸| STEP"));
  expect(screen.getByText("0001")).toBeTruthy();
  expect(screen.getByText("START (1, 1) を追加しました。")).toBeTruthy();
  expect(screen.getByText("FRONT")).toBeTruthy();
  fireEvent.click(screen.getByRole("tab", { name: "C# CODE" }));
  expect(document.querySelector("#code")?.textContent).toContain(
    "queue.Enqueue",
  );
  expect(document.querySelector(".highlight")).toBeTruthy();
  fireEvent.click(screen.getByText("↺ RESET"));
  expect(screen.getByText("0000")).toBeTruthy();
  expect(screen.getByText("READY")).toBeTruthy();
});
it("plays, pauses, changes algorithm, terrain and size", async () => {
  render(<App />);
  fireEvent.click(screen.getByText("▶ PLAY"));
  expect(screen.getByText("RUNNING")).toBeTruthy();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(100);
  });
  fireEvent.click(screen.getByText("Ⅱ PAUSE"));
  expect(screen.getByText("PAUSED")).toBeTruthy();
  const select = document.querySelector("#finder")!;
  fireEvent.change(select, { target: { value: "astar" } });
  expect(screen.getByRole("heading", { name: "A*" })).toBeTruthy();
  fireEvent.click(screen.getByRole("checkbox"));
  expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "15 × 15" }));
  expect(
    screen
      .getByRole("button", { name: "15 × 15" })
      .getAttribute("aria-pressed"),
  ).toBe("true");
});
it("completes generation, completes search and records comparison", async () => {
  render(<App />);
  fireEvent.change(document.querySelector("#generator")!, {
    target: { value: "binary" },
  });
  fireEvent.change(document.querySelector("#loopMode")!, {
    target: { value: "many" },
  });
  fireEvent.change(document.querySelector("#speed")!, {
    target: { value: "5" },
  });
  fireEvent.click(screen.getByText("↻ NEW MAZE"));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2000);
  });
  expect(screen.getByText("COMPLETE")).toBeTruthy();
  fireEvent.click(screen.getByText("探索する"));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2000);
  });
  expect(screen.getByText("COMPLETE")).toBeTruthy();
  expect(document.querySelectorAll("tbody tr")).toHaveLength(1);
  expect(document.querySelector("tbody")?.textContent).toContain(
    "Breadth First Search",
  );
});
