import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { debounce, slidingWindow, throttle } from "./timing";

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); });

describe("debounce", () => {
  it("runs once with the last arguments after the quiet period", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);
    debounced("a"); debounced("ab"); debounced("abc");
    vi.advanceTimersByTime(199);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledExactlyOnceWith("abc");
  });
  it("supports cancel and flush", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);
    debounced(1); debounced.cancel(); vi.advanceTimersByTime(500);
    expect(fn).not.toHaveBeenCalled();
    debounced(2); expect(debounced.pending()).toBe(true); debounced.flush();
    expect(fn).toHaveBeenCalledExactlyOnceWith(2);
    expect(debounced.pending()).toBe(false);
  });
});

describe("throttle", () => {
  it("runs immediately, then at most once per interval with the latest arguments", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 1000);
    throttled(1); throttled(2); throttled(3);
    expect(fn).toHaveBeenCalledExactlyOnceWith(1);
    vi.advanceTimersByTime(1000);
    expect(fn).toHaveBeenLastCalledWith(3);
    expect(fn).toHaveBeenCalledTimes(2);
  });
  it("drops calls inside the interval when trailing is off", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 1000, { trailing: false });
    throttled(1); throttled(2); vi.advanceTimersByTime(1000); throttled(3);
    expect(fn.mock.calls).toEqual([[1], [3]]);
  });
});

describe("slidingWindow", () => {
  it("allows up to the limit and reports the wait until the oldest hit expires", () => {
    const limiter = slidingWindow(2, 60_000);
    expect(limiter.take("u", 0)).toBe(0);
    expect(limiter.take("u", 10_000)).toBe(0);
    expect(limiter.take("u", 20_000)).toBe(40_000);
    expect(limiter.take("other", 20_000)).toBe(0);
    expect(limiter.take("u", 60_000)).toBe(0);
  });
});
