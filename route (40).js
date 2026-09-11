import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import Stripe from "stripe";

export const POST = async (request) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await auth();

  async function handler({ redirectURL, product }) {
    const email = session?.user?.email;
    const userId = session?.user?.id;

    if (!email || !userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get current user's stripe_id
    const [user] = await sql`
      SELECT stripe_id FROM auth_users 
      WHERE id = ${userId}
    `;

    let stripeCustomerId = user?.stripe_id;

    if (!stripeCustomerId) {
      // Create new customer in Stripe
      const customer = await stripe.customers.create({ email });
      stripeCustomerId = customer.id;

      // Update user with stripe_id
      await sql`
        UPDATE auth_users 
        SET stripe_id = ${stripeCustomerId}
        WHERE id = ${userId}
      `;
    }

    // Get price data based on product (default to basic if not specified)
    const getPriceData = (productType) => {
      switch (productType) {
        case "premium":
          return {
            currency: "usd",
            product_data: { name: "Premium Gardener Plan" },
            recurring: { interval: "month" },
            unit_amount: 999, // $9.99/month
          };
        case "pro":
          return {
            currency: "usd",
            product_data: { name: "Pro Gardener Plan" },
            recurring: { interval: "month" },
            unit_amount: 1999, // $19.99/month
          };
        default:
          return {
            currency: "usd",
            product_data: { name: "Premium Gardener Plan" },
            recurring: { interval: "month" },
            unit_amount: 999, // $9.99/month
          };
      }
    };

    const priceData = getPriceData(product);

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: priceData,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${redirectURL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: redirectURL,
    });

    return { url: checkoutSession.url };
  }

  let data = {};
  try {
    data = await request.json();
  } catch {
    // no-op
  }

  const result = await handler(data, request);
  if (result instanceof Response) {
    return result;
  }
  return Response.json(result === undefined ? {} : result);
};
