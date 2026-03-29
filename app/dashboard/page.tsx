'use client';
// app/dashboard/page.tsx
// Redirige al cliente a su propio panel en /admin/clients/[id]

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

      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Si es admin → panel de admin
      const adminEmails = ['alexcollspeyra@gmail.com', 'chathostapp@gmail.com']
      if (user.email && adminEmails.includes(user.email)) {
        router.push('/admin');
        return;
      }

      const { data: clientUser } = await supabase
        .from('client_users')
        .select('client_id')
        .eq('email', user.email)
        .single();

      if (!clientUser) {
        router.push('/auth/login');
        return;
      }

      router.push(`/admin/clients/${clientUser.client_id}`);
    }

    redirect();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f9fafb',
      fontFamily: '-apple-system, sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          borderRadius: '12px',
          margin: '0 auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: '20px' }}>C</span>
        </div>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Cargando tu panel...</p>
      </div>
    </div>
  );
}
