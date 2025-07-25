import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Check current auth status
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError) {
      return NextResponse.json({ error: 'Invalid token', details: authError }, { status: 401 });
    }

    return NextResponse.json({
      user: user ? { id: user.id, email: user.email } : null,
      session: !!user
    });

  } catch (error) {
    console.error('Test auth status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Testing signOut...');
    const { error } = await supabase.auth.signOut();
    console.log('SignOut result:', { error });
    
    if (error) {
      return NextResponse.json({ error: 'SignOut failed', details: error }, { status: 500 });
    }

    return NextResponse.json({ message: 'SignOut successful' });

  } catch (error) {
    console.error('Test signOut error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 