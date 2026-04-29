import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { getPlanFromPriceId } from '@/lib/stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature verification failed:', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === 'subscription') {
          const customerId = session.customer as string
          const subscriptionId = session.subscription as string

          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const priceId = subscription.items.data[0].price.id
          const plan = getPlanFromPriceId(priceId)

          await supabase
            .from('profiles')
            .update({
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              plan: plan,
              monthly_count: 0,
            })
            .eq('stripe_customer_id', customerId)

          console.log(`Plan updated to ${plan} for customer ${customerId}`)

        } else if (session.mode === 'payment') {
          const userId = session.metadata?.userId
          const credits = parseInt(session.metadata?.credits ?? '0', 10)

          if (userId && credits > 0) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('extra_credits')
              .eq('id', userId)
              .single()

            const currentCredits = profile?.extra_credits ?? 0
            await supabase
              .from('profiles')
              .update({ extra_credits: currentCredits + credits })
              .eq('id', userId)

            console.log(`Added ${credits} extra_credits to user ${userId}`)
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const priceId = subscription.items.data[0].price.id
        const plan = getPlanFromPriceId(priceId)

        await supabase
          .from('profiles')
          .update({ plan })
          .eq('stripe_customer_id', customerId)

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await supabase
          .from('profiles')
          .update({ plan: 'none', stripe_subscription_id: null })
          .eq('stripe_customer_id', customerId)

        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
