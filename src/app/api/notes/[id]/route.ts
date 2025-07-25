import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
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

    const { data: note, error } = await supabase
      .from('notes')
      .select(`
        *,
        subjects(name)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 });
      }
      console.error('Error fetching note:', error);
      return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 });
    }

    return NextResponse.json({ data: note });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // First, ensure user has a profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      // Profile doesn't exist, create it
      console.log('Profile not found, creating one...');
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString(),
          is_premium: false
        });

      if (createProfileError) {
        console.error('Error creating profile:', createProfileError);
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
      }
      console.log('Profile created successfully');
    }

    const body = await request.json();
    const { title, content, subject, customSubject, tags } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    let subjectId = null;

    if (subject === 'General') {
      subjectId = null;
    } else if (subject === 'Other' && customSubject) {
      // Create new subject
      const { data: newSubject, error: subjectError } = await supabase
        .from('subjects')
        .insert({ name: customSubject })
        .select()
        .single();

      if (subjectError) {
        console.error('Error creating subject:', subjectError);
        return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
      }

      subjectId = newSubject.id;
    } else if (subject && subject !== 'Other') {
      // Find existing subject
      const { data: existingSubject, error: subjectError } = await supabase
        .from('subjects')
        .select('id')
        .eq('name', subject)
        .single();

      if (subjectError) {
        console.error('Subject not found:', subject);
        return NextResponse.json({ error: 'Invalid subject selected' }, { status: 400 });
      }

      subjectId = existingSubject.id;
    }

    const { data: note, error: updateError } = await supabase
      .from('notes')
      .update({
        title,
        content,
        subject_id: subjectId,
        tags: tags || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating note:', updateError);
      return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
    }

    return NextResponse.json({ data: note });
  } catch (error) {
    console.error('Error in PUT /api/notes/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting note:', error);
      return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 