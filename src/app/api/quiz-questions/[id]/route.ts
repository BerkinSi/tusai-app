import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { data: question, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Quiz question not found' }, { status: 404 });
      }
      console.error('Error fetching quiz question:', error);
      return NextResponse.json({ error: 'Failed to fetch quiz question' }, { status: 500 });
    }

    // Verify quiz belongs to user
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('id')
      .eq('id', question.quiz_id)
      .eq('user_id', user.id)
      .single();

    if (quizError || !quiz) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ question });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { question_text, options, correct_option, user_answer, is_correct, explanation, subject } = body;

    // Validate required fields
    if (!question_text) {
      return NextResponse.json({ error: 'Question text is required' }, { status: 400 });
    }

    // First get the question to verify ownership
    const { data: existingQuestion, error: fetchError } = await supabase
      .from('quiz_questions')
      .select('quiz_id')
      .eq('id', params.id)
      .single();

    if (fetchError || !existingQuestion) {
      return NextResponse.json({ error: 'Quiz question not found' }, { status: 404 });
    }

    // Verify quiz belongs to user
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('id')
      .eq('id', existingQuestion.quiz_id)
      .eq('user_id', user.id)
      .single();

    if (quizError || !quiz) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { data: question, error } = await supabase
      .from('quiz_questions')
      .update({
        question_text,
        options: options || null,
        correct_option: correct_option || null,
        user_answer: user_answer || null,
        is_correct: is_correct || null,
        explanation: explanation || null,
        subject: subject || null
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating quiz question:', error);
      return NextResponse.json({ error: 'Failed to update quiz question' }, { status: 500 });
    }

    return NextResponse.json({ question });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // First get the question to verify ownership
    const { data: existingQuestion, error: fetchError } = await supabase
      .from('quiz_questions')
      .select('quiz_id')
      .eq('id', params.id)
      .single();

    if (fetchError || !existingQuestion) {
      return NextResponse.json({ error: 'Quiz question not found' }, { status: 404 });
    }

    // Verify quiz belongs to user
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('id')
      .eq('id', existingQuestion.quiz_id)
      .eq('user_id', user.id)
      .single();

    if (quizError || !quiz) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { error } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting quiz question:', error);
      return NextResponse.json({ error: 'Failed to delete quiz question' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Quiz question deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 