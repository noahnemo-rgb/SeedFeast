import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const recipes = await sql`
      SELECT 
        r.id, 
        r.title, 
        r.image, 
        r.time,
        r.difficulty,
        c.name as chef_name
      FROM recipes r
      JOIN user_favorites uf ON r.id = uf.recipe_id
      LEFT JOIN chefs c ON r.chef_id = c.id
      WHERE uf.user_id = ${userId}
      ORDER BY uf.created_at DESC
    `;

    return Response.json(recipes);
  } catch (error) {
    console.error("Error fetching favorite recipes:", error);
    return Response.json({ error: "Failed to fetch recipes" }, { status: 500 });
  }
}
