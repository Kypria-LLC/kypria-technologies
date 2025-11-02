import { serve } from 'https://deno.land/std@0.170.0/http/server.ts'
import Stripe from 'npm:stripe'

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-08-16" })
const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!

serve(async (req) => {
  const sig = req.headers.get("stripe-signature")
  const body = await req.text()

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret)
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed':
      // TODO: Grant access, update DB, send email, etc.
      break
    case 'customer.subscription.deleted':
      // TODO: Revoke access, update DB, send email, etc.
      break
    // Add more event types!
  }

  return new Response('Webhook processed', { status: 200 })
})