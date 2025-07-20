import { redirect } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/');
  }

  return <SettingsClient />;
} 