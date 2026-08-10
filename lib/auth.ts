import { auth } from '../auth';
import { redirect } from 'next/navigation';

export async function requireAuth(): Promise<any> {
  const session: any = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  return session;
}

export async function requireRole(role: 'ADMIN' | 'SALES') {
  const session: any = await requireAuth();
  if (session.user.role !== role) {
    redirect('/login');
  }
  return session;
}
