import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getAuth } from '@/core/auth';
import { AdminNav } from '@/shared/components/admin/AdminNav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const auth = await getAuth();
  
  let session = null;
  try {
    session = await auth.api.getSession({ headers: headersList });
  } catch {}

  if (!session?.user) {
    redirect('/api/auth/sign-in/email?callbackUrl=/admin');
  }

  // Role check
  const adminEmails = (process.env.ADMIN_EMAILS || 'bigsea78@outlook.com').split(',').map(e => e.trim());
  const isAdmin = adminEmails.includes(session.user.email || '');
  if (!isAdmin) {
    redirect('/');
  }

  return (
    <div className='min-h-screen flex'>
      <aside className='w-60 border-r bg-muted/30 p-4 hidden md:flex flex-col'>
        <div className='font-bold text-lg mb-6'>管理后台</div>
        <AdminNav />
      </aside>
      <main className='flex-1 p-6 overflow-auto bg-muted/10'>
        {children}
      </main>
    </div>
  );
}
