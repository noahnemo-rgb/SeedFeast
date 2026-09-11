import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const listings = await sql(
      `SELECT 
        sl.*,
        sc.name as category_name,
        sc.icon as category_icon,
        sc.color as category_color,
        COALESCE(AVG(sr.rating), 0) as avg_rating,
        COUNT(DISTINCT sr.id) as review_count
      FROM seed_listings sl
      LEFT JOIN seed_categories sc ON sl.category_id = sc.id
      LEFT JOIN seed_reviews sr ON sl.id = sr.listing_id
      WHERE sl.user_id = $1
      GROUP BY sl.id, sc.name, sc.icon, sc.color
      ORDER BY sl.created_at DESC`,
      [session.user.id],
    );

    return Response.json(listings);
  } catch (error) {
    console.error("Error fetching my listings:", error);
    return Response.json(
      { error: "Failed to fetch listings" },
      { status: 500 },
    );
  }
}
