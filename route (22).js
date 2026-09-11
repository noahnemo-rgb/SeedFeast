import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const chefs = await sql`
      SELECT * FROM chefs 
      WHERE is_featured = true 
      LIMIT 1
    `;

    if (chefs.length === 0) {
      // Fallback to any chef if none is featured
      const fallback = await sql`SELECT * FROM chefs LIMIT 1`;
      return Response.json(fallback[0] || null);
    }

    return Response.json(chefs[0]);
  } catch (error) {
    console.error("Error fetching featured chef:", error);
    return Response.json(
      { error: "Failed to fetch featured chef" },
      { status: 500 },
    );
  }
}
