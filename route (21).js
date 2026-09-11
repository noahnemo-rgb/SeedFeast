import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const categories = await sql`
      SELECT id, name, icon, color
      FROM categories
      ORDER BY id
    `;

    return Response.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return Response.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}
