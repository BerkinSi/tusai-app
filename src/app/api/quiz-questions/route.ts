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
    const quiz_id = searchParams.get('quiz_id');
    const subject = searchParams.get('subject');

    if (!quiz_id) {
      return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 });
    }

    // Build query
    let query = supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quiz_id)
      .order('created_at', { ascending: true });

    // Apply filters
    if (subject) {
      query = query.eq('subject', subject);
    }

    const { data: questions, error } = await query;

    if (error) {
      console.error('Error fetching quiz questions:', error);
      return NextResponse.json({ error: 'Failed to fetch quiz questions' }, { status: 500 });
    }

    return NextResponse.json({ questions });
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
    const { quiz_id, question_text, options, correct_option, user_answer, is_correct, explanation, subject } = body;

    // Validate required fields
    if (!quiz_id || !question_text) {
      return NextResponse.json({ error: 'Quiz ID and question text are required' }, { status: 400 });
    }

    // Verify quiz belongs to user
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('id')
      .eq('id', quiz_id)
      .eq('user_id', user.id)
      .single();

    if (quizError || !quiz) {
      return NextResponse.json({ error: 'Quiz not found or access denied' }, { status: 404 });
    }

    const { data: question, error } = await supabase
      .from('quiz_questions')
      .insert({
        quiz_id,
        question_text,
        options: options || null,
        correct_option: correct_option || null,
        user_answer: user_answer || null,
        is_correct: is_correct || null,
        explanation: explanation || null,
        subject: subject || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating quiz question:', error);
      return NextResponse.json({ error: 'Failed to create quiz question' }, { status: 500 });
    }

    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 