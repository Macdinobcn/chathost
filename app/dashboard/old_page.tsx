'use client';
// app/dashboard/page.tsx
// Dashboard simplificado para clientes de ChatHost
// Muestra: stats, últimas conversaciones, config del widget
// Los clientes se identifican por el email de su sesión → client_users → clients

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

interface Client {
  id: string;
  name: string;
  widget_id: string;
  widget_color: string;
  plan: string;
  credits_balance: number;
  subscription_status: string;
}

interface Stats {
  totalConversations: number;
  totalMessages: number;
  messagesThisMonth: number;
  creditsUsed: number;
}

interface Conversation {
  id: string;
  started_at: string;
  message_count: number;
  session_id: string;
  firstMessage?: string;
}

export default function DashboardPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'conversations' | 'widget'>('overview');

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    // Obtener usuario actual
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Obtener client_id del usuario
    const { data: clientUser } = await supabase
      .from('client_users')
      .select('client_id')
      .eq('email', user.email)
      .single();

    if (!clientUser) {
      // El email no tiene cliente asociado
      setLoading(false);
      return;
    }

    // Cargar datos del cliente
    const { data: clientData } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientUser.client_id)
      .single();

    setClient(clientData as Client);

    // Cargar stats
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const [convResult, msgResult, monthMsgResult] = await Promise.all([
      supabase.from('conversations').select('id', { count: 'exact', head: true }).eq('client_id', clientUser.client_id),
      supabase.from('messages').select('id', { count: 'exact', head: true })
        .eq('conversations.client_id', clientUser.client_id),
      supabase.from('client_costs').select('messages_count').eq('client_id', clientUser.client_id)
        .eq('month', thisMonth.toISOString().slice(0, 7)).single(),
    ]);

    setStats({
      totalConversations: convResult.count || 0,
      totalMessages: 0, // simplificado
      messagesThisMonth: (monthMsgResult.data as any)?.messages_count || 0,
      creditsUsed: (clientData as any)?.credits_balance || 0,
    });

    // Cargar últimas conversaciones
    const { data: convs } = await supabase
      .from('conversations')
      .select('id, started_at, message_count, session_id')
      .eq('client_id', clientUser.client_id)
      .order('started_at', { ascending: false })
      .limit(20);

    // Para cada conv, obtener el primer mensaje de usuario
    const convsWithMsg = await Promise.all((convs || []).map(async (conv) => {
      const { data: msg } = await supabase
        .from('messages')
        .select('content')
        .eq('conversation_id', conv.id)
        .eq('role', 'user')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();
      return { ...conv, firstMessage: (msg as any)?.content?.slice(0, 80) || '' };
    }));

    setConversations(convsWithMsg);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/auth/login');
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>Cargando tu panel...</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>Tu cuenta no tiene un chatbot asociado.</p>
          <p style={{ color: '#9ca3af', fontSize: '13px' }}>Contacta con nosotros: hola@chathost.ai</p>
        </div>
      </div>
    );
  }

  const widgetColor = client.widget_color || '#2563eb';

  const planLimits: Record<string, number> = {
    starter: 500,
    pro: 3000,
    business: 10000,
    agency: 30000,
  };
  const planLimit = planLimits[client.plan?.toLowerCase()] || 500;
  const usedPct = Math.min(100, Math.round(((planLimit - (client.credits_balance || 0)) / planLimit) * 100));

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: '-apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#1e293b', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '14px' }}>C</span>
          </div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '16px' }}>ChatHost</span>
          <span style={{ color: '#64748b', fontSize: '13px' }}>· {client.name}</span>
        </div>
        <button
          onClick={handleLogout}
          style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '13px', cursor: 'pointer' }}
        >
          Cerrar sesión
        </button>
      </div>

      {/* Tabs */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 24px', display: 'flex', gap: '4px' }}>
        {[
          { id: 'overview', label: '📊 Resumen' },
          { id: 'conversations', label: '💬 Conversaciones' },
          { id: 'widget', label: '🎨 Mi widget' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '14px 16px',
              border: 'none',
              background: 'none',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? 600 : 400,
              color: activeTab === tab.id ? widgetColor : '#6b7280',
              borderBottom: activeTab === tab.id ? `2px solid ${widgetColor}` : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px' }}>

        {/* TAB: Resumen */}
        {activeTab === 'overview' && (
          <>
            {/* Stats cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
              <StatCard label="Conversaciones totales" value={stats?.totalConversations?.toString() || '0'} color={widgetColor} />
              <StatCard label="Mensajes este mes" value={stats?.messagesThisMonth?.toString() || '0'} color={widgetColor} />
              <StatCard label="Plan" value={client.plan?.charAt(0).toUpperCase() + client.plan?.slice(1) || 'Starter'} color={widgetColor} />
            </div>

            {/* Créditos disponibles */}
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e5e7eb',
              marginBottom: '24px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#111827' }}>Mensajes disponibles</h3>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  {client.credits_balance || 0} / {planLimit}
                </span>
              </div>
              <div style={{ background: '#f3f4f6', borderRadius: '8px', height: '10px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${100 - usedPct}%`,
                  background: (100 - usedPct) < 20 ? '#ef4444' : (100 - usedPct) < 50 ? '#f59e0b' : widgetColor,
                  borderRadius: '8px',
                  transition: 'width 0.3s',
                }} />
              </div>
              {(client.credits_balance || 0) < planLimit * 0.2 && (
                <p style={{ margin: '12px 0 0', fontSize: '13px', color: '#dc2626' }}>
                  ⚠️ Quedan pocos mensajes. Contacta con nosotros para ampliar tu plan.
                </p>
              )}
            </div>

            {/* Widget embed snippet */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 600, color: '#111827' }}>Tu código de instalación</h3>
              <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#6b7280' }}>
                Pega este código en el HTML de tu web, justo antes de <code>&lt;/body&gt;</code>:
              </p>
              <div style={{
                background: '#1e293b',
                borderRadius: '8px',
                padding: '16px',
                fontFamily: 'monospace',
                fontSize: '13px',
                color: '#e2e8f0',
                position: 'relative',
              }}>
                {`<script src="${process.env.NEXT_PUBLIC_APP_URL}/widget.js" data-id="${client.widget_id}"></script>`}
                <button
                  onClick={() => navigator.clipboard.writeText(
                    `<script src="${process.env.NEXT_PUBLIC_APP_URL}/widget.js" data-id="${client.widget_id}"></script>`
                  )}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: widgetColor,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Copiar
                </button>
              </div>
            </div>
          </>
        )}

        {/* TAB: Conversaciones */}
        {activeTab === 'conversations' && (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                Últimas conversaciones
              </h3>
            </div>
            {conversations.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                Todavía no hay conversaciones.
              </div>
            ) : (
              conversations.map((conv, i) => (
                <div key={conv.id} style={{
                  padding: '16px 24px',
                  borderBottom: i < conversations.length - 1 ? '1px solid #f3f4f6' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#111827' }}>
                      {conv.firstMessage || '(sin mensajes)'}
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                      {new Date(conv.started_at).toLocaleDateString('es-ES')} · {conv.message_count} mensajes
                    </p>
                  </div>
                  <div style={{
                    background: '#f3f4f6',
                    borderRadius: '20px',
                    padding: '4px 10px',
                    fontSize: '12px',
                    color: '#6b7280',
                  }}>
                    {conv.message_count} msgs
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB: Widget */}
        {activeTab === 'widget' && (
          <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 600, color: '#111827' }}>Tu chatbot</h3>
            <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#6b7280' }}>
              Para cambiar el nombre, color o configuración avanzada, contacta con nosotros.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#9ca3af' }}>Nombre del widget</p>
                <p style={{ margin: 0, fontWeight: 600, color: '#111827' }}>{client.name}</p>
              </div>
              <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#9ca3af' }}>Color principal</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: widgetColor }} />
                  <span style={{ fontWeight: 600, color: '#111827', fontFamily: 'monospace' }}>{widgetColor}</span>
                </div>
              </div>
              <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#9ca3af' }}>Plan</p>
                <p style={{ margin: 0, fontWeight: 600, color: '#111827', textTransform: 'capitalize' }}>{client.plan}</p>
              </div>
              <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#9ca3af' }}>Widget ID</p>
                <p style={{ margin: 0, fontWeight: 600, color: '#111827', fontFamily: 'monospace', fontSize: '12px' }}>{client.widget_id}</p>
              </div>
            </div>
            <div style={{ marginTop: '24px', padding: '16px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
              <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 600, color: '#1d4ed8' }}>¿Necesitas cambios?</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#3b82f6' }}>
                Escríbenos a <strong>hola@chathost.ai</strong> y te ayudamos en menos de 24h.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '20px 24px',
      border: '1px solid #e5e7eb',
    }}>
      <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color }}>
        {value}
      </p>
    </div>
  );
}
