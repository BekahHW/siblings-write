import type { APIRoute } from 'astro';
import { supabase } from '../../utils/supabase';

export const prerender = false;

/**
 * POST /api/stripe-webhook
 * Handle Stripe webhook events
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const stripeSecretKey = import.meta.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
    const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecretKey || !webhookSecret) {
      console.error('Stripe not configured');
      return new Response('Webhook Error: Configuration missing', { status: 400 });
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return new Response('Webhook Error: No signature', { status: 400 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const { userId, upgradeType } = session.metadata;

        if (!userId || !upgradeType) {
          console.error('Missing metadata in webhook');
          break;
        }

        // Record the purchase
        const { error } = await supabase
          .from('user_upgrades')
          .insert({
            user_id: userId,
            upgrade_type: upgradeType,
            stripe_session_id: session.id,
            amount_paid: session.amount_total,
          });

        if (error) {
          console.error('Error recording purchase:', error);
        }

        // Create notification
        let notificationMessage = '';
        switch (upgradeType) {
          case 'multi_word':
            notificationMessage = 'You can now submit multiple words in one turn!';
            break;
          case 'story_extension':
            notificationMessage = 'Story extended by 100 words!';
            break;
          case 'word_edit':
            notificationMessage = 'You can now edit your submitted words!';
            break;
          case 'membership':
            notificationMessage = 'Welcome to premium membership!';
            break;
        }

        if (notificationMessage) {
          await supabase
            .from('notifications')
            .insert({
              user_id: userId,
              type: 'upgrade_purchased',
              title: 'Upgrade Purchased!',
              message: notificationMessage,
            });
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(`Webhook Error: ${error.message}`, {
      status: 400
    });
  }
};
