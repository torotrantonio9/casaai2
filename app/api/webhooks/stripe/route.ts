import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.clover',
})

const PLAN_MAP: Record<string, string> = {
  [process.env.STRIPE_PRICE_STARTER || 'price_starter']: 'starter',
  [process.env.STRIPE_PRICE_PRO || 'price_pro']: 'pro',
  [process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise']: 'enterprise',
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Webhook verification failed'
    console.error('[stripe/webhook]', msg)
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const agencyId = session.metadata?.agency_id
        if (agencyId && session.subscription) {
          await supabaseAdmin
            .from('agencies')
            .update({
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
            })
            .eq('id', agencyId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const priceId = subscription.items.data[0]?.price.id
        const plan = PLAN_MAP[priceId] || 'starter'

        const maxListingsMap: Record<string, number> = {
          starter: 25,
          pro: 100,
          enterprise: 999,
        }
        const maxAgentsMap: Record<string, number> = {
          starter: 3,
          pro: 10,
          enterprise: 50,
        }

        await supabaseAdmin
          .from('agencies')
          .update({
            subscription_plan: plan,
            max_listings: maxListingsMap[plan] || 25,
            max_agents: maxAgentsMap[plan] || 3,
          })
          .eq('stripe_subscription_id', subscription.id)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await supabaseAdmin
          .from('agencies')
          .update({
            subscription_plan: 'free',
            max_listings: 10,
            max_agents: 2,
          })
          .eq('stripe_subscription_id', subscription.id)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Webhook handler error'
    console.error('[stripe/webhook]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
