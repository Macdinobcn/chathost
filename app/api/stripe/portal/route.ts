// app/api/stripe/portal/route.ts
// Abre el portal de facturación de Stripe para que el cliente gestione su suscripción

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-03-25.dahlia' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { clientId } = await req.json()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const { data: client } = await supabase
      .from('clients').select('stripe_customer_id').eq('id', clientId).single()

    if (!client?.stripe_customer_id) {
      return NextResponse.json({ error: 'Cliente sin cuenta de Stripe' }, { status: 400 })
    }

    const session = await getStripe().billingPortal.sessions.create({
      customer: client.stripe_customer_id,
      return_url: `${appUrl}/admin/clients/${clientId}`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('[stripe/portal] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
