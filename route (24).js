import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request, { params }) {
  const { id: commentId } = params;
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Check if already liked
    const [existingLike] = await sql`
      SELECT id FROM comment_likes 
      WHERE comment_id = ${commentId} AND user_id = ${userId}
    `;

    if (existingLike) {
      // Unlike
      await sql`
        DELETE FROM comment_likes 
        WHERE comment_id = ${commentId} AND user_id = ${userId}
      `;
      return Response.json({ liked: false });
    } else {
      // Like
      await sql`
        INSERT INTO comment_likes (comment_id, user_id)
        VALUES (${commentId}, ${userId})
      `;
      return Response.json({ liked: true });
    }
  } catch (error) {
    console.error("Error toggling comment like:", error);
    return Response.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
