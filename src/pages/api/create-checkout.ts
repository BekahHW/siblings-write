import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * POST /api/create-checkout
 * Create a Stripe checkout session
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { priceId, userId, upgradeType } = body;

    if (!priceId || !userId || !upgradeType) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Price ID, User ID, and upgrade type are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize Stripe
    const stripeSecretKey = import.meta.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error('Stripe secret key not configured');
      return new Response(JSON.stringify({
        success: false,
        error: 'Payment system not configured'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    const siteUrl = import.meta.env.PUBLIC_SITE_URL || process.env.PUBLIC_SITE_URL || 'http://localhost:4321';

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/one-word-story?upgrade=success`,
      cancel_url: `${siteUrl}/one-word-story?upgrade=cancelled`,
      metadata: {
        userId,
        upgradeType,
      },
    });

    return new Response(JSON.stringify({
      success: true,
      url: session.url
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to create checkout session'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
