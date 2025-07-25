import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No auth header' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Auth failed', details: authError });
    }

    // Test RLS by trying to insert a note
    const testNote = {
      user_id: user.id,
      title: 'RLS Test Note',
      content: 'Testing RLS policies',
      tags: ['test']
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('notes')
      .insert(testNote)
      .select();

    if (insertError) {
      return NextResponse.json({ 
        error: 'RLS test failed', 
        details: insertError,
        user: user.id 
      });
    }

    // Clean up
    if (insertResult && insertResult[0]) {
      await supabase.from('notes').delete().eq('id', insertResult[0].id);
    }

    return NextResponse.json({ 
      success: true, 
      user: user.id,
      rlsWorking: true 
    });

  } catch (error) {
    return NextResponse.json({ error: 'Test failed', details: error });
  }
} 