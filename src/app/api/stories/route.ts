import {
  listStories,
} from "@/server/stories/list-stories";

export async function GET() {
  const stories =
    await listStories();

  return Response.json({
    success: true,
    stories,
  });
}