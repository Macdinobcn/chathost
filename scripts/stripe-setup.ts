// scripts/stripe-setup.ts
// Ejecutar UNA VEZ para crear todos los productos y precios en Stripe
// npx ts-node scripts/stripe-setup.ts

import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' })

async function setup() {
  console.log('Creando productos en Stripe...\n')

  const products = [
    // Suscripciones
    { name: 'ChatHost.ai Starter',  key: 'starter',   price: 1900, type: 'recurring' },
    { name: 'ChatHost.ai Pro',      key: 'pro',        price: 4900, type: 'recurring' },
    { name: 'ChatHost.ai Business', key: 'business',   price: 9900, type: 'recurring' },
    { name: 'ChatHost.ai Agency',   key: 'agency',     price: 19900, type: 'recurring' },
    { name: 'Bot adicional',        key: 'bot_extra',  price: 1000, type: 'recurring' },
    // Recargas puntuales
    { name: 'Recarga S — 625 msgs',   key: 'pack_s',  price: 500,  type: 'one_time' },
    { name: 'Recarga M — 2.000 msgs', key: 'pack_m',  price: 1500, type: 'one_time' },
    { name: 'Recarga L — 5.000 msgs', key: 'pack_l',  price: 3500, type: 'one_time' },
    { name: 'Recarga XL — 10.000 msgs', key: 'pack_xl', price: 6000, type: 'one_time' },
  ]

  const envLines: string[] = []

  for (const p of products) {
    const product = await stripe.products.create({ name: p.name })
    const priceConfig: Stripe.PriceCreateParams = {
      product: product.id,
      unit_amount: p.price,
      currency: 'eur',
    }
    if (p.type === 'recurring') {
      priceConfig.recurring = { interval: 'month' }
    }
    const price = await stripe.prices.create(priceConfig)
    const envKey = `STRIPE_PRICE_${p.key.toUpperCase()}`
    console.log(`✓ ${p.name}: ${envKey}=${price.id}`)
    envLines.push(`${envKey}=${price.id}`)
  }

  console.log('\n── Añade esto a tu .env.local ──')
  console.log(envLines.join('\n'))
}

setup().catch(console.error)
