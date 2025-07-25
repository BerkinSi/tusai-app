import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Sign out the user
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Signout error:', error);
      return NextResponse.json({ 
        error: 'Failed to sign out' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Signed out successfully' 
    });

  } catch (error) {
    console.error('Signout error:', error);
    return NextResponse.json({ 
      error: 'Failed to sign out' 
    }, { status: 500 });
  }
} 