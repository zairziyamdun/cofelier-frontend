import { describe, expect, it } from "vitest";

import { movePhoto } from "./compress-image";

describe("порядок фото", () => {
  it("меняет местами соседей и не выходит за края", () => {
    expect(movePhoto([1, 2, 3], 2, -1)).toEqual([1, 3, 2]);
    expect(movePhoto([1, 2, 3], 0, -1)).toEqual([1, 2, 3]);
    expect(movePhoto([1, 2, 3], 2, 1)).toEqual([1, 2, 3]);
  });
});
