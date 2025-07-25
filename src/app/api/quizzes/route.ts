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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode');
    const subject = searchParams.get('subject');
    const limit = searchParams.get('limit');

    // Build query
    let query = supabase
      .from('quizzes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Apply filters
    if (mode) {
      query = query.eq('mode', mode);
    }
    if (subject) {
      query = query.contains('subjects', [subject]);
    }
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data: quizzes, error } = await query;

    if (error) {
      console.error('Error fetching quizzes:', error);
      return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 });
    }

    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { mode, subjects, score, total_questions, correct_count, mistake_count, completed_at } = body;

    // Validate required fields
    if (!mode) {
      return NextResponse.json({ error: 'Mode is required' }, { status: 400 });
    }

    const { data: quiz, error } = await supabase
      .from('quizzes')
      .insert({
        user_id: user.id,
        mode,
        subjects: subjects || [],
        score: score || null,
        total_questions: total_questions || null,
        correct_count: correct_count || null,
        mistake_count: mistake_count || null,
        completed_at: completed_at || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating quiz:', error);
      return NextResponse.json({ error: 'Failed to create quiz' }, { status: 500 });
    }

    return NextResponse.json({ quiz }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 