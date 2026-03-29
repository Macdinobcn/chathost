// scripts/stripe-setup.mjs
// Ejecutar: node scripts/stripe-setup.mjs

import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

async function setup() {
  console.log('Creando productos en Stripe...\n')

  const products = [
    { name: 'ChatHost Starter',   key: 'STARTER',   price: 1900,  recurring: true },
    { name: 'ChatHost Pro',       key: 'PRO',        price: 4900,  recurring: true },
    { name: 'ChatHost Business',  key: 'BUSINESS',   price: 9900,  recurring: true },
    { name: 'ChatHost Agency',    key: 'AGENCY',     price: 19900, recurring: true },
    { name: 'Bot adicional',      key: 'BOT_EXTRA',  price: 1000,  recurring: true },
    { name: 'Recarga S 625 msgs',    key: 'PACK_S',  price: 500,   recurring: false },
    { name: 'Recarga M 2000 msgs',   key: 'PACK_M',  price: 1500,  recurring: false },
    { name: 'Recarga L 5000 msgs',   key: 'PACK_L',  price: 3500,  recurring: false },
    { name: 'Recarga XL 10000 msgs', key: 'PACK_XL', price: 6000,  recurring: false },
  ]

  const lines = []
  for (const p of products) {
    const product = await stripe.products.create({ name: p.name })
    const priceData = {
      product: product.id,
      unit_amount: p.price,
      currency: 'eur',
    }
    if (p.recurring) priceData.recurring = { interval: 'month' }
    const price = await stripe.prices.create(priceData)
    const line = `STRIPE_PRICE_${p.key}=${price.id}`
    console.log(`✓ ${p.name}: ${line}`)
    lines.push(line)
  }

  console.log('\n── Copia esto en tu .env.local ──')
  console.log(lines.join('\n'))
}

setup().catch(console.error)
