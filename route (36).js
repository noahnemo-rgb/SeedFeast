import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get("listing_id");

    if (listingId) {
      // Get messages for a specific listing conversation
      const messages = await sql(
        `SELECT 
          sm.*,
          sender.name as sender_name,
          sender.image as sender_image,
          receiver.name as receiver_name,
          receiver.image as receiver_image
        FROM seed_messages sm
        LEFT JOIN auth_users sender ON sm.sender_id = sender.id
        LEFT JOIN auth_users receiver ON sm.receiver_id = receiver.id
        WHERE sm.listing_id = $1 
          AND (sm.sender_id = $2 OR sm.receiver_id = $2)
        ORDER BY sm.created_at ASC`,
        [listingId, session.user.id],
      );

      return Response.json(messages);
    } else {
      // Get all conversations
      const conversations = await sql(
        `SELECT DISTINCT ON (sm.listing_id, 
          CASE 
            WHEN sm.sender_id = $1 THEN sm.receiver_id 
            ELSE sm.sender_id 
          END)
          sm.*,
          sl.title as listing_title,
          sl.image as listing_image,
          sender.name as sender_name,
          sender.image as sender_image,
          receiver.name as receiver_name,
          receiver.image as receiver_image
        FROM seed_messages sm
        LEFT JOIN seed_listings sl ON sm.listing_id = sl.id
        LEFT JOIN auth_users sender ON sm.sender_id = sender.id
        LEFT JOIN auth_users receiver ON sm.receiver_id = receiver.id
        WHERE sm.sender_id = $1 OR sm.receiver_id = $1
        ORDER BY sm.listing_id, 
          CASE WHEN sm.sender_id = $1 THEN sm.receiver_id ELSE sm.sender_id END,
          sm.created_at DESC`,
        [session.user.id],
      );

      return Response.json(conversations);
    }
  } catch (error) {
    console.error("Error fetching messages:", error);
    return Response.json(
      { error: "Failed to fetch messages" },
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
    const { listing_id, receiver_id, message } = body;

    if (!listing_id || !receiver_id || !message) {
      return Response.json(
        { error: "Listing ID, receiver ID, and message are required" },
        { status: 400 },
      );
    }

    const result = await sql(
      `INSERT INTO seed_messages (listing_id, sender_id, receiver_id, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [listing_id, session.user.id, receiver_id, message],
    );

    return Response.json({ success: true, message: { id: result[0].id } });
  } catch (error) {
    console.error("Error sending message:", error);
    return Response.json({ error: "Failed to send message" }, { status: 500 });
  }
}
