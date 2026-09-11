import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const type = searchParams.get("type"); // offer or request
    const exchange = searchParams.get("exchange"); // free, trade, sell
    const search = searchParams.get("search");
    const latitude = searchParams.get("lat");
    const longitude = searchParams.get("lng");
    const maxDistance = searchParams.get("maxDistance") || 50; // miles

    let queryText = `
      SELECT 
        sl.*,
        u.name as user_name,
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
      WHERE sl.status = 'available'
    `;
    const params = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      queryText += ` AND sl.category_id = $${paramCount}`;
      params.push(parseInt(category));
    }

    if (type) {
      paramCount++;
      queryText += ` AND sl.listing_type = $${paramCount}`;
      params.push(type);
    }

    if (exchange) {
      paramCount++;
      queryText += ` AND sl.exchange_type = $${paramCount}`;
      params.push(exchange);
    }

    if (search) {
      paramCount++;
      queryText += ` AND (LOWER(sl.title) LIKE LOWER($${paramCount}) OR LOWER(sl.description) LIKE LOWER($${paramCount}))`;
      params.push(`%${search}%`);
    }

    queryText += ` GROUP BY sl.id, u.name, u.image, sc.name, sc.icon, sc.color`;

    // Add distance sorting if location provided
    if (latitude && longitude) {
      queryText += `, sl.latitude, sl.longitude`;
      queryText += ` ORDER BY 
        CASE 
          WHEN sl.latitude IS NOT NULL AND sl.longitude IS NOT NULL 
          THEN (3959 * acos(cos(radians($${paramCount + 1})) * cos(radians(sl.latitude)) * cos(radians(sl.longitude) - radians($${paramCount + 2})) + sin(radians($${paramCount + 1})) * sin(radians(sl.latitude))))
          ELSE 99999 
        END,
        sl.created_at DESC
      `;
      params.push(parseFloat(latitude), parseFloat(longitude));
    } else {
      queryText += ` ORDER BY sl.created_at DESC`;
    }

    queryText += ` LIMIT 50`;

    const listings = await sql(queryText, params);
    return Response.json(listings);
  } catch (error) {
    console.error("Error fetching seed listings:", error);
    return Response.json(
      { error: "Failed to fetch listings" },
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
    const {
      title,
      description,
      image,
      category_id,
      quantity,
      listing_type,
      exchange_type,
      price,
      location_city,
      location_state,
      location_country,
      latitude,
      longitude,
      growing_season,
      days_to_harvest,
      difficulty,
      organic,
      heirloom,
    } = body;

    if (!title || !listing_type || !exchange_type) {
      return Response.json(
        { error: "Title, listing type, and exchange type are required" },
        { status: 400 },
      );
    }

    const result = await sql(
      `INSERT INTO seed_listings (
        user_id, title, description, image, category_id, quantity,
        listing_type, exchange_type, price, location_city, location_state,
        location_country, latitude, longitude, growing_season, days_to_harvest,
        difficulty, organic, heirloom
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING id`,
      [
        session.user.id,
        title,
        description || null,
        image || null,
        category_id || null,
        quantity || null,
        listing_type,
        exchange_type,
        price || null,
        location_city || null,
        location_state || null,
        location_country || "USA",
        latitude || null,
        longitude || null,
        growing_season || null,
        days_to_harvest || null,
        difficulty || "Medium",
        organic || false,
        heirloom || false,
      ],
    );

    return Response.json({ success: true, listing: { id: result[0].id } });
  } catch (error) {
    console.error("Error creating seed listing:", error);
    return Response.json(
      { error: "Failed to create listing" },
      { status: 500 },
    );
  }
}
