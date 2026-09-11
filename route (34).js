import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const listings = await sql(
      `SELECT 
        sl.*,
        u.name as user_name,
        u.email as user_email,
        u.image as user_image,
        sc.name as category_name,
        sc.icon as category_icon,
        sc.color as category_color,
        COALESCE(AVG(sr.rating), 0) as avg_rating,
        COUNT(DISTINCT sr.id) as review_count
      FROM seed_listings sl
      LEFT JOIN auth_users u ON sl.user_id = u.id
      LEFT JOIN seed_categories sc ON sl.category_id = sc.id
      LEFT JOIN seed_reviews sr ON sl.id = sr.listing_id
      WHERE sl.id = $1
      GROUP BY sl.id, u.name, u.email, u.image, sc.name, sc.icon, sc.color`,
      [id],
    );

    if (listings.length === 0) {
      return Response.json({ error: "Listing not found" }, { status: 404 });
    }

    // Get reviews
    const reviews = await sql(
      `SELECT 
        sr.*,
        u.name as reviewer_name,
        u.image as reviewer_image
      FROM seed_reviews sr
      LEFT JOIN auth_users u ON sr.reviewer_id = u.id
      WHERE sr.listing_id = $1
      ORDER BY sr.created_at DESC`,
      [id],
    );

    return Response.json({
      listing: listings[0],
      reviews,
    });
  } catch (error) {
    console.error("Error fetching seed listing:", error);
    return Response.json({ error: "Failed to fetch listing" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // Verify ownership
    const listing = await sql(
      `SELECT user_id FROM seed_listings WHERE id = $1`,
      [id],
    );

    if (listing.length === 0) {
      return Response.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing[0].user_id !== session.user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const updates = [];
    const values = [];
    let paramCount = 0;

    const allowedFields = [
      "title",
      "description",
      "image",
      "category_id",
      "quantity",
      "exchange_type",
      "price",
      "location_city",
      "location_state",
      "latitude",
      "longitude",
      "growing_season",
      "days_to_harvest",
      "difficulty",
      "organic",
      "heirloom",
      "status",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        paramCount++;
        updates.push(`${field} = $${paramCount}`);
        values.push(body[field]);
      }
    }

    if (updates.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(id);
    const queryText = `UPDATE seed_listings SET ${updates.join(", ")} WHERE id = $${paramCount + 1}`;

    await sql(queryText, values);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating seed listing:", error);
    return Response.json(
      { error: "Failed to update listing" },
      { status: 500 },
    );
  }
}
