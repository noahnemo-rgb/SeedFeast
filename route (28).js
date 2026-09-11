import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: recipeId } = params;
    const userId = session.user.id;

    // Check if already favorited
    const existing = await sql`
      SELECT id FROM user_favorites 
      WHERE user_id = ${userId} AND recipe_id = ${recipeId}
    `;

    if (existing.length > 0) {
      // Remove favorite
      await sql`
        DELETE FROM user_favorites 
        WHERE user_id = ${userId} AND recipe_id = ${recipeId}
      `;
      return Response.json({ favorited: false });
    } else {
      // Add favorite
      await sql`
        INSERT INTO user_favorites (user_id, recipe_id)
        VALUES (${userId}, ${recipeId})
      `;
      return Response.json({ favorited: true });
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return Response.json(
      { error: "Failed to toggle favorite" },
      { status: 500 },
    );
  }
}
