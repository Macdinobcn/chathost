// app/page.tsx — server component wrapper (keeps metadata)
import LandingClient from './LandingClient'

export const metadata = {
  title: 'ChatHost.ai — Chatbot IA para tu negocio',
  description: 'ChatHost.ai lee tu web, aprende sobre tu negocio y atiende a tus clientes con respuestas precisas. Sin código. Sin complicaciones.',
}

export default function LandingPage() {
  return <LandingClient />
}
