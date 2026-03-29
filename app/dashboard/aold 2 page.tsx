'use client';
// app/dashboard/page.tsx
// Si es admin → /admin
// Si es cliente → /admin/clients/[su-id]

import { useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function redirect() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      // Si es el admin → panel de admin
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'alexcollspeyra@gmail.com';
      if (user.email === adminEmail) {
        router.push('/admin');
        return;
      }

      // Si es cliente → su panel
      const { data: clientUser } = await supabase
        .from('client_users').select('client_id').eq('email', user.email).single();

      if (clientUser) {
        router.push(`/admin/clients/${clientUser.client_id}`);
      } else {
        router.push('/auth/login');
      }
    }
    redirect();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>C</span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>Cargando...</p>
      </div>
    </div>
  );
}
