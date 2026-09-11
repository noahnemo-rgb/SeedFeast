import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const categories = await sql`
      SELECT * FROM seed_categories 
      ORDER BY name
    `;
    return Response.json(categories);
  } catch (error) {
    console.error("Error fetching seed categories:", error);
    return Response.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}
