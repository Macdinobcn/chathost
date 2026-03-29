// app/api/stripe/checkout/route.ts
// Crea sesión de pago en Stripe para suscripciones, recargas y bots extra

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-03-25.dahlia' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// IDs de precios en Stripe — se crean la primera vez y se reutilizan
// Después de crear los productos en Stripe, pon aquí los Price IDs
const PRICE_IDS: Record<string, string> = {
  // Suscripciones mensuales
  'starter':  process.env.STRIPE_PRICE_STARTER  || '',
  'pro':      process.env.STRIPE_PRICE_PRO      || '',
  'business': process.env.STRIPE_PRICE_BUSINESS || '',
  'agency':   process.env.STRIPE_PRICE_AGENCY   || '',
  // Recargas puntuales (one-time)
  'pack_s':   process.env.STRIPE_PRICE_PACK_S   || '',
  'pack_m':   process.env.STRIPE_PRICE_PACK_M   || '',
  'pack_l':   process.env.STRIPE_PRICE_PACK_L   || '',
  'pack_xl':  process.env.STRIPE_PRICE_PACK_XL  || '',
  // Bot adicional (suscripción recurrente)
  'bot_extra': process.env.STRIPE_PRICE_BOT_EXTRA || '',
}

const CREDITS: Record<string, number> = {
  starter: 500, pro: 3000, business: 10000, agency: 30000,
  pack_s: 625, pack_m: 2000, pack_l: 5000, pack_xl: 10000,
}

export async function POST(req: NextRequest) {
  try {
    const { type, clientId, quantity } = await req.json()
    // type: 'starter'|'pro'|'business'|'agency'|'pack_s'|...|'bot_extra'
    // quantity: para bot_extra, número de bots adicionales

    const { data: client } = await supabase
      .from('clients').select('*').eq('id', clientId).single()

    if (!client) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const isSubscription = ['starter', 'pro', 'business', 'agency', 'bot_extra'].includes(type)

    // Crear o recuperar customer de Stripe
    let stripeCustomerId = client.stripe_customer_id
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: client.email || '',
        name: client.name,
        metadata: { client_id: clientId },
      })
      stripeCustomerId = customer.id
      await supabase.from('clients').update({ stripe_customer_id: stripeCustomerId }).eq('id', clientId)
    }

    const priceId = PRICE_IDS[type]
    if (!priceId) return NextResponse.json({ error: `Price ID no configurado para: ${type}` }, { status: 400 })

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: stripeCustomerId,
      success_url: `${appUrl}/admin/clients/${clientId}?payment=success&type=${type}`,
      cancel_url: `${appUrl}/admin/clients/${clientId}?payment=cancelled`,
      metadata: { client_id: clientId, type, quantity: quantity?.toString() || '1' },
    }

    if (isSubscription) {
      sessionConfig.mode = 'subscription'
      sessionConfig.line_items = [{
        price: priceId,
        quantity: quantity || 1,
      }]
    } else {
      // Recarga puntual
      sessionConfig.mode = 'payment'
      sessionConfig.line_items = [{ price: priceId, quantity: 1 }]
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)
    return NextResponse.json({ url: session.url })

  } catch (error: any) {
    console.error('[stripe/checkout] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
