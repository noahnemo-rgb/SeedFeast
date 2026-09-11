import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    // Fetch recommended recipes (first 3)
    const recommended = await sql`
      SELECT 
        r.id, 
        r.title, 
        r.image, 
        r.is_favorite,
        c.name as chef_name
      FROM recipes r
      LEFT JOIN chefs c ON r.chef_id = c.id
      ORDER BY r.created_at DESC
      LIMIT 3
    `;

    // Fetch breakfast recipes (recipes from category 2 - Bread)
    const breakfast = await sql`
      SELECT 
        r.id, 
        r.title, 
        r.image, 
        r.is_favorite,
        c.name as chef_name
      FROM recipes r
      LEFT JOIN chefs c ON r.chef_id = c.id
      WHERE r.category_id = 2
      ORDER BY r.created_at DESC
      LIMIT 3
    `;

    return Response.json({
      recommended,
      breakfast,
    });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return Response.json({ error: "Failed to fetch recipes" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      image,
      category_id,
      time,
      difficulty,
      calories,
      ingredients,
      steps,
    } = body;

    if (!title || !category_id) {
      return Response.json(
        { error: "Title and category are required" },
        { status: 400 },
      );
    }

    // First, check if user has a chef profile, if not create one
    const userChef = await sql(
      `SELECT id FROM chefs WHERE username = $1 LIMIT 1`,
      [session.user.email.split("@")[0]],
    );

    let chefId;
    if (userChef.length === 0) {
      // Create chef profile for this user
      const newChef = await sql(
        `INSERT INTO chefs (name, username, bio, avatar)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [
          session.user.name || "Chef",
          session.user.email.split("@")[0],
          "Home cook sharing delicious recipes",
          session.user.image || null,
        ],
      );
      chefId = newChef[0].id;
    } else {
      chefId = userChef[0].id;
    }

    // Create the recipe
    const recipeResult = await sql(
      `INSERT INTO recipes (
        chef_id,
        title,
        description,
        image,
        category_id,
        time,
        difficulty,
        calories
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id`,
      [
        chefId,
        title,
        description || null,
        image || null,
        category_id,
        time || "30 min",
        difficulty || "Medium",
        calories || "300 cal",
      ],
    );

    const recipeId = recipeResult[0].id;

    // Add steps if provided
    if (steps && Array.isArray(steps) && steps.length > 0) {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        if (step.title && step.title.trim().length > 0) {
          await sql(
            `INSERT INTO recipe_steps (recipe_id, step_number, title, description)
             VALUES ($1, $2, $3, $4)`,
            [recipeId, i + 1, step.title, step.description || null],
          );
        }
      }
    }

    return Response.json({
      success: true,
      recipe: { id: recipeId },
    });
  } catch (error) {
    console.error("Error creating recipe:", error);
    return Response.json({ error: "Failed to create recipe" }, { status: 500 });
  }
}
