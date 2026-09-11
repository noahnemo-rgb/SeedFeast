import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import Stripe from "stripe";

export const POST = async (request) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await auth();

  async function handler() {
    if (!session?.user?.email) {
      return {
        status: "unauthenticated",
        message: "User not logged in",
      };
    }

    const results = await sql`
      SELECT subscription_status, stripe_id, last_check_subscription_status_at
      FROM auth_users 
      WHERE email = ${session.user.email}
    `;

    if (!results.length) {
      return {
        status: "not_found",
        message: "User not found",
      };
    }

    const {
      subscription_status,
      stripe_id,
      last_check_subscription_status_at,
    } = results[0];

    // If we have a stripe ID but no status, or status is stale (>30 days), check with Stripe
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const isStatusStale =
      last_check_subscription_status_at &&
      new Date(last_check_subscription_status_at) < thirtyDaysAgo;

    if (stripe_id && (!subscription_status || isStatusStale)) {
      try {
        const customer = await stripe.customers.retrieve(stripe_id, {
          expand: ["subscriptions"],
        });

        if (customer?.subscriptions?.data[0]?.status) {
          // Update our database with latest status from Stripe
          await sql`
            UPDATE auth_users 
            SET subscription_status = ${customer.subscriptions.data[0].status}, 
                last_check_subscription_status_at = NOW()
            WHERE email = ${session.user.email}
          `;
          return {
            status: customer.subscriptions.data[0].status,
            stripeId: stripe_id,
          };
        }
      } catch (error) {
        console.error("Error fetching from Stripe:", error);
      }
    }

    return {
      status: subscription_status || "none",
      stripeId: stripe_id,
    };
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
