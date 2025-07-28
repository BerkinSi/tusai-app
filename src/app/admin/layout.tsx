import { AdminAuthProvider } from '@/lib/AdminAuthContext';
import AdminAuthGuard from '@/components/AdminAuthGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminAuthGuard>
        {children}
      </AdminAuthGuard>
    </AdminAuthProvider>
  );
} 