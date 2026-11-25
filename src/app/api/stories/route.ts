import {
  checkPublicRateLimit,
  rateLimitedResponse,
} from "@/server/security/public-rate-limit";

import {
  listStories,
} from "@/server/stories/list-stories";

export async function GET(
  request: Request,
) {
  const rateLimit =
    checkPublicRateLimit(
      request,
      {
        name:
          "stories-list",

        maxRequests:
          30,

        windowMs:
          60_000,
      },
    );

  if (
    !rateLimit.allowed
  ) {
    return rateLimitedResponse(
      rateLimit.retryAfterSeconds,
    );
  }

  const stories =
    await listStories();

  return Response.json({
    success: true,
    stories,
  });
}
