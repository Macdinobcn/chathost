// app/api/stripe/webhook/route.ts
// Procesa eventos de Stripe: pagos completados, suscripciones activadas/canceladas

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-03-25.dahlia' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const PLAN_CREDITS: Record<string, number> = {
  starter: 500, pro: 3000, business: 10000, agency: 30000,
}
const PACK_CREDITS: Record<string, number> = {
  pack_s: 625, pack_m: 2000, pack_l: 5000, pack_xl: 10000,
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('[webhook] Firma inválida:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const clientId = (event.data.object as any).metadata?.client_id
  const type = (event.data.object as any).metadata?.type

  switch (event.type) {

    // ── Suscripción activada / renovada ──────────────────────────────────
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const clientMeta = sub.metadata?.client_id || clientId
      if (!clientMeta) break

      const planCredits = PLAN_CREDITS[type] || 500
      await supabase.from('clients').update({
        stripe_subscription_id: sub.id,
        subscription_status: sub.status === 'active' ? 'active' : sub.status,
        credits_balance: planCredits,
        plan: type || 'starter',
      }).eq('id', clientMeta)

      console.log(`[webhook] Suscripción ${sub.status} para cliente ${clientMeta}, plan: ${type}, créditos: ${planCredits}`)
      break
    }

    // ── Suscripción cancelada ────────────────────────────────────────────
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const clientMeta = sub.metadata?.client_id || clientId
      if (!clientMeta) break

      await supabase.from('clients').update({
        subscription_status: 'cancelled',
        credits_balance: 0,
      }).eq('id', clientMeta)

      console.log(`[webhook] Suscripción cancelada para cliente ${clientMeta}`)
      break
    }

    // ── Pago único completado (recargas) ─────────────────────────────────
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== 'payment') break // las suscripciones se manejan arriba

      const clientMeta = session.metadata?.client_id
      const packType = session.metadata?.type
      if (!clientMeta || !packType) break

      const creditsToAdd = PACK_CREDITS[packType] || 0
      if (creditsToAdd > 0) {
        // Sumar créditos al saldo actual
        const { data: client } = await supabase
          .from('clients').select('credits_balance').eq('id', clientMeta).single()
        const current = (client as any)?.credits_balance || 0
        await supabase.from('clients').update({
          credits_balance: current + creditsToAdd,
        }).eq('id', clientMeta)

        console.log(`[webhook] Recarga ${packType}: +${creditsToAdd} créditos para cliente ${clientMeta}`)
      }
      break
    }

    // ── Pago de factura fallido ──────────────────────────────────────────
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      await supabase.from('clients').update({
        subscription_status: 'past_due',
      }).eq('stripe_customer_id', customerId)
      console.log(`[webhook] Pago fallido para customer ${customerId}`)
      break
    }
  }

  return NextResponse.json({ received: true })
}
