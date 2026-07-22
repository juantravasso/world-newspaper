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