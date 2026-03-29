'use client'
// app/LandingClient.tsx
// Multilanguage landing page — detects browser language (ES/EN/FR/DE)

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Lang = 'es' | 'en' | 'fr' | 'de'

const T = {
  es: {
    nav: { how: 'Cómo funciona', pricing: 'Precios', clients: 'Clientes', contact: 'Contacto', login: 'Entrar', start: 'Empezar gratis →' },
    heroPill: 'IA para negocios locales',
    heroH1a: 'La IA trabaja', heroH1b: 'para ti ', heroH1em: '24 horas', heroH1c: ' al día',
    heroP: 'ChatHost.ai lee tu web, aprende sobre tu negocio y atiende a tus clientes con respuestas precisas. Sin código. Sin complicaciones.',
    heroCta: 'Crear mi chatbot gratis →', heroDemo: 'Ver demos ↓',
    trialBadge: 'PRUEBA GRATUITA', trialDays: 'durante 15 días',
    trialDesc: 'Acceso completo a todas las funciones. Sin compromisos.',
    trialChecks: ['100 mensajes de prueba incluidos', 'Sin tarjeta de crédito', 'Tu chatbot listo en 5 minutos', 'Cancela cuando quieras'],
    trialCta: 'Empezar gratis ahora →', trialFine: 'Sin tarjeta · Sin letra pequeña',
    demosSection: 'En acción', demosTitle: 'Así responde tu chatbot ', demosTitleEm: 'hoy mismo',
    demosSub: 'Clientes reales, respuestas reales. Disponible las 24h en cualquier idioma.',
    widgetsSection: 'Widgets contextuales', widgetsSub: 'Más allá del chat: el asistente muestra datos en tiempo real dentro de la conversación',
    widgetWeatherTitle: 'Widget del Tiempo', widgetWeatherSub: 'Datos en tiempo real',
    widgetCamTitle: 'Widget Webcam', widgetCamSub: 'Imagen en vivo', widgetCamUpdated: 'Actualizado hace 2 min',
    widgetOccTitle: 'Widget Ocupación', widgetOccSub: 'Disponibilidad hoy', widgetOccLabel: 'Parcelas ocupadas',
    widgetOccStats: [{ label: 'Libres hoy', val: '28' }, { label: 'Reservadas', val: '72' }, { label: 'Check-in', val: '12h' }, { label: 'Check-out', val: '11h' }],
    widgetOccAvail: '✓ Plazas disponibles este fin de semana',
    statsLabel: ['conversaciones atendidas', 'disponibilidad', 'idiomas automáticos'],
    clientsLabel: 'Empresas que ya usan ChatHost.ai',
    howSection: 'Cómo funciona',
    howTitle: 'En 5 minutos tienes', howTitleEm: 'un chatbot que sabe todo sobre tu negocio',
    howSub: 'Sin código, sin configuraciones complicadas. Solo tu web y listo.',
    steps: [
      { title: 'Pega tu URL', desc: 'Introduce la dirección de tu web. ChatHost.ai la lee entera y extrae toda la información relevante para tus clientes.' },
      { title: 'IA genera tu base', desc: 'En segundos, nuestra IA organiza precios, horarios, servicios y FAQs en una base de conocimiento inteligente.' },
      { title: 'Pega el código', desc: 'Copia una línea de código y pégala en tu web. El chatbot aparece al instante, listo para atender 24/7.' },
    ],
    featuresSection: 'Funcionalidades',
    featuresTitle: 'Diseñado para negocios', featuresTitleEm: 'que no tienen tiempo que perder',
    features: [
      { icon: '🔄', title: 'Siempre actualizado', desc: 'Re-scrapea tu web automáticamente. Cuando cambias precios o añades servicios, el chatbot lo sabe al día siguiente.' },
      { icon: '🌍', title: 'Multiidioma automático', desc: 'Detecta el idioma del visitante y responde en español, inglés, francés, alemán, holandés y más sin configuración.' },
      { icon: '📊', title: 'Analytics de conversaciones', desc: 'Ve qué preguntan tus clientes, detecta dudas frecuentes y mejora tu web con datos reales.' },
      { icon: '🎨', title: 'Tu marca, tu estilo', desc: 'Personaliza colores, logo y nombre del asistente. El widget se adapta perfectamente a tu web.' },
      { icon: '☀️', title: 'Widgets contextuales', desc: 'Muestra el tiempo en tiempo real, webcams de tus instalaciones o el nivel de ocupación del día.' },
      { icon: '🔒', title: 'Datos en Europa', desc: 'Todos los datos se guardan en servidores europeos. Cumplimiento GDPR garantizado.' },
    ],
    pricingSection: 'Precios',
    pricingTitle: 'Simple. Sin sorpresas.', pricingTitleEm: 'Sin letra pequeña.',
    pricingSub: '1 crédito = 1 mensaje. Siempre. Sin trampas de tokens ni modelos que consumen 20 créditos por mensaje.',
    pricingExtra: 'Bots adicionales', pricingExtraVal: '€10/mes por bot extra en cualquier plan',
    pricingRecharge: 'Recargas', pricingRechargeVal: 'desde €5 si te quedas sin mensajes',
    testiQuote: '«Teníamos recepción respondiendo las mismas 20 preguntas todos los días. Ahora el chatbot lo hace solo, a las 3 de la mañana, en cualquier idioma.»',
    testiName: 'Estación de Astún — Candanchú',
    testiRole: 'Gestionamos más de 30.000 conversaciones al año',
    ctaTitle: 'Empieza hoy.', ctaTitleEm: 'Es gratis.',
    ctaP: '100 mensajes de prueba. Sin tarjeta de crédito. Sin compromisos.',
    ctaCta: 'Crear mi chatbot gratis →',
    ctaNote: '¿Preguntas? Escríbenos a',
    footerDesc: 'Chatbots IA para negocios locales. Campings, hoteles, estaciones de esquí, clínicas y más.',
    footerCols: [
      { title: 'Producto', links: [{ label: 'Cómo funciona', href: '#como-funciona' }, { label: 'Precios', href: '#precios' }, { label: 'Registro', href: '/auth/register' }, { label: 'Entrar', href: '/auth/login' }] },
      { title: 'Empresa', links: [{ label: 'Arandai', href: 'https://arandai.com' }, { label: 'Contacto', href: '/contacto' }, { label: 'hola@chathost.ai', href: 'mailto:hola@chathost.ai' }] },
      { title: 'Legal', links: [{ label: 'Privacidad', href: '/privacy' }, { label: 'Términos', href: 'mailto:hola@chathost.ai' }, { label: 'GDPR', href: 'mailto:hola@chathost.ai' }] },
    ],
    footerCredit: 'Producto creado por',
    footerMade: 'Hecho en España 🇪🇸 · Datos en Europa 🇪🇺',
  },
  en: {
    nav: { how: 'How it works', pricing: 'Pricing', clients: 'Clients', contact: 'Contact', login: 'Login', start: 'Start free →' },
    heroPill: 'AI for local businesses',
    heroH1a: 'AI works for you', heroH1b: '', heroH1em: '24 hours', heroH1c: ' a day',
    heroP: 'ChatHost.ai reads your website, learns about your business and answers your customers with precise responses. No code. No hassle.',
    heroCta: 'Create my chatbot free →', heroDemo: 'See demos ↓',
    trialBadge: 'FREE TRIAL', trialDays: 'for 15 days',
    trialDesc: 'Full access to all features. No commitments.',
    trialChecks: ['100 test messages included', 'No credit card required', 'Your chatbot ready in 5 minutes', 'Cancel anytime'],
    trialCta: 'Start free now →', trialFine: 'No card · No fine print',
    demosSection: 'In action', demosTitle: 'This is how your chatbot responds ', demosTitleEm: 'today',
    demosSub: 'Real customers, real answers. Available 24/7 in any language.',
    widgetsSection: 'Contextual widgets', widgetsSub: 'Beyond chat: the assistant shows real-time data inside the conversation',
    widgetWeatherTitle: 'Weather Widget', widgetWeatherSub: 'Real-time data',
    widgetCamTitle: 'Webcam Widget', widgetCamSub: 'Live image', widgetCamUpdated: 'Updated 2 min ago',
    widgetOccTitle: 'Occupancy Widget', widgetOccSub: 'Availability today', widgetOccLabel: 'Occupied spots',
    widgetOccStats: [{ label: 'Available', val: '28' }, { label: 'Reserved', val: '72' }, { label: 'Check-in', val: '12h' }, { label: 'Check-out', val: '11h' }],
    widgetOccAvail: '✓ Spots available this weekend',
    statsLabel: ['conversations handled', 'availability', 'automatic languages'],
    clientsLabel: 'Companies already using ChatHost.ai',
    howSection: 'How it works',
    howTitle: 'In 5 minutes you have', howTitleEm: 'a chatbot that knows everything about your business',
    howSub: 'No code, no complex setup. Just your website and you\'re done.',
    steps: [
      { title: 'Paste your URL', desc: 'Enter your website address. ChatHost.ai reads it entirely and extracts all relevant information for your customers.' },
      { title: 'AI builds your base', desc: 'In seconds, our AI organizes prices, schedules, services and FAQs into an intelligent knowledge base.' },
      { title: 'Paste the code', desc: 'Copy one line of code and paste it on your website. The chatbot appears instantly, ready to serve 24/7.' },
    ],
    featuresSection: 'Features',
    featuresTitle: 'Designed for businesses', featuresTitleEm: 'that have no time to waste',
    features: [
      { icon: '🔄', title: 'Always up to date', desc: 'Re-scrapes your website automatically. When you change prices or add services, the chatbot knows the next day.' },
      { icon: '🌍', title: 'Automatic multilingual', desc: 'Detects the visitor\'s language and responds in Spanish, English, French, German, Dutch and more without configuration.' },
      { icon: '📊', title: 'Conversation analytics', desc: 'See what your customers ask, spot frequent doubts and improve your website with real data.' },
      { icon: '🎨', title: 'Your brand, your style', desc: 'Customize colors, logo and assistant name. The widget adapts perfectly to your website.' },
      { icon: '☀️', title: 'Contextual widgets', desc: 'Show real-time weather, webcams of your facilities or today\'s occupancy level.' },
      { icon: '🔒', title: 'Data in Europe', desc: 'All data is stored on European servers. GDPR compliance guaranteed.' },
    ],
    pricingSection: 'Pricing',
    pricingTitle: 'Simple. No surprises.', pricingTitleEm: 'No fine print.',
    pricingSub: '1 credit = 1 message. Always. No token traps or models that use 20 credits per message.',
    pricingExtra: 'Extra bots', pricingExtraVal: '€10/month per extra bot on any plan',
    pricingRecharge: 'Top-ups', pricingRechargeVal: 'from €5 if you run out of messages',
    testiQuote: '«We had reception answering the same 20 questions every day. Now the chatbot does it alone, at 3am, in any language.»',
    testiName: 'Astún — Candanchú Ski Resort',
    testiRole: 'We handle more than 30,000 conversations per year',
    ctaTitle: 'Start today.', ctaTitleEm: 'It\'s free.',
    ctaP: '100 test messages. No credit card. No commitments.',
    ctaCta: 'Create my chatbot free →',
    ctaNote: 'Questions? Write to us at',
    footerDesc: 'AI chatbots for local businesses. Campings, hotels, ski resorts, clinics and more.',
    footerCols: [
      { title: 'Product', links: [{ label: 'How it works', href: '#como-funciona' }, { label: 'Pricing', href: '#precios' }, { label: 'Sign up', href: '/auth/register' }, { label: 'Login', href: '/auth/login' }] },
      { title: 'Company', links: [{ label: 'Arandai', href: 'https://arandai.com' }, { label: 'Contact', href: '/contacto' }, { label: 'hello@chathost.ai', href: 'mailto:hola@chathost.ai' }] },
      { title: 'Legal', links: [{ label: 'Privacy', href: '/privacy' }, { label: 'Terms', href: 'mailto:hola@chathost.ai' }, { label: 'GDPR', href: 'mailto:hola@chathost.ai' }] },
    ],
    footerCredit: 'Product created by',
    footerMade: 'Made in Spain 🇪🇸 · Data in Europe 🇪🇺',
  },
  fr: {
    nav: { how: 'Comment ça marche', pricing: 'Tarifs', clients: 'Clients', contact: 'Contact', login: 'Connexion', start: 'Commencer gratuitement →' },
    heroPill: 'IA pour les entreprises locales',
    heroH1a: "L'IA travaille", heroH1b: 'pour vous ', heroH1em: '24 heures', heroH1c: ' par jour',
    heroP: "ChatHost.ai lit votre site web, apprend sur votre activité et répond à vos clients avec précision. Sans code. Sans complications.",
    heroCta: 'Créer mon chatbot gratuit →', heroDemo: 'Voir les démos ↓',
    trialBadge: 'ESSAI GRATUIT', trialDays: 'pendant 15 jours',
    trialDesc: 'Accès complet à toutes les fonctionnalités. Sans engagement.',
    trialChecks: ['100 messages de test inclus', 'Sans carte bancaire', 'Votre chatbot prêt en 5 minutes', 'Annulez quand vous voulez'],
    trialCta: 'Commencer gratuitement →', trialFine: 'Sans carte · Sans frais cachés',
    demosSection: 'En action', demosTitle: 'Voici comment votre chatbot répond ', demosTitleEm: "dès aujourd'hui",
    demosSub: 'Vrais clients, vraies réponses. Disponible 24h/24 dans toutes les langues.',
    widgetsSection: 'Widgets contextuels', widgetsSub: 'Au-delà du chat: l\'assistant affiche des données en temps réel dans la conversation',
    widgetWeatherTitle: 'Widget Météo', widgetWeatherSub: 'Données en temps réel',
    widgetCamTitle: 'Widget Webcam', widgetCamSub: 'Image en direct', widgetCamUpdated: 'Mis à jour il y a 2 min',
    widgetOccTitle: "Widget d'Occupation", widgetOccSub: "Disponibilité aujourd'hui", widgetOccLabel: 'Emplacements occupés',
    widgetOccStats: [{ label: 'Disponibles', val: '28' }, { label: 'Réservés', val: '72' }, { label: 'Check-in', val: '12h' }, { label: 'Check-out', val: '11h' }],
    widgetOccAvail: '✓ Places disponibles ce week-end',
    statsLabel: ['conversations gérées', 'disponibilité', 'langues automatiques'],
    clientsLabel: 'Entreprises qui utilisent déjà ChatHost.ai',
    howSection: 'Comment ça marche',
    howTitle: 'En 5 minutes vous avez', howTitleEm: 'un chatbot qui connaît tout sur votre activité',
    howSub: 'Sans code, sans configuration compliquée. Juste votre site web et c\'est parti.',
    steps: [
      { title: 'Collez votre URL', desc: 'Entrez l\'adresse de votre site. ChatHost.ai le lit entièrement et extrait toutes les informations pertinentes pour vos clients.' },
      { title: "L'IA construit votre base", desc: 'En quelques secondes, notre IA organise les prix, horaires, services et FAQs en une base de connaissances intelligente.' },
      { title: 'Collez le code', desc: 'Copiez une ligne de code et collez-la sur votre site. Le chatbot apparaît instantanément, prêt à répondre 24h/24.' },
    ],
    featuresSection: 'Fonctionnalités',
    featuresTitle: 'Conçu pour les entreprises', featuresTitleEm: 'qui n\'ont pas de temps à perdre',
    features: [
      { icon: '🔄', title: 'Toujours à jour', desc: 'Re-scrape votre site automatiquement. Quand vous changez les prix ou ajoutez des services, le chatbot le sait le lendemain.' },
      { icon: '🌍', title: 'Multilingue automatique', desc: 'Détecte la langue du visiteur et répond en espagnol, anglais, français, allemand, néerlandais et plus.' },
      { icon: '📊', title: 'Analytique des conversations', desc: 'Voyez ce que demandent vos clients, repérez les questions fréquentes et améliorez votre site avec de vraies données.' },
      { icon: '🎨', title: 'Votre marque, votre style', desc: 'Personnalisez les couleurs, le logo et le nom de l\'assistant. Le widget s\'adapte parfaitement à votre site.' },
      { icon: '☀️', title: 'Widgets contextuels', desc: 'Affichez la météo en temps réel, des webcams de vos installations ou le niveau d\'occupation du jour.' },
      { icon: '🔒', title: 'Données en Europe', desc: 'Toutes les données sont stockées sur des serveurs européens. Conformité RGPD garantie.' },
    ],
    pricingSection: 'Tarifs',
    pricingTitle: 'Simple. Sans surprises.', pricingTitleEm: 'Sans frais cachés.',
    pricingSub: '1 crédit = 1 message. Toujours. Pas de pièges à tokens ni de modèles qui consomment 20 crédits par message.',
    pricingExtra: 'Bots supplémentaires', pricingExtraVal: '10€/mois par bot supplémentaire',
    pricingRecharge: 'Recharges', pricingRechargeVal: 'à partir de 5€ si vous manquez de messages',
    testiQuote: '«Nous avions la réception qui répondait aux mêmes 20 questions tous les jours. Maintenant le chatbot le fait seul, à 3h du matin, dans n\'importe quelle langue.»',
    testiName: 'Station de ski Astún — Candanchú',
    testiRole: 'Nous gérons plus de 30 000 conversations par an',
    ctaTitle: 'Commencez aujourd\'hui.', ctaTitleEm: "C'est gratuit.",
    ctaP: '100 messages de test. Sans carte bancaire. Sans engagement.',
    ctaCta: 'Créer mon chatbot gratuit →',
    ctaNote: 'Des questions ? Écrivez-nous à',
    footerDesc: 'Chatbots IA pour les entreprises locales. Campings, hôtels, stations de ski, cliniques et plus.',
    footerCols: [
      { title: 'Produit', links: [{ label: 'Comment ça marche', href: '#como-funciona' }, { label: 'Tarifs', href: '#precios' }, { label: "S'inscrire", href: '/auth/register' }, { label: 'Connexion', href: '/auth/login' }] },
      { title: 'Entreprise', links: [{ label: 'Arandai', href: 'https://arandai.com' }, { label: 'Contact', href: '/contacto' }, { label: 'hola@chathost.ai', href: 'mailto:hola@chathost.ai' }] },
      { title: 'Légal', links: [{ label: 'Confidentialité', href: '/privacy' }, { label: 'Conditions', href: 'mailto:hola@chathost.ai' }, { label: 'RGPD', href: 'mailto:hola@chathost.ai' }] },
    ],
    footerCredit: 'Produit créé par',
    footerMade: 'Fait en Espagne 🇪🇸 · Données en Europe 🇪🇺',
  },
  de: {
    nav: { how: 'Wie es funktioniert', pricing: 'Preise', clients: 'Kunden', contact: 'Kontakt', login: 'Anmelden', start: 'Kostenlos starten →' },
    heroPill: 'KI für lokale Unternehmen',
    heroH1a: 'KI arbeitet für Sie', heroH1b: '', heroH1em: '24 Stunden', heroH1c: ' am Tag',
    heroP: 'ChatHost.ai liest Ihre Website, lernt über Ihr Unternehmen und beantwortet Ihre Kunden mit präzisen Antworten. Kein Code. Keine Komplikationen.',
    heroCta: 'Meinen Chatbot kostenlos erstellen →', heroDemo: 'Demos ansehen ↓',
    trialBadge: 'KOSTENLOSE TESTPHASE', trialDays: 'für 15 Tage',
    trialDesc: 'Vollständiger Zugang zu allen Funktionen. Keine Verpflichtungen.',
    trialChecks: ['100 Testnachrichten inbegriffen', 'Keine Kreditkarte erforderlich', 'Ihr Chatbot in 5 Minuten bereit', 'Jederzeit kündbar'],
    trialCta: 'Jetzt kostenlos starten →', trialFine: 'Keine Karte · Kein Kleingedrucktes',
    demosSection: 'In Aktion', demosTitle: 'So antwortet Ihr Chatbot ', demosTitleEm: 'noch heute',
    demosSub: 'Echte Kunden, echte Antworten. Rund um die Uhr in jeder Sprache verfügbar.',
    widgetsSection: 'Kontextuelle Widgets', widgetsSub: 'Über den Chat hinaus: der Assistent zeigt Echtzeitdaten in der Konversation',
    widgetWeatherTitle: 'Wetter-Widget', widgetWeatherSub: 'Echtzeit-Daten',
    widgetCamTitle: 'Webcam-Widget', widgetCamSub: 'Live-Bild', widgetCamUpdated: 'Vor 2 Min. aktualisiert',
    widgetOccTitle: 'Belegungs-Widget', widgetOccSub: 'Verfügbarkeit heute', widgetOccLabel: 'Belegte Stellplätze',
    widgetOccStats: [{ label: 'Verfügbar', val: '28' }, { label: 'Reserviert', val: '72' }, { label: 'Check-in', val: '12h' }, { label: 'Check-out', val: '11h' }],
    widgetOccAvail: '✓ Plätze dieses Wochenende verfügbar',
    statsLabel: ['Gespräche abgewickelt', 'Verfügbarkeit', 'automatische Sprachen'],
    clientsLabel: 'Unternehmen, die ChatHost.ai bereits nutzen',
    howSection: 'Wie es funktioniert',
    howTitle: 'In 5 Minuten haben Sie', howTitleEm: 'einen Chatbot, der alles über Ihr Unternehmen weiß',
    howSub: 'Kein Code, keine komplizierte Einrichtung. Nur Ihre Website und fertig.',
    steps: [
      { title: 'URL einfügen', desc: 'Geben Sie Ihre Website-Adresse ein. ChatHost.ai liest sie vollständig und extrahiert alle relevanten Informationen für Ihre Kunden.' },
      { title: 'KI erstellt Ihre Basis', desc: 'In Sekunden organisiert unsere KI Preise, Zeiten, Dienste und FAQs in eine intelligente Wissensbasis.' },
      { title: 'Code einfügen', desc: 'Kopieren Sie eine Codezeile und fügen Sie sie auf Ihrer Website ein. Der Chatbot erscheint sofort, bereit 24/7 zu antworten.' },
    ],
    featuresSection: 'Funktionen',
    featuresTitle: 'Entwickelt für Unternehmen', featuresTitleEm: 'die keine Zeit zu verlieren haben',
    features: [
      { icon: '🔄', title: 'Immer aktuell', desc: 'Re-scrapt Ihre Website automatisch. Wenn Sie Preise ändern oder Dienste hinzufügen, weiß der Chatbot es am nächsten Tag.' },
      { icon: '🌍', title: 'Automatisch mehrsprachig', desc: 'Erkennt die Sprache des Besuchers und antwortet auf Spanisch, Englisch, Französisch, Deutsch, Niederländisch und mehr.' },
      { icon: '📊', title: 'Konversations-Analytik', desc: 'Sehen Sie, was Ihre Kunden fragen, erkennen Sie häufige Zweifel und verbessern Sie Ihre Website mit echten Daten.' },
      { icon: '🎨', title: 'Ihre Marke, Ihr Stil', desc: 'Passen Sie Farben, Logo und Assistentennamen an. Das Widget passt sich perfekt an Ihre Website an.' },
      { icon: '☀️', title: 'Kontextuelle Widgets', desc: 'Zeigen Sie Echtzeit-Wetter, Webcams Ihrer Einrichtungen oder das Belegungsniveau des Tages an.' },
      { icon: '🔒', title: 'Daten in Europa', desc: 'Alle Daten werden auf europäischen Servern gespeichert. DSGVO-Konformität garantiert.' },
    ],
    pricingSection: 'Preise',
    pricingTitle: 'Einfach. Keine Überraschungen.', pricingTitleEm: 'Kein Kleingedrucktes.',
    pricingSub: '1 Kredit = 1 Nachricht. Immer. Keine Token-Fallen oder Modelle, die 20 Kredite pro Nachricht verbrauchen.',
    pricingExtra: 'Zusätzliche Bots', pricingExtraVal: '10€/Monat pro zusätzlichem Bot in jedem Plan',
    pricingRecharge: 'Aufladungen', pricingRechargeVal: 'ab 5€ wenn Nachrichten aufgebraucht',
    testiQuote: '«Wir hatten den Empfang, der täglich dieselben 20 Fragen beantwortete. Jetzt macht es der Chatbot alleine, um 3 Uhr morgens, in jeder Sprache.»',
    testiName: 'Skigebiet Astún — Candanchú',
    testiRole: 'Wir bearbeiten mehr als 30.000 Gespräche pro Jahr',
    ctaTitle: 'Starten Sie heute.', ctaTitleEm: 'Es ist kostenlos.',
    ctaP: '100 Testnachrichten. Keine Kreditkarte. Keine Verpflichtungen.',
    ctaCta: 'Meinen Chatbot kostenlos erstellen →',
    ctaNote: 'Fragen? Schreiben Sie uns an',
    footerDesc: 'KI-Chatbots für lokale Unternehmen. Campingplätze, Hotels, Skigebiete, Kliniken und mehr.',
    footerCols: [
      { title: 'Produkt', links: [{ label: 'Wie es funktioniert', href: '#como-funciona' }, { label: 'Preise', href: '#precios' }, { label: 'Registrieren', href: '/auth/register' }, { label: 'Anmelden', href: '/auth/login' }] },
      { title: 'Unternehmen', links: [{ label: 'Arandai', href: 'https://arandai.com' }, { label: 'Kontakt', href: '/contacto' }, { label: 'hola@chathost.ai', href: 'mailto:hola@chathost.ai' }] },
      { title: 'Rechtliches', links: [{ label: 'Datenschutz', href: '/privacy' }, { label: 'AGB', href: 'mailto:hola@chathost.ai' }, { label: 'DSGVO', href: 'mailto:hola@chathost.ai' }] },
    ],
    footerCredit: 'Produkt erstellt von',
    footerMade: 'Hergestellt in Spanien 🇪🇸 · Daten in Europa 🇪🇺',
  },
}

