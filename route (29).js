import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const session = await auth();
    const userId = session?.user?.id;

    const recipeResult = await sql`
      SELECT 
        r.*,
        c.id as chef_id,
        c.name as chef_name,
        c.avatar as chef_avatar,
        c.role as chef_role
      FROM recipes r
      LEFT JOIN chefs c ON r.chef_id = c.id
      WHERE r.id = ${id}
    `;

    if (recipeResult.length === 0) {
      return Response.json({ error: "Recipe not found" }, { status: 404 });
    }

    const recipe = recipeResult[0];

    // Check if favorited by current user
    let isFavorited = false;
    if (userId) {
      const favoriteResult = await sql`
        SELECT id FROM user_favorites 
        WHERE user_id = ${userId} AND recipe_id = ${id}
      `;
      isFavorited = favoriteResult.length > 0;
    }

    // Fetch recipe steps
    const steps = await sql`
      SELECT *
      FROM recipe_steps
      WHERE recipe_id = ${id}
      ORDER BY step_number
    `;

    return Response.json({
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      image: recipe.image,
      time: recipe.time,
      difficulty: recipe.difficulty,
      calories: recipe.calories,
      is_favorited: isFavorited,
      chef: {
        id: recipe.chef_id,
        name: recipe.chef_name,
        avatar: recipe.chef_avatar,
        role: recipe.chef_role,
      },
      steps,
    });
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return Response.json({ error: "Failed to fetch recipe" }, { status: 500 });
  }
}
