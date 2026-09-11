import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { listing_id, reviewed_user_id, rating, comment } = body;

    if (!listing_id || !reviewed_user_id || !rating) {
      return Response.json(
        { error: "Listing ID, reviewed user ID, and rating are required" },
        { status: 400 },
      );
    }

    if (rating < 1 || rating > 5) {
      return Response.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 },
      );
    }

    const result = await sql(
      `INSERT INTO seed_reviews (listing_id, reviewer_id, reviewed_user_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [listing_id, session.user.id, reviewed_user_id, rating, comment || null],
    );

    return Response.json({ success: true, review: { id: result[0].id } });
  } catch (error) {
    console.error("Error creating review:", error);
    return Response.json({ error: "Failed to create review" }, { status: 500 });
  }
}
