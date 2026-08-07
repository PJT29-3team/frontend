import { describe, expect, it } from "vitest";
import { formatPyeong, toPyeong } from "./area";

describe("전용면적 표기", () => {
  it.each([
    // 국민주택 규격
    [59.92, 18],
    [84.82, 26],
    [114.9, 35],
    // 경계: 3.305785㎡ = 1평
    [3.305785, 1],
    [1.65, 0],
  ])("%s㎡ → %s평", (sqm, expected) => {
    expect(toPyeong(sqm)).toBe(expected);
  });

  it("㎡ 값에 '평'만 붙이지 않는다", () => {
    // 84.82㎡ 를 그대로 쓰면 "84.8평"이 되는 버그가 있었다.
    expect(formatPyeong(84.82)).toBe("26평");
  });

  it("문자열로 와도 변환한다", () => {
    expect(formatPyeong("84.82")).toBe("26평");
  });

  it.each([null, undefined, "", "abc"])("값이 없거나 숫자가 아니면 '-' (%s)", (value) => {
    expect(formatPyeong(value)).toBe("-");
    expect(toPyeong(value)).toBeNull();
  });

  it("0㎡ 는 0평이다", () => {
    expect(formatPyeong(0)).toBe("0평");
  });
});
