import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const categoryId = searchParams.get("category");

    let sqlQuery = `
      SELECT 
        r.id,
        r.title,
        r.description,
        r.image,
        r.time,
        r.difficulty,
        r.calories,
        r.is_favorite,
        c.name as chef_name,
        cat.name as category_name
      FROM recipes r
      LEFT JOIN chefs c ON r.chef_id = c.id
      LEFT JOIN categories cat ON r.category_id = cat.id
      WHERE 1=1
    `;

    const values = [];
    let paramIndex = 1;

    if (query && query.trim().length > 0) {
      sqlQuery += ` AND (
        LOWER(r.title) LIKE LOWER($${paramIndex})
        OR LOWER(r.description) LIKE LOWER($${paramIndex})
      )`;
      values.push(`%${query}%`);
      paramIndex++;
    }

    if (categoryId) {
      sqlQuery += ` AND r.category_id = $${paramIndex}`;
      values.push(parseInt(categoryId));
      paramIndex++;
    }

    sqlQuery += ` ORDER BY r.created_at DESC LIMIT 50`;

    const recipes = await sql(sqlQuery, values);

    return Response.json({ recipes });
  } catch (error) {
    console.error("Error searching recipes:", error);
    return Response.json(
      { error: "Failed to search recipes" },
      { status: 500 },
    );
  }
}
