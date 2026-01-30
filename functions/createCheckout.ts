import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

const PRICE_IDS = {
  monthly: 'price_1SvJ50D6sfAQHSctybQMQgG9',
  yearly: 'price_1SvJ50D6sfAQHSctb85QND6z'
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { plan } = await req.json();
    
    if (!plan || !PRICE_IDS[plan]) {
      return Response.json({ error: 'Plan invalide' }, { status: 400 });
    }

    // Créer ou récupérer le client Stripe
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    let customer;
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: {
          base44_user_id: user.id
        }
      });
    }

    // Créer la session de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICE_IDS[plan],
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get('origin')}/?subscription=success`,
      cancel_url: `${req.headers.get('origin')}/Pricing?cancelled=true`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        user_email: user.email,
        plan: plan
      }
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Erreur création checkout:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});