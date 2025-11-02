import { serve } from 'https://deno.land/std@0.170.0/http/server.ts'
import Stripe from 'npm:stripe'

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-08-16" })

// Replace these with your actual Stripe price IDs
const planToPriceId = {
  basic: "price_basic_id",
  pro: "price_pro_id",
  enterprise: "price_enterprise_id",
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 })
  }

  try {
    const { plan, successUrl, cancelUrl } = await req.json()
    const priceId = planToPriceId[plan]
    if (!priceId || !successUrl || !cancelUrl) {
      return new Response("Missing required fields", { status: 400 })
    }
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    })
    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  } catch (err) {
    return new Response(`Error: ${err.message}`, { status: 500 })
  }
})