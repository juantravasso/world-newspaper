import {
  describe,
  expect,
  it,
} from "vitest";

import {
  limitPerSource,
} from "@/server/news/limit-per-source";

describe("limitPerSource", () => {
  it("keeps every source represented when one source publishes much more", () => {
    const prolific =
      Array.from(
        {
          length:
            20,
        },
        (_, index) => ({
          id:
            `prolific-${index}`,

          sourceId:
            "prolific",
        }),
      );

    const ordered = [
      ...prolific,
      {
        id:
          "quiet-1",

        sourceId:
          "quiet",
      },
    ];

    const limited =
      limitPerSource(
        ordered,
        6,
      );

    expect(
      limited.filter(
        (item) =>
          item.sourceId ===
          "prolific",
      ),
    ).toHaveLength(6);

    expect(
      limited.map(
        (item) =>
          item.id,
      ),
    ).toContain("quiet-1");
  });

  it("preserves the incoming order", () => {
    const ordered = [
      {
        id:
          "a1",

        sourceId:
          "a",
      },
      {
        id:
          "b1",

        sourceId:
          "b",
      },
      {
        id:
          "a2",

        sourceId:
          "a",
      },
    ];

    expect(
      limitPerSource(
        ordered,
        1,
      ).map(
        (item) =>
          item.id,
      ),
    ).toEqual([
      "a1",
      "b1",
    ]);
  });
});
