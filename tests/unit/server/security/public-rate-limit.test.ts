import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  checkPublicRateLimit,
} from "@/server/security/public-rate-limit";

const policy = {
  name:
    "test-policy",

  maxRequests:
    3,

  windowMs:
    60_000,
};

function requestFrom(
  address: string,
): Request {
  return new Request(
    "https://example.test/api",
    {
      headers: {
        "x-forwarded-for":
          `${address}, 10.0.0.1`,
      },
    },
  );
}

describe("checkPublicRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(
      new Date(
        "2026-11-25T12:00:00Z",
      ),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows up to the limit and blocks the next request", () => {
    const request =
      requestFrom(
        "203.0.113.1",
      );

    for (
      let attempt = 0;
      attempt < 3;
      attempt += 1
    ) {
      expect(
        checkPublicRateLimit(
          request,
          policy,
        ).allowed,
      ).toBe(true);
    }

    const blocked =
      checkPublicRateLimit(
        request,
        policy,
      );

    expect(blocked).toEqual({
      allowed:
        false,

      retryAfterSeconds:
        60,
    });
  });

  it("tracks each client address separately", () => {
    for (
      let attempt = 0;
      attempt < 3;
      attempt += 1
    ) {
      checkPublicRateLimit(
        requestFrom(
          "203.0.113.2",
        ),
        policy,
      );
    }

    expect(
      checkPublicRateLimit(
        requestFrom(
          "203.0.113.3",
        ),
        policy,
      ).allowed,
    ).toBe(true);
  });

  it("opens a new window after the previous one expires", () => {
    const request =
      requestFrom(
        "203.0.113.4",
      );

    for (
      let attempt = 0;
      attempt < 4;
      attempt += 1
    ) {
      checkPublicRateLimit(
        request,
        policy,
      );
    }

    vi.advanceTimersByTime(
      60_000,
    );

    expect(
      checkPublicRateLimit(
        request,
        policy,
      ).allowed,
    ).toBe(true);
  });
});
