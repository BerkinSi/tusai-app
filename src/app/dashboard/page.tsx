import { redirect } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/');
  }

  return <DashboardClient />;
} 