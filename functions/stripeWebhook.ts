import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!signature || !webhookSecret) {
      console.error('Signature ou secret manquant');
      return Response.json({ error: 'Configuration webhook invalide' }, { status: 400 });
    }

    const body = await req.text();
    
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Erreur vérification signature webhook:', err.message);
      return Response.json({ error: 'Signature invalide' }, { status: 400 });
    }

    console.log('Webhook reçu:', event.type);

    // Gérer les différents événements
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userEmail = session.metadata.user_email;
      const plan = session.metadata.plan;

      if (userEmail && plan) {
        // Vérifier si un abonnement existe déjà
        const existing = await base44.asServiceRole.entities.Subscription.filter({
          user_email: userEmail,
          status: "active"
        });

        if (existing.length > 0) {
          // Mettre à jour l'abonnement existant
          await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
            plan: `premium_${plan}`,
            stripe_subscription_id: session.subscription,
            stripe_customer_id: session.customer,
            start_date: new Date().toISOString()
          });
        } else {
          // Créer un nouvel abonnement
          await base44.asServiceRole.entities.Subscription.create({
            user_email: userEmail,
            plan: `premium_${plan}`,
            status: "active",
            stripe_subscription_id: session.subscription,
            stripe_customer_id: session.customer,
            start_date: new Date().toISOString()
          });
        }
        
        console.log(`Abonnement créé pour ${userEmail} - Plan: premium_${plan}`);
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      
      // Marquer l'abonnement comme annulé
      const subs = await base44.asServiceRole.entities.Subscription.filter({
        stripe_subscription_id: subscription.id
      });

      if (subs.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(subs[0].id, {
          status: "cancelled",
          end_date: new Date().toISOString()
        });
        console.log(`Abonnement annulé: ${subscription.id}`);
      }
    }

    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      
      const subs = await base44.asServiceRole.entities.Subscription.filter({
        stripe_subscription_id: subscription.id
      });

      if (subs.length > 0) {
        const status = subscription.status === 'active' ? 'active' : 
                      subscription.status === 'canceled' ? 'cancelled' : 
                      'expired';
        
        await base44.asServiceRole.entities.Subscription.update(subs[0].id, {
          status: status
        });
        console.log(`Abonnement mis à jour: ${subscription.id} - Status: ${status}`);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Erreur webhook:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});