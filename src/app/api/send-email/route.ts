import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function POST(request: NextRequest) {
  console.log('📧 /api/send-email - Starting POST request');
  
  try {
    // Get auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid auth token provided');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('🔑 Auth token received');

    // Verify user session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.log('❌ Auth error:', authError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('✅ User authenticated:', user.id);

    // Parse request body
    const body = await request.json();
    console.log('📝 Request body:', body);

    const { user_email, question_id, message, quiz_id, question_text } = body;

    if (!user_email || !question_id || !message) {
      console.log('❌ Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('📊 Report details:');
    console.log('  - User Email:', user_email);
    console.log('  - Question ID:', question_id);
    console.log('  - Message:', message);
    console.log('  - Quiz ID:', quiz_id);
    console.log('  - Question Text:', question_text);

    // Store report in database
    const { data: report, error: dbError } = await supabase
      .from('question_reports')
      .insert({
        user_id: user.id,
        user_email: user_email,
        question_id: question_id.toString(),
        subject: 'Genel', // Default subject since it's required
        message: message,
        status: 'pending'
      })
      .select()
      .single();

    if (dbError) {
      console.error('❌ Database error:', dbError);
      return NextResponse.json({ error: 'Failed to save report' }, { status: 500 });
    }

    console.log('✅ Report saved to database:', report.id);
    return NextResponse.json({ 
      success: true, 
      message: 'Bildirim başarıyla gönderildi',
      reportId: report.id
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 