import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const chefResult = await sql`
      SELECT *
      FROM chefs
      WHERE id = ${id}
    `;

    if (chefResult.length === 0) {
      return Response.json({ error: "Chef not found" }, { status: 404 });
    }

    const chef = chefResult[0];

    // Fetch chef's recipes
    const recipes = await sql`
      SELECT 
        r.id,
        r.title,
        r.image,
        r.is_favorite,
        c.name as chef_name
      FROM recipes r
      LEFT JOIN chefs c ON r.chef_id = c.id
      WHERE r.chef_id = ${id}
      ORDER BY r.created_at DESC
    `;

    return Response.json({
      id: chef.id,
      name: chef.name,
      username: chef.username,
      bio: chef.bio,
      avatar: chef.avatar,
      stats: {
        followers: chef.followers,
        following: chef.following,
        likes: chef.likes,
      },
      recipes,
    });
  } catch (error) {
    console.error("Error fetching chef:", error);
    return Response.json({ error: "Failed to fetch chef" }, { status: 500 });
  }
}
