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

    console.log('Testing profile for user:', user.id);

    // Check if user exists in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      // Profile doesn't exist, create it
      console.log('Profile not found, creating one...');
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString(),
          is_premium: false
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        return NextResponse.json({ 
          error: 'Failed to create profile', 
          details: createError,
          user: { id: user.id, email: user.email }
        }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Profile created successfully',
        user: { id: user.id, email: user.email },
        profile: newProfile
      });
    }

    if (profileError) {
      console.error('Profile lookup error:', profileError);
      return NextResponse.json({ 
        error: 'Profile lookup failed', 
        details: profileError,
        user: { id: user.id, email: user.email }
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Profile exists',
      user: { id: user.id, email: user.email },
      profile: profile
    });

  } catch (error) {
    console.error('Test profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 