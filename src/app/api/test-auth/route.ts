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
    
    // Set the auth token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token', details: authError }, { status: 401 });
    }

    console.log('Authenticated user:', user.id);
    console.log('User email:', user.email);

    // Check if user exists in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    console.log('Profile lookup result:', { profile, profileError });

    // Check auth.users table
    const { data: authUser, error: authUserError } = await supabase
      .from('auth.users')
      .select('*')
      .eq('id', user.id)
      .single();

    console.log('Auth user lookup result:', { authUser, authUserError });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        hasProfile: !!profile,
        profile: profile,
        authUser: authUser
      }
    });

  } catch (error) {
    console.error('Test auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 