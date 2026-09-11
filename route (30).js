import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the chef profile for this user
    const chef = await sql`
      SELECT id FROM chefs WHERE username = ${session.user.email.split("@")[0]} LIMIT 1
    `;

    if (chef.length === 0) {
      return Response.json([]);
    }

    const recipes = await sql`
      SELECT 
        r.id, 
        r.title, 
        r.image, 
        r.time,
        r.difficulty,
        c.name as chef_name
      FROM recipes r
      LEFT JOIN chefs c ON r.chef_id = c.id
      WHERE r.chef_id = ${chef[0].id}
      ORDER BY r.created_at DESC
    `;

    return Response.json(recipes);
  } catch (error) {
    console.error("Error fetching my recipes:", error);
    return Response.json({ error: "Failed to fetch recipes" }, { status: 500 });
  }
}
