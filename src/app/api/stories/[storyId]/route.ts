import {
  checkPublicRateLimit,
  rateLimitedResponse,
} from "@/server/security/public-rate-limit";

import {
  getStoryById,
} from "@/server/stories/get-story-by-id";

type RouteContext = {
  params: Promise<{
    storyId: string;
  }>;
};

export async function GET(
  request: Request,
  context: RouteContext,
) {
  const rateLimit =
    checkPublicRateLimit(
      request,
      {
        name:
          "story-detail",

        maxRequests:
          120,

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

  const {
    storyId,
  } = await context.params;

  const story =
    await getStoryById(
      storyId,
    );

  if (!story) {
    return Response.json(
      {
        success: false,
        error:
          "Notícia não encontrada.",
      },
      {
        status: 404,
      },
    );
  }

  return Response.json({
    success: true,
    story,
  });
}