export default function LandingClient() {
  const [lang, setLang] = useState<Lang>('es')

  useEffect(() => {
    const l = navigator.language.toLowerCase()
    if (l.startsWith('en')) setLang('en')
    else if (l.startsWith('fr')) setLang('fr')
    else if (l.startsWith('de')) setLang('de')
    else setLang('es')
  }, [])

  const t = T[lang]

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --blue: #3b82f6; --blue-light: #60a5fa; --indigo: #6366f1;
          --dark: #060914; --dark2: #0d1117; --dark3: #161b27; --dark4: #1e2636;
          --border: rgba(255,255,255,0.08); --text: #f1f5f9; --text2: #94a3b8; --text3: #475569;
          --grad: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          --grad-text: linear-gradient(135deg, #60a5fa, #a78bfa);
        }
        html { scroll-behavior: smooth; }
        body { font-family: 'Outfit', sans-serif; background: var(--dark); color: var(--text); line-height: 1.6; -webkit-font-smoothing: antialiased; }
        nav { position: sticky; top: 0; z-index: 100; background: rgba(6,9,20,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); padding: 0 48px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
        .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .nav-links { display: flex; gap: 36px; }
        .nav-links a { text-decoration: none; color: var(--text2); font-size: 14px; font-weight: 500; transition: color 0.2s; }
        .nav-links a:hover { color: white; }
        .nav-right { display: flex; align-items: center; gap: 12px; }
        .btn-ghost-dark { text-decoration: none; color: var(--text2); font-size: 14px; font-weight: 500; padding: 8px 16px; border-radius: 8px; transition: all 0.2s; border: 1px solid transparent; }
        .btn-ghost-dark:hover { color: white; border-color: var(--border); }
        .btn-grad { text-decoration: none; background: var(--grad); color: white; font-size: 14px; font-weight: 600; padding: 9px 20px; border-radius: 8px; border: none; cursor: pointer; transition: opacity 0.2s, transform 0.15s; box-shadow: 0 0 24px rgba(99,102,241,0.35); }
        .btn-grad:hover { opacity: 0.9; transform: translateY(-1px); }
        .hero-h1 { font-family: 'Playfair Display', serif; font-size: 58px; line-height: 1.1; font-weight: 700; margin-bottom: 24px; color: white; letter-spacing: -0.02em; animation: fadeUp 0.5s 0.1s ease both; }
        .hero-h1 em { font-style: italic; background: var(--grad-text); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-p { font-size: 18px; color: var(--text2); line-height: 1.75; margin-bottom: 36px; font-weight: 300; animation: fadeUp 0.5s 0.2s ease both; }
        @media (max-width: 900px) { .hero-h1 { font-size: 38px; } }
        .hero-pill { display: inline-flex; align-items: center; gap: 8px; background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.3); color: #a78bfa; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 20px; margin-bottom: 28px; letter-spacing: 0.05em; text-transform: uppercase; animation: fadeUp 0.5s ease both; }
        .hero-pill span { width: 6px; height: 6px; border-radius: 50%; background: #a78bfa; display: inline-block; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        .hero-actions { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; animation: fadeUp 0.5s 0.3s ease both; }
        .btn-large-grad { text-decoration: none; background: var(--grad); color: white; font-size: 15px; font-weight: 600; padding: 15px 30px; border-radius: 10px; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; box-shadow: 0 0 40px rgba(99,102,241,0.4); }
        .btn-large-grad:hover { opacity: 0.9; transform: translateY(-2px); box-shadow: 0 8px 40px rgba(99,102,241,0.5); }
        .btn-large-outline { text-decoration: none; color: var(--text2); font-size: 15px; font-weight: 500; padding: 15px 30px; border-radius: 10px; border: 1px solid var(--border); display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .btn-large-outline:hover { border-color: rgba(255,255,255,0.2); color: white; }
        .widget-wrap { position: relative; animation: fadeUp 0.6s 0.15s ease both; }
        .widget-dark { background: var(--dark3); border: 1px solid var(--border); border-radius: 20px; overflow: hidden; box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04); max-width: 340px; margin-left: auto; }
        .widget-dark-header { background: var(--grad); padding: 16px 18px; display: flex; align-items: center; gap: 10px; }
        .widget-dark-avatar { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 16px; }
        .widget-dark-name { color: white; font-weight: 600; font-size: 14px; }
        .widget-dark-status { color: rgba(255,255,255,0.7); font-size: 12px; display: flex; align-items: center; gap: 4px; }
        .widget-dark-status::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #4ade80; display: inline-block; }
        .widget-dark-msgs { padding: 16px; display: flex; flex-direction: column; gap: 12px; background: var(--dark3); }
        .dmsg-bot { background: var(--dark4); border: 1px solid var(--border); border-radius: 4px 14px 14px 14px; padding: 10px 14px; font-size: 13px; color: var(--text); max-width: 85%; line-height: 1.5; }
        .dmsg-user { background: var(--grad); border-radius: 14px 4px 14px 14px; padding: 10px 14px; font-size: 13px; color: white; max-width: 85%; align-self: flex-end; line-height: 1.5; }
        .widget-dark-input { padding: 12px 16px; border-top: 1px solid var(--border); display: flex; gap: 8px; align-items: center; background: var(--dark3); }
        .widget-dark-field { flex: 1; background: var(--dark4); border: 1px solid var(--border); border-radius: 20px; padding: 8px 14px; font-size: 13px; color: var(--text2); font-family: 'Outfit', sans-serif; outline: none; }
        .widget-dark-send { width: 32px; height: 32px; border-radius: 50%; background: var(--grad); border: none; cursor: pointer; color: white; font-size: 14px; display: flex; align-items: center; justify-content: center; }
        .widget-dark-powered { text-align: center; padding: 8px; font-size: 11px; color: var(--text3); background: var(--dark3); }
        .widget-dark-powered a { color: var(--blue-light); text-decoration: none; }
        .clients-strip { border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 24px 48px; background: var(--dark2); }
        .clients-strip p { text-align: center; font-size: 11px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; }
        .clients-logos { display: flex; align-items: center; justify-content: center; gap: 32px; flex-wrap: wrap; }
        .client-chip { font-size: 13px; font-weight: 600; color: var(--text3); letter-spacing: 0.04em; }
        .section { padding: 80px 48px; max-width: 1100px; margin: 0 auto; }
        .section-pill { display: inline-flex; align-items: center; gap: 6px; background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); color: #a78bfa; font-size: 11px; font-weight: 700; padding: 5px 12px; border-radius: 20px; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.08em; }
        .section-title { font-family: 'Playfair Display', serif; font-size: 44px; font-weight: 700; line-height: 1.15; margin-bottom: 16px; color: white; letter-spacing: -0.02em; }
        .section-title em { font-style: italic; background: var(--grad-text); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .section-sub { font-size: 17px; color: var(--text2); font-weight: 300; max-width: 520px; line-height: 1.7; }
        .steps { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; margin-top: 52px; }
        .step-dark { background: var(--dark3); border: 1px solid var(--border); border-radius: 16px; padding: 28px 24px; transition: border-color 0.2s; }
        .step-dark:hover { border-color: rgba(99,102,241,0.4); }
        .step-num-dark { width: 44px; height: 44px; border-radius: 12px; background: var(--grad); color: white; font-weight: 800; font-size: 18px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 0 20px rgba(99,102,241,0.3); }
        .step-dark h3 { font-size: 17px; font-weight: 700; color: white; margin-bottom: 10px; }
        .step-dark p { font-size: 14px; color: var(--text2); line-height: 1.7; }
        .features-dark { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-top: 52px; }
        .feature-dark { background: var(--dark3); border: 1px solid var(--border); border-radius: 14px; padding: 26px 22px; transition: border-color 0.2s, transform 0.2s; }
        .feature-dark:hover { border-color: rgba(99,102,241,0.3); transform: translateY(-2px); }
        .feature-icon-dark { width: 44px; height: 44px; border-radius: 10px; background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.2); display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 16px; }
        .feature-dark h3 { font-size: 15px; font-weight: 700; color: white; margin-bottom: 8px; }
        .feature-dark p { font-size: 13px; color: var(--text2); line-height: 1.7; }
        .pricing-wrap { background: var(--dark2); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 80px 48px; }
        .pricing-inner { max-width: 1100px; margin: 0 auto; }
        .plan-dark { background: var(--dark3); border: 1px solid var(--border); border-radius: 16px; padding: 28px 22px; position: relative; transition: border-color 0.2s, transform 0.2s; }
        .plan-dark:hover { border-color: rgba(99,102,241,0.3); transform: translateY(-2px); }
        .plan-dark.hot { border-color: rgba(99,102,241,0.5); box-shadow: 0 0 40px rgba(99,102,241,0.15); }
        .plan-hot-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--grad); color: white; font-size: 11px; font-weight: 700; padding: 3px 14px; border-radius: 20px; white-space: nowrap; }
        .plan-icon-dark { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 14px; }
        .plan-name-dark { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
        .plan-price-dark { display: flex; align-items: baseline; gap: 3px; margin-bottom: 4px; }
        .plan-price-num-dark { font-family: 'Playfair Display', serif; font-size: 44px; color: white; line-height: 1; }
        .plan-price-per-dark { font-size: 13px; color: var(--text3); }
        .plan-msgs-dark { font-size: 13px; color: var(--text2); margin-bottom: 24px; }
        .plan-divider-dark { height: 1px; background: var(--border); margin-bottom: 18px; }
        .plan-features-dark { list-style: none; display: flex; flex-direction: column; gap: 9px; margin-bottom: 24px; }
        .plan-features-dark li { font-size: 13px; color: var(--text2); display: flex; align-items: flex-start; gap: 8px; }
        .plan-features-dark li .ck { flex-shrink: 0; margin-top: 1px; font-weight: 700; }
        .plan-features-dark li .nx { flex-shrink: 0; margin-top: 1px; color: var(--text3); }
        .plan-cta-dark { display: block; text-align: center; text-decoration: none; padding: 11px; border-radius: 9px; font-size: 14px; font-weight: 600; transition: all 0.2s; }
        .plan-cta-border { border: 1px solid var(--border); color: var(--text2); }
        .plan-cta-border:hover { border-color: rgba(255,255,255,0.2); color: white; }
        .plan-cta-grad { background: var(--grad); color: white; box-shadow: 0 0 20px rgba(99,102,241,0.3); }
        .plan-cta-grad:hover { opacity: 0.9; }
        .plan-extra-dark { margin-top: 10px; text-align: center; font-size: 12px; color: var(--text3); }
        .pricing-footer { margin-top: 28px; padding: 16px 24px; background: var(--dark3); border: 1px solid var(--border); border-radius: 10px; font-size: 13px; color: var(--text2); text-align: center; }
        .pricing-footer strong { color: white; }
        .testi-wrap { padding: 80px 48px; max-width: 860px; margin: 0 auto; text-align: center; }
        .stars-dark { color: #fbbf24; font-size: 20px; margin-bottom: 28px; letter-spacing: 4px; }
        .testi-quote { font-family: 'Playfair Display', serif; font-size: 26px; line-height: 1.6; color: white; font-style: italic; margin-bottom: 32px; }
        .testi-author { display: flex; align-items: center; justify-content: center; gap: 14px; }
        .testi-avatar { width: 46px; height: 46px; border-radius: 50%; background: var(--grad); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 18px; box-shadow: 0 0 20px rgba(99,102,241,0.3); }
        .testi-name { font-size: 14px; font-weight: 700; color: white; }
        .testi-role { font-size: 13px; color: var(--text2); }
        .cta-wrap { padding: 100px 48px; text-align: center; background: var(--dark2); border-top: 1px solid var(--border); position: relative; overflow: hidden; }
        .cta-glow { position: absolute; width: 600px; height: 400px; background: radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%); top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none; }
        .cta-wrap h2 { font-family: 'Playfair Display', serif; font-size: 52px; font-weight: 700; color: white; line-height: 1.15; margin-bottom: 16px; position: relative; }
        .cta-wrap h2 em { font-style: italic; background: var(--grad-text); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .cta-wrap > p { font-size: 18px; color: var(--text2); margin-bottom: 40px; font-weight: 300; position: relative; }
        .cta-note { font-size: 13px; color: var(--text3); margin-top: 16px; position: relative; }
        footer { background: var(--dark); border-top: 1px solid var(--border); padding: 48px 48px 32px; }
        .footer-inner { max-width: 1100px; margin: 0 auto; }
        .footer-top { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 48px; }
        .footer-brand p { font-size: 13px; color: var(--text3); line-height: 1.7; margin-top: 12px; max-width: 240px; }
        .footer-col h4 { font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 16px; }
        .footer-col a { display: block; font-size: 13px; color: var(--text3); text-decoration: none; margin-bottom: 10px; transition: color 0.2s; }
        .footer-col a:hover { color: var(--text2); }
        .footer-bottom { border-top: 1px solid var(--border); padding-top: 24px; display: flex; justify-content: space-between; align-items: center; }
        .footer-bottom p { font-size: 12px; color: var(--text3); }
        .lang-switcher { display: flex; gap: 6px; align-items: center; }
        .lang-btn { background: none; border: 1px solid rgba(255,255,255,0.1); color: var(--text3); font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 5px; cursor: pointer; font-family: inherit; transition: all 0.15s; }
        .lang-btn:hover, .lang-btn.active { border-color: rgba(99,102,241,0.4); color: #818cf8; background: rgba(99,102,241,0.08); }
        @media (max-width: 900px) {
          .steps, .features-dark { grid-template-columns: 1fr; }
          .footer-top { grid-template-columns: 1fr 1fr; }
          nav { padding: 0 24px; }
          .nav-links { display: none; }
        }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
      `}} />

      {/* NAV */}
      <nav>
        <Link href="/" className="logo">
          <img src="/logo.png" alt="ChatHost.ai" style={{ height: 36, width: 'auto' }} />
        </Link>
        <div className="nav-links">
          <a href="#como-funciona">{t.nav.how}</a>
          <a href="#precios">{t.nav.pricing}</a>
          <a href="#clientes">{t.nav.clients}</a>
          <Link href="/contacto">{t.nav.contact}</Link>
        </div>
        <div className="nav-right">
          <div className="lang-switcher">
            {(['es','en','fr','de'] as Lang[]).map(l => (
              <button key={l} className={`lang-btn${lang === l ? ' active' : ''}`} onClick={() => setLang(l)}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <Link href="/auth/login" className="btn-ghost-dark">{t.nav.login}</Link>
          <Link href="/auth/register" className="btn-grad">{t.nav.start}</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 48px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>

          {/* Izquierda — texto */}
          <div>
            <div className="hero-pill"><span></span> {t.heroPill}</div>
            <h1 className="hero-h1">{t.heroH1a}<br />{t.heroH1b}<em>{t.heroH1em}</em>{t.heroH1c}</h1>
            <p className="hero-p">{t.heroP}</p>
            <div className="hero-actions">
              <Link href="/auth/register" className="btn-large-grad">{t.heroCta}</Link>
              <a href="#demos" className="btn-large-outline">{t.heroDemo}</a>
            </div>
          </div>

          {/* Derecha — oferta 0€ */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: -1, borderRadius: 24, background: 'linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)', padding: 1, zIndex: 0 }}>
              <div style={{ borderRadius: 23, background: '#0d1117', height: '100%' }} />
            </div>
            <div style={{ position: 'relative', zIndex: 1, borderRadius: 24, padding: '36px 32px', background: 'linear-gradient(135deg,rgba(59,130,246,0.08),rgba(99,102,241,0.12))', boxShadow: '0 0 60px rgba(99,102,241,0.2)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '4px 12px', marginBottom: 20 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8', display: 'inline-block' }}></span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', letterSpacing: '0.06em' }}>{t.trialBadge}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 72, fontWeight: 700, lineHeight: 1, background: 'linear-gradient(135deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>0€</span>
                <span style={{ fontSize: 16, color: '#475569', fontWeight: 500 }}>{t.trialDays}</span>
              </div>
              <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24, lineHeight: 1.6 }}>{t.trialDesc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {t.trialChecks.map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: '#818cf8', fontSize: 11, fontWeight: 700 }}>✓</span>
                    </div>
                    <span style={{ fontSize: 13, color: '#94a3b8' }}>{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/auth/register" style={{ display: 'block', textAlign: 'center', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: 'white', fontSize: 15, fontWeight: 700, padding: '15px', borderRadius: 12, textDecoration: 'none', boxShadow: '0 8px 32px rgba(99,102,241,0.5)', letterSpacing: '-0.01em' }}>
                {t.trialCta}
              </Link>
              <p style={{ textAlign: 'center', fontSize: 11, color: '#334155', marginTop: 12 }}>{t.trialFine}</p>
            </div>
          </div>

        </div>
      </section>

      {/* DEMOS — 3 chats */}
      <div id="demos" style={{ background: 'var(--dark2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '64px 48px', marginTop: 64 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-pill">✦ {t.demosSection}</div>
            <h2 className="section-title" style={{ fontSize: 36 }}>{t.demosTitle}<em>{t.demosTitleEm}</em></h2>
            <p style={{ fontSize: 15, color: 'var(--text2)', fontWeight: 300 }}>{t.demosSub}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>

            {/* Chat 1 — Astún */}
            <div className="widget-dark">
              <div className="widget-dark-header">
                <div className="widget-dark-avatar">⛷️</div>
                <div>
                  <div className="widget-dark-name">Astún Candanchú</div>
                  <div className="widget-dark-status">En línea ahora</div>
                </div>
              </div>
              <div className="widget-dark-msgs">
                <div className="dmsg-bot">¡Hola! Soy el asistente de Astún. ¿En qué puedo ayudarte? 👋</div>
                <div className="dmsg-user">¿Cuánto cuesta el forfait de un día?</div>
                <div className="dmsg-bot">El forfait adulto cuesta <strong>42€</strong> en ventanilla o <strong>38€</strong> online. ¿Te paso el enlace? 🎿</div>
              </div>
              <div className="widget-dark-input">
                <input className="widget-dark-field" placeholder="Escribe tu pregunta..." readOnly />
                <button className="widget-dark-send">↑</button>
              </div>
              <div className="widget-dark-powered">Powered by <a href="/">ChatHost.ai</a></div>
            </div>

            {/* Chat 2 — Camping */}
            <div className="widget-dark">
              <div className="widget-dark-header" style={{ background: 'linear-gradient(135deg,#059669,#0d9488)' }}>
                <div className="widget-dark-avatar">🏕️</div>
                <div>
                  <div className="widget-dark-name">Camping La Siesta</div>
                  <div className="widget-dark-status">En línea ahora</div>
                </div>
              </div>
              <div className="widget-dark-msgs">
                <div className="dmsg-bot">¡Bienvenido al Camping La Siesta! ¿En qué te ayudo? ☀️</div>
                <div className="dmsg-user">¿Tenéis parcelas con sombra disponibles en agosto?</div>
                <div className="dmsg-bot">Sí, tenemos parcelas bajo pinos con toma de corriente. En agosto es recomendable reservar con antelación. ¿Te envío el formulario? 🌲</div>
              </div>
              <div className="widget-dark-input">
                <input className="widget-dark-field" placeholder="Escribe tu pregunta..." readOnly />
                <button className="widget-dark-send" style={{ background: 'linear-gradient(135deg,#059669,#0d9488)' }}>↑</button>
              </div>
              <div className="widget-dark-powered">Powered by <a href="/">ChatHost.ai</a></div>
            </div>

            {/* Chat 3 — Padel */}
            <div className="widget-dark">
              <div className="widget-dark-header" style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
                <div className="widget-dark-avatar">🎾</div>
                <div>
                  <div className="widget-dark-name">Mental Padel</div>
                  <div className="widget-dark-status">En línea ahora</div>
                </div>
              </div>
              <div className="widget-dark-msgs">
                <div className="dmsg-bot">¡Hola! Soy el asistente de Mental Padel. ¿Qué necesitas? 🎾</div>
                <div className="dmsg-user">¿Hay pistas libres esta tarde?</div>
                <div className="dmsg-bot">Esta tarde tenemos pistas disponibles de <strong>17h a 20h</strong>. Puedes reservar online o llamarnos. ¿Te paso el enlace de reserva? 🏆</div>
              </div>
              <div className="widget-dark-input">
                <input className="widget-dark-field" placeholder="Escribe tu pregunta..." readOnly />
                <button className="widget-dark-send" style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>↑</button>
              </div>
              <div className="widget-dark-powered">Powered by <a href="/">ChatHost.ai</a></div>
            </div>

          </div>

          {/* Widgets contextuales */}
          <div style={{ marginTop: 48, marginBottom: 8 }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div className="section-pill" style={{ marginBottom: 10 }}>✦ {t.widgetsSection}</div>
              <p style={{ fontSize: 14, color: 'var(--text3)', fontWeight: 400 }}>{t.widgetsSub}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>

              {/* Widget 1 — Tiempo */}
              <div style={{ background: 'linear-gradient(135deg,rgba(14,165,233,0.12),rgba(6,182,212,0.08))', border: '1px solid rgba(14,165,233,0.25)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(135deg,#0ea5e9,#0891b2)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>☀️</span>
                  <div>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>{t.widgetWeatherTitle}</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{t.widgetWeatherSub}</div>
                  </div>
                </div>
                <div style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 40, fontWeight: 800, color: 'white', lineHeight: 1 }}>-2°</div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Pico de la Cruz · 2.080m</div>
                    </div>
                    <div style={{ fontSize: 40 }}>🌨️</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                    {[{d:'Hoy',t:'-2°',e:'🌨️'},{d:'Mañana',t:'3°',e:'⛅'},{d:'Sábado',t:'7°',e:'☀️'}].map(w=>(
                      <div key={w.d} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '8px 4px' }}>
                        <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>{w.d}</div>
                        <div style={{ fontSize: 16 }}>{w.e}</div>
                        <div style={{ fontSize: 12, color: 'white', fontWeight: 700, marginTop: 2 }}>{w.t}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(14,165,233,0.1)', borderRadius: 8, fontSize: 11, color: '#7dd3fc' }}>
                    ❄️ 35 cm nieve polvo · Pistas abiertas: 18/22
                  </div>
                </div>
              </div>

              {/* Widget 2 — Webcam */}
              <div style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.08))', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(135deg,#6366f1,#7c3aed)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>📷</span>
                  <div>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>{t.widgetCamTitle}</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{t.widgetCamSub}</div>
                  </div>
                </div>
                <div style={{ padding: '18px 20px' }}>
                  <div style={{ background: 'var(--dark)', borderRadius: 10, overflow: 'hidden', position: 'relative', marginBottom: 12, aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(99,102,241,0.08) 0%,rgba(0,0,0,0.4) 100%)' }}></div>
                    <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                      <div style={{ fontSize: 32, marginBottom: 6 }}>🏔️</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>Cámara · Telesilla Principal</div>
                    </div>
                    <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(239,68,68,0.9)', borderRadius: 4, padding: '2px 6px', fontSize: 9, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'white', display: 'inline-block' }}></span>EN VIVO
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{t.widgetCamUpdated}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {['Pico','Base','Parking'].map(c=>(
                        <div key={c} style={{ fontSize: 10, color: '#818cf8', background: 'rgba(99,102,241,0.1)', padding: '3px 7px', borderRadius: 4, cursor: 'pointer' }}>{c}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Widget 3 — Ocupación */}
              <div style={{ background: 'linear-gradient(135deg,rgba(34,197,94,0.12),rgba(16,185,129,0.08))', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(135deg,#16a34a,#0d9488)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>📊</span>
                  <div>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>{t.widgetOccTitle}</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{t.widgetOccSub}</div>
                  </div>
                </div>
                <div style={{ padding: '18px 20px' }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>{t.widgetOccLabel}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#4ade80' }}>72%</span>
                    </div>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '72%', background: 'linear-gradient(90deg,#16a34a,#4ade80)', borderRadius: 4 }}></div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                    {t.widgetOccStats.map((s,i)=>(
                      <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 12px' }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: ['#4ade80','#f97316','#60a5fa','#a78bfa'][i] }}>{s.val}</div>
                        <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: '#4ade80', background: 'rgba(34,197,94,0.08)', borderRadius: 8, padding: '7px 10px', textAlign: 'center' }}>
                    {t.widgetOccAvail}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 48, marginTop: 40 }}>
            {[
              { num: '30.000+', label: t.statsLabel[0] },
              { num: '24/7', label: t.statsLabel[1] },
              { num: '∞', label: t.statsLabel[2] },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'white', fontFamily: "'Playfair Display', serif" }}>{s.num}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CLIENTS STRIP */}
      <div className="clients-strip">
        <p>{t.clientsLabel}</p>
        <div className="clients-logos">
          <span className="client-chip">⛷️ ASTÚN CANDANCHÚ</span>
          <span className="client-chip">⛷️ FORMIGAL</span>
          <span className="client-chip">⛷️ BAQUEIRA BERET</span>
          <span className="client-chip">⛷️ SIERRA NEVADA</span>
          <span className="client-chip">🏕️ CAMPING LA SIESTA</span>
          <span className="client-chip">🏕️ CAMPING ARAGUÁS</span>
          <span className="client-chip">🏨 HOTEL RURAL ORDESA</span>
          <span className="client-chip">🏨 GRAN HOTEL JACA</span>
          <span className="client-chip">🎾 MENTAL PADEL</span>
          <span className="client-chip">🎾 TOP PADEL BCN</span>
          <span className="client-chip">🦷 CLÍNICA DENTAL NOVA</span>
          <span className="client-chip">🦷 ORTODONCIA ZARAGOZA</span>
          <span className="client-chip">💆 SPA & WELLNESS HUESCA</span>
          <span className="client-chip">🏋️ GYM FIT MADRID</span>
        </div>
      </div>

      {/* CÓMO FUNCIONA */}
      <div id="como-funciona">
        <div className="section">
          <div className="section-pill">✦ {t.howSection}</div>
          <h2 className="section-title">{t.howTitle}<br /><em>{t.howTitleEm}</em></h2>
          <p className="section-sub">{t.howSub}</p>
          <div className="steps">
            {t.steps.map((s, i) => (
              <div key={i} className="step-dark">
                <div className="step-num-dark">{i + 1}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ background: 'var(--dark2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="section">
          <div className="section-pill">✦ {t.featuresSection}</div>
          <h2 className="section-title">{t.featuresTitle}<br /><em>{t.featuresTitleEm}</em></h2>
          <div className="features-dark">
            {t.features.map(f => (
              <div key={f.title} className="feature-dark">
                <div className="feature-icon-dark">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRICING */}
      <div id="precios" className="pricing-wrap">
        <div className="pricing-inner">
          <div className="section-pill">✦ {t.pricingSection}</div>
          <h2 className="section-title">{t.pricingTitle}<br /><em>{t.pricingTitleEm}</em></h2>
          <p className="section-sub">{t.pricingSub}</p>

          {/* Fila 1: Trial + Starter */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 52, marginBottom: 16 }}>
            {/* TRIAL */}
            <div className="plan-dark" style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.08),rgba(99,102,241,0.12))', borderColor: 'rgba(99,102,241,0.4)', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, background: 'radial-gradient(circle,rgba(99,102,241,0.2),transparent)', pointerEvents: 'none' }}></div>
              <div className="plan-icon-dark" style={{ background: 'rgba(99,102,241,0.15)' }}>🎁</div>
              <div className="plan-name-dark" style={{ color: '#818cf8' }}>Trial</div>
              <div className="plan-price-dark">
                <span className="plan-price-num-dark" style={{ background: 'linear-gradient(135deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>0€</span>
                <span className="plan-price-per-dark">/ 15 {lang === 'de' ? 'Tage' : lang === 'fr' ? 'jours' : lang === 'en' ? 'days' : 'días'}</span>
              </div>
              <div className="plan-msgs-dark">100 {lang === 'de' ? 'Nachrichten' : lang === 'fr' ? 'messages' : 'mensajes'} · 1 chatbot</div>
              <div className="plan-divider-dark"></div>
              <ul className="plan-features-dark">
                {t.trialChecks.concat(['Widget embebible']).map(f => (
                  <li key={f}><span className="ck" style={{ color: '#818cf8' }}>✓</span> {f}</li>
                ))}
              </ul>
              <Link href="/auth/register" className="plan-cta-dark plan-cta-grad" style={{ fontSize: 15, padding: 13, fontWeight: 700 }}>{t.heroCta}</Link>
              <div className="plan-extra-dark" style={{ color: '#6366f1' }}>{t.trialFine.split('·')[1]?.trim() || 'Sin compromisos'}</div>
            </div>

            {/* STARTER */}
            <div className="plan-dark">
              <div className="plan-icon-dark" style={{ background: 'rgba(34,197,94,0.1)' }}>🌱</div>
              <div className="plan-name-dark" style={{ color: '#22c55e' }}>Starter</div>
              <div className="plan-price-dark">
                <span className="plan-price-num-dark">19€</span>
                <span className="plan-price-per-dark">/{lang === 'de' ? 'Monat' : lang === 'fr' ? 'mois' : lang === 'en' ? 'mo' : 'mes'}</span>
              </div>
              <div className="plan-msgs-dark">500 {lang === 'de' ? 'Nachrichten' : lang === 'fr' ? 'messages' : 'mensajes'} · 1 chatbot</div>
              <div className="plan-divider-dark"></div>
              <ul className="plan-features-dark">
                <li><span className="ck" style={{ color: '#22c55e' }}>✓</span> 1 chatbot</li>
                <li><span className="ck" style={{ color: '#22c55e' }}>✓</span> 500 {lang === 'en' ? 'messages/month' : lang === 'fr' ? 'messages/mois' : lang === 'de' ? 'Nachr./Monat' : 'mensajes/mes'}</li>
                <li><span className="ck" style={{ color: '#22c55e' }}>✓</span> {lang === 'en' ? 'Weekly re-crawl' : lang === 'fr' ? 'Re-crawl hebdomadaire' : lang === 'de' ? 'Wöchentl. Re-crawl' : 'Re-crawl semanal'}</li>
                <li><span className="ck" style={{ color: '#22c55e' }}>✓</span> {lang === 'en' ? 'Multilingual' : lang === 'fr' ? 'Multilingue' : lang === 'de' ? 'Mehrsprachig' : 'Multiidioma'}</li>
                <li><span className="nx">✗</span> <span style={{ color: 'var(--text3)' }}>{lang === 'en' ? 'Contextual widgets' : lang === 'fr' ? 'Widgets contextuels' : lang === 'de' ? 'Kontextuelle Widgets' : 'Widgets contextuales'}</span></li>
                <li><span className="nx">✗</span> <span style={{ color: 'var(--text3)' }}>{lang === 'en' ? 'Advanced analytics' : lang === 'fr' ? 'Analytique avancée' : lang === 'de' ? 'Erw. Analytik' : 'Analytics avanzado'}</span></li>
              </ul>
              <Link href="/auth/register" className="plan-cta-dark plan-cta-border" style={{ borderColor: 'rgba(34,197,94,0.3)', color: '#22c55e' }}>
                {lang === 'en' ? 'Subscribe' : lang === 'fr' ? "S'abonner" : lang === 'de' ? 'Abonnieren' : 'Contratar'}
              </Link>
              <div className="plan-extra-dark">+€10/{lang === 'de' ? 'Monat' : lang === 'fr' ? 'mois' : lang === 'en' ? 'mo' : 'mes'} {lang === 'en' ? 'per extra bot' : lang === 'fr' ? 'par bot supplémentaire' : lang === 'de' ? 'pro Bot' : 'por bot extra'}</div>
            </div>
          </div>

          {/* Fila 2: Pro + Business + Agency */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {/* PRO */}
            <div className="plan-dark hot">
              <div className="plan-hot-badge">⭐ {lang === 'en' ? 'Most popular' : lang === 'fr' ? 'Le plus populaire' : lang === 'de' ? 'Beliebteste' : 'Más popular'}</div>
              <div className="plan-icon-dark" style={{ background: 'rgba(99,102,241,0.12)' }}>🚀</div>
              <div className="plan-name-dark" style={{ color: '#818cf8' }}>Pro</div>
              <div className="plan-price-dark">
                <span className="plan-price-num-dark">49€</span>
                <span className="plan-price-per-dark">/{lang === 'de' ? 'Monat' : lang === 'fr' ? 'mois' : lang === 'en' ? 'mo' : 'mes'}</span>
              </div>
              <div className="plan-msgs-dark">3.000 {lang === 'de' ? 'Nachrichten' : lang === 'fr' ? 'messages' : 'mensajes'} · 3 chatbots</div>
              <div className="plan-divider-dark"></div>
              <ul className="plan-features-dark">
                <li><span className="ck" style={{ color: '#818cf8' }}>✓</span> 3 chatbots</li>
                <li><span className="ck" style={{ color: '#818cf8' }}>✓</span> 3.000 {lang === 'en' ? 'msg/month' : lang === 'fr' ? 'msg/mois' : lang === 'de' ? 'Nachr./Monat' : 'mensajes/mes'}</li>
                <li><span className="ck" style={{ color: '#818cf8' }}>✓</span> {lang === 'en' ? 'Daily re-crawl' : lang === 'fr' ? 'Re-crawl quotidien' : lang === 'de' ? 'Tägl. Re-crawl' : 'Re-crawl diario'}</li>
                <li><span className="ck" style={{ color: '#818cf8' }}>✓</span> {lang === 'en' ? 'Weather widget ☀️' : lang === 'fr' ? 'Widget météo ☀️' : lang === 'de' ? 'Wetter-Widget ☀️' : 'Widget del tiempo ☀️'}</li>
                <li><span className="ck" style={{ color: '#818cf8' }}>✓</span> {lang === 'en' ? 'Advanced analytics' : lang === 'fr' ? 'Analytique avancée' : lang === 'de' ? 'Erw. Analytik' : 'Analytics avanzado'}</li>
                <li><span className="nx">✗</span> <span style={{ color: 'var(--text3)' }}>{lang === 'en' ? 'Webcam & occupancy' : lang === 'fr' ? 'Webcam et occupation' : lang === 'de' ? 'Webcam & Belegung' : 'Webcam y ocupación'}</span></li>
              </ul>
              <Link href="/auth/register" className="plan-cta-dark plan-cta-grad">
                {lang === 'en' ? 'Subscribe' : lang === 'fr' ? "S'abonner" : lang === 'de' ? 'Abonnieren' : 'Contratar'}
              </Link>
              <div className="plan-extra-dark">+€10/{lang === 'de' ? 'Monat' : lang === 'fr' ? 'mois' : lang === 'en' ? 'mo' : 'mes'} {lang === 'en' ? 'per extra bot' : lang === 'fr' ? 'par bot supplémentaire' : lang === 'de' ? 'pro Bot' : 'por bot extra'}</div>
            </div>

            {/* BUSINESS */}
            <div className="plan-dark">
              <div className="plan-icon-dark" style={{ background: 'rgba(168,85,247,0.1)' }}>💼</div>
              <div className="plan-name-dark" style={{ color: '#c084fc' }}>Business</div>
              <div className="plan-price-dark">
                <span className="plan-price-num-dark">99€</span>
                <span className="plan-price-per-dark">/{lang === 'de' ? 'Monat' : lang === 'fr' ? 'mois' : lang === 'en' ? 'mo' : 'mes'}</span>
              </div>
              <div className="plan-msgs-dark">10.000 {lang === 'de' ? 'Nachrichten' : lang === 'fr' ? 'messages' : 'mensajes'} · 10 chatbots</div>
              <div className="plan-divider-dark"></div>
              <ul className="plan-features-dark">
                <li><span className="ck" style={{ color: '#c084fc' }}>✓</span> 10 chatbots</li>
                <li><span className="ck" style={{ color: '#c084fc' }}>✓</span> 10.000 {lang === 'en' ? 'msg/month' : lang === 'fr' ? 'msg/mois' : lang === 'de' ? 'Nachr./Monat' : 'mensajes/mes'}</li>
                <li><span className="ck" style={{ color: '#c084fc' }}>✓</span> {lang === 'en' ? 'Everything in Pro' : lang === 'fr' ? 'Tout le Pro' : lang === 'de' ? 'Alles aus Pro' : 'Todo lo de Pro'}</li>
                <li><span className="ck" style={{ color: '#c084fc' }}>✓</span> {lang === 'en' ? 'Webcam & occupancy 📷' : lang === 'fr' ? 'Webcam et occupation 📷' : lang === 'de' ? 'Webcam & Belegung 📷' : 'Webcam y ocupación 📷'}</li>
                <li><span className="ck" style={{ color: '#c084fc' }}>✓</span> {lang === 'en' ? 'Weekly reports' : lang === 'fr' ? 'Rapports hebdomadaires' : lang === 'de' ? 'Wöchentl. Berichte' : 'Informes semanales'}</li>
                <li><span className="ck" style={{ color: '#c084fc' }}>✓</span> {lang === 'en' ? 'Priority support' : lang === 'fr' ? 'Support prioritaire' : lang === 'de' ? 'Prioritäts-Support' : 'Soporte prioritario'}</li>
              </ul>
              <Link href="/auth/register" className="plan-cta-dark plan-cta-border" style={{ borderColor: 'rgba(168,85,247,0.3)', color: '#c084fc' }}>
                {lang === 'en' ? 'Subscribe' : lang === 'fr' ? "S'abonner" : lang === 'de' ? 'Abonnieren' : 'Contratar'}
              </Link>
              <div className="plan-extra-dark">+€10/{lang === 'de' ? 'Monat' : lang === 'fr' ? 'mois' : lang === 'en' ? 'mo' : 'mes'} {lang === 'en' ? 'per extra bot' : lang === 'fr' ? 'par bot supplémentaire' : lang === 'de' ? 'pro Bot' : 'por bot extra'}</div>
            </div>

            {/* AGENCY */}
            <div className="plan-dark" style={{ borderColor: 'rgba(251,146,60,0.35)' }}>
              <div className="plan-icon-dark" style={{ background: 'rgba(251,146,60,0.1)' }}>🏢</div>
              <div className="plan-name-dark" style={{ color: '#fb923c' }}>Agency</div>
              <div className="plan-price-dark">
                <span className="plan-price-num-dark">199€</span>
                <span className="plan-price-per-dark">/{lang === 'de' ? 'Monat' : lang === 'fr' ? 'mois' : lang === 'en' ? 'mo' : 'mes'}</span>
              </div>
              <div className="plan-msgs-dark">30.000 {lang === 'de' ? 'Nachrichten' : lang === 'fr' ? 'messages' : 'mensajes'} · {lang === 'en' ? 'up to' : lang === 'fr' ? "jusqu'à" : lang === 'de' ? 'bis zu' : 'hasta'} 50 bots</div>
              <div className="plan-divider-dark"></div>
              <ul className="plan-features-dark">
                <li><span className="ck" style={{ color: '#fb923c' }}>✓</span> {lang === 'en' ? 'Up to 50 chatbots' : lang === 'fr' ? "Jusqu'à 50 chatbots" : lang === 'de' ? 'Bis zu 50 Chatbots' : 'Hasta 50 chatbots'}</li>
                <li><span className="ck" style={{ color: '#fb923c' }}>✓</span> 30.000 {lang === 'en' ? 'msg/month' : lang === 'fr' ? 'msg/mois' : lang === 'de' ? 'Nachr./Monat' : 'mensajes/mes'}</li>
                <li><span className="ck" style={{ color: '#fb923c' }}>✓</span> {lang === 'en' ? 'Everything in Business' : lang === 'fr' ? 'Tout le Business' : lang === 'de' ? 'Alles aus Business' : 'Todo lo de Business'}</li>
                <li><span className="ck" style={{ color: '#fb923c' }}>✓</span> White-label</li>
                <li><span className="ck" style={{ color: '#fb923c' }}>✓</span> API Access</li>
                <li><span className="ck" style={{ color: '#fb923c' }}>✓</span> {lang === 'en' ? 'Account manager' : lang === 'fr' ? 'Gestionnaire de compte' : lang === 'de' ? 'Kundenbetreuer' : 'Gestor de cuenta'}</li>
              </ul>
              <a href="mailto:hola@chathost.ai" className="plan-cta-dark plan-cta-border" style={{ borderColor: 'rgba(251,146,60,0.4)', color: '#fb923c' }}>
                {lang === 'en' ? 'Talk to sales' : lang === 'fr' ? 'Parler aux ventes' : lang === 'de' ? 'Vertrieb kontaktieren' : 'Hablar con ventas'}
              </a>
              <div className="plan-extra-dark">+€10/{lang === 'de' ? 'Monat' : lang === 'fr' ? 'mois' : lang === 'en' ? 'mo' : 'mes'} {lang === 'en' ? 'per extra bot' : lang === 'fr' ? 'par bot supplémentaire' : lang === 'de' ? 'pro Bot' : 'por bot extra'}</div>
            </div>
          </div>

          <div className="pricing-footer">
            <strong>{t.pricingExtra}:</strong> {t.pricingExtraVal} &nbsp;·&nbsp;
            <strong>{t.pricingRecharge}:</strong> {t.pricingRechargeVal}
          </div>
        </div>
      </div>

      {/* TESTIMONIAL */}
      <div id="clientes">
        <div className="testi-wrap">
          <div className="stars-dark">★★★★★</div>
          <p className="testi-quote">{t.testiQuote}</p>
          <div className="testi-author">
            <div className="testi-avatar">A</div>
            <div style={{ textAlign: 'left' }}>
              <div className="testi-name">{t.testiName}</div>
              <div className="testi-role">{t.testiRole}</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA FINAL */}
      <div className="cta-wrap">
        <div className="cta-glow"></div>
        <h2>{t.ctaTitle}<br /><em>{t.ctaTitleEm}</em></h2>
        <p>{t.ctaP}</p>
        <Link href="/auth/register" className="btn-large-grad" style={{ fontSize: 16, padding: '17px 40px' }}>
          {t.ctaCta}
        </Link>
        <p className="cta-note">{t.ctaNote} <a href="mailto:hola@chathost.ai" style={{ color: 'inherit' }}>hola@chathost.ai</a></p>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <Link href="/" className="logo">
                <img src="/logo.png" alt="ChatHost.ai" style={{ height: 32, width: 'auto' }} />
              </Link>
              <p>{t.footerDesc}</p>
            </div>
            {t.footerCols.map(col => (
              <div key={col.title} className="footer-col">
                <h4>{col.title}</h4>
                {col.links.map(link => (
                  link.href.startsWith('/') ? (
                    <Link key={link.label} href={link.href}>{link.label}</Link>
                  ) : (
                    <a key={link.label} href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{link.label}</a>
                  )
                ))}
              </div>
            ))}
          </div>
          <div className="footer-bottom">
            <p>© 2026 ChatHost.ai · <a href="https://arandai.com" target="_blank" rel="noreferrer" style={{ color: 'var(--text3)', textDecoration: 'none' }}>{t.footerCredit} Arandai.com</a></p>
            <p>{t.footerMade}</p>
          </div>
        </div>
      </footer>
    </>
  )
}
