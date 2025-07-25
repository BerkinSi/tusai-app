import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabaseClient';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { status } = await request.json();

    // Validate status
    if (!['new', 'in_progress', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Update report status using service role to bypass RLS
    const { data: updatedReport, error } = await supabase
      .from('question_reports')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ 
        error: 'Failed to update report' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Report updated successfully' 
    });

  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json({ 
      error: 'Failed to update report' 
    }, { status: 500 });
  }
} 