import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request, { params }) {
  const { id: recipeId } = params;
  const session = await auth();
  const userId = session?.user?.id;

  try {
    const comments = await sql`
      SELECT 
        c.id,
        c.content,
        c.created_at,
        c.parent_id,
        c.user_id,
        u.name as user_name,
        u.image as user_image,
        (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id) as likes_count,
        EXISTS(SELECT 1 FROM comment_likes WHERE comment_id = c.id AND user_id = ${userId || null}) as is_liked,
        r.chef_id as recipe_chef_id
      FROM recipe_comments c
      JOIN auth_users u ON c.user_id = u.id
      JOIN recipes r ON c.recipe_id = r.id
      WHERE c.recipe_id = ${recipeId}
      ORDER BY c.created_at ASC
    `;

    // Organize into threads
    const commentMap = {};
    const rootComments = [];

    comments.forEach((comment) => {
      comment.replies = [];
      commentMap[comment.id] = comment;
      if (!comment.parent_id) {
        rootComments.push(comment);
      } else if (commentMap[comment.parent_id]) {
        commentMap[comment.parent_id].replies.push(comment);
      }
    });

    return Response.json(rootComments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return Response.json(
      { error: "Failed to fetch comments" },
      { status: 500 },
    );
  }
}

export async function POST(request, { params }) {
  const { id: recipeId } = params;
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, parent_id } = await request.json();
    if (!content || content.trim() === "") {
      return Response.json(
        { error: "Comment content is required" },
        { status: 400 },
      );
    }

    const [newComment] = await sql`
      INSERT INTO recipe_comments (recipe_id, user_id, content, parent_id)
      VALUES (${recipeId}, ${session.user.id}, ${content}, ${parent_id || null})
      RETURNING id, content, created_at, parent_id
    `;

    return Response.json(newComment);
  } catch (error) {
    console.error("Error posting comment:", error);
    return Response.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
