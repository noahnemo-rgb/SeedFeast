import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const saved = await sql(
      `SELECT 
        sl.*,
        u.name as user_name,
        u.image as user_image,
        sc.name as category_name,
        sc.icon as category_icon,
        sc.color as category_color
      FROM user_saved_seeds uss
      LEFT JOIN seed_listings sl ON uss.listing_id = sl.id
      LEFT JOIN auth_users u ON sl.user_id = u.id
      LEFT JOIN seed_categories sc ON sl.category_id = sc.id
      WHERE uss.user_id = $1
      ORDER BY uss.created_at DESC`,
      [session.user.id],
    );

    return Response.json(saved);
  } catch (error) {
    console.error("Error fetching saved seeds:", error);
    return Response.json(
      { error: "Failed to fetch saved seeds" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { listing_id } = body;

    if (!listing_id) {
      return Response.json(
        { error: "Listing ID is required" },
        { status: 400 },
      );
    }

    await sql(
      `INSERT INTO user_saved_seeds (user_id, listing_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, listing_id) DO NOTHING`,
      [session.user.id, listing_id],
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error saving seed:", error);
    return Response.json({ error: "Failed to save seed" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get("listing_id");

    if (!listingId) {
      return Response.json(
        { error: "Listing ID is required" },
        { status: 400 },
      );
    }

    await sql(
      `DELETE FROM user_saved_seeds 
       WHERE user_id = $1 AND listing_id = $2`,
      [session.user.id, listingId],
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error unsaving seed:", error);
    return Response.json({ error: "Failed to unsave seed" }, { status: 500 });
  }
}
