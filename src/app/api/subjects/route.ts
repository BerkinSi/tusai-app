import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    console.log('API: /api/subjects - Starting GET request');
    
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('API: /api/subjects - No auth token provided');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Verify the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error('API: /api/subjects - Auth error:', authError);
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    console.log('API: /api/subjects - User authenticated:', user.id);

    // Fetch subjects from database
    const { data: subjects, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name');

    if (error) {
      console.error('API: /api/subjects - Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
    }

    console.log('API: /api/subjects - Successfully fetched subjects:', subjects?.length);
    return NextResponse.json(subjects || []);

  } catch (error) {
    console.error('API: /api/subjects - Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 