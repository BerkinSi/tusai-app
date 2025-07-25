import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Logout error:', error);
      return NextResponse.json({ error: 'Logout failed', details: error }, { status: 500 });
    }

    return NextResponse.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Test logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